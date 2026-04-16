import type { Anchor } from '../types/anchor';
import type { Memory } from '../types/memory';

// Helper: add a point on a flat surface with slight noise
function addSurfacePoint(
  positions: Float32Array, colors: Float32Array, idx: number,
  x: number, y: number, z: number,
  r: number, g: number, b: number,
  noise = 0.01
) {
  const i = idx * 3;
  positions[i]     = x + (Math.random() - 0.5) * noise;
  positions[i + 1] = y + (Math.random() - 0.5) * noise;
  positions[i + 2] = z + (Math.random() - 0.5) * noise;
  colors[i]     = r + (Math.random() - 0.5) * 0.05;
  colors[i + 1] = g + (Math.random() - 0.5) * 0.05;
  colors[i + 2] = b + (Math.random() - 0.5) * 0.05;
}

/**
 * Generate a realistic-looking room point cloud with dense surfaces.
 * Room is 8m wide, 4m tall, 6m deep. Origin at center.
 */
export function generateMockRoomCloud(pointCount = 30000) {
  const positions = new Float32Array(pointCount * 3);
  const colors = new Float32Array(pointCount * 3);

  const W = 4, H = 2, D = 3; // half-dimensions

  let idx = 0;
  const addPoints = (count: number, fn: (i: number) => void) => {
    for (let i = 0; i < count && idx < pointCount; i++) {
      fn(i);
      idx++;
    }
  };

  // Floor — dense flat plane, warm gray
  addPoints(Math.floor(pointCount * 0.2), () => {
    const x = (Math.random() - 0.5) * W * 2;
    const z = (Math.random() - 0.5) * D * 2;
    addSurfacePoint(positions, colors, idx, x, -H, z, 0.18, 0.16, 0.22, 0.015);
  });

  // Ceiling — flat plane, slightly lighter
  addPoints(Math.floor(pointCount * 0.1), () => {
    const x = (Math.random() - 0.5) * W * 2;
    const z = (Math.random() - 0.5) * D * 2;
    addSurfacePoint(positions, colors, idx, x, H, z, 0.25, 0.24, 0.28, 0.015);
  });

  // Back wall — dense flat plane
  addPoints(Math.floor(pointCount * 0.15), () => {
    const x = (Math.random() - 0.5) * W * 2;
    const y = -H + Math.random() * H * 2;
    addSurfacePoint(positions, colors, idx, x, y, -D, 0.2, 0.22, 0.28, 0.012);
  });

  // Left wall
  addPoints(Math.floor(pointCount * 0.1), () => {
    const y = -H + Math.random() * H * 2;
    const z = (Math.random() - 0.5) * D * 2;
    addSurfacePoint(positions, colors, idx, -W, y, z, 0.22, 0.2, 0.25, 0.012);
  });

  // Right wall
  addPoints(Math.floor(pointCount * 0.1), () => {
    const y = -H + Math.random() * H * 2;
    const z = (Math.random() - 0.5) * D * 2;
    addSurfacePoint(positions, colors, idx, W, y, z, 0.22, 0.2, 0.25, 0.012);
  });

  // Desk — solid rectangular block (top surface + front face + sides)
  const deskX = 1, deskZ = -1.5, deskW = 1.5, deskD = 0.7, deskH = -0.6;
  // Desk top
  addPoints(Math.floor(pointCount * 0.08), () => {
    const x = deskX + (Math.random() - 0.5) * deskW * 2;
    const z = deskZ + (Math.random() - 0.5) * deskD * 2;
    addSurfacePoint(positions, colors, idx, x, deskH, z, 0.35, 0.25, 0.15, 0.008);
  });
  // Desk front face
  addPoints(Math.floor(pointCount * 0.03), () => {
    const x = deskX + (Math.random() - 0.5) * deskW * 2;
    const y = -H + Math.random() * (deskH + H);
    addSurfacePoint(positions, colors, idx, x, y, deskZ + deskD, 0.3, 0.22, 0.12, 0.008);
  });

  // Monitor on desk
  const monX = 1, monZ = deskZ - 0.3, monW = 0.4, monH2 = 0.5;
  addPoints(Math.floor(pointCount * 0.04), () => {
    const x = monX + (Math.random() - 0.5) * monW * 2;
    const y = deskH + 0.05 + Math.random() * monH2;
    addSurfacePoint(positions, colors, idx, x, y, monZ, 0.05, 0.08, 0.12, 0.005);
  });

  // Chair — simple cylindrical shape
  const chairX = 1, chairZ = -0.5;
  addPoints(Math.floor(pointCount * 0.04), () => {
    const angle = Math.random() * Math.PI * 2;
    const r = 0.25 + Math.random() * 0.05;
    const x = chairX + Math.cos(angle) * r;
    const z = chairZ + Math.sin(angle) * r;
    const y = -H + Math.random() * 1.2;
    addSurfacePoint(positions, colors, idx, x, y, z, 0.15, 0.15, 0.18, 0.015);
  });

  // Bookshelf on left wall
  addPoints(Math.floor(pointCount * 0.06), () => {
    const x = -W + 0.15 + Math.random() * 0.3;
    const y = -H + 0.3 + Math.random() * 2.5;
    const z = -1 + (Math.random() - 0.5) * 1.5;
    // Shelves at intervals
    const shelfY = Math.round(y * 3) / 3;
    const isShelf = Math.abs(y - shelfY) < 0.04;
    if (isShelf) {
      addSurfacePoint(positions, colors, idx, x, shelfY, z, 0.3, 0.22, 0.12, 0.01);
    } else {
      addSurfacePoint(positions, colors, idx, x, y, z, 0.25, 0.15, 0.08, 0.02);
    }
  });

  // Window frame on back wall (rectangular outline, brighter)
  addPoints(Math.floor(pointCount * 0.03), () => {
    const wx = -1.5, wy = 0.2, ww = 1.0, wh = 0.8;
    const side = Math.floor(Math.random() * 4);
    let x: number, y: number;
    if (side === 0) { x = wx + (Math.random() - 0.5) * ww * 2; y = wy + wh; }      // top
    else if (side === 1) { x = wx + (Math.random() - 0.5) * ww * 2; y = wy - wh; }  // bottom
    else if (side === 2) { x = wx - ww; y = wy + (Math.random() - 0.5) * wh * 2; }  // left
    else { x = wx + ww; y = wy + (Math.random() - 0.5) * wh * 2; }                   // right
    addSurfacePoint(positions, colors, idx, x, y, -D + 0.01, 0.5, 0.55, 0.6, 0.008);
  });
  // Window glass (slight blue tint, very flat)
  addPoints(Math.floor(pointCount * 0.04), () => {
    const x = -1.5 + (Math.random() - 0.5) * 1.8;
    const y = 0.2 + (Math.random() - 0.5) * 1.4;
    addSurfacePoint(positions, colors, idx, x, y, -D + 0.005, 0.15, 0.2, 0.35, 0.003);
  });

  // Fill remaining with slight ambient scatter (dust particles, light effects)
  while (idx < pointCount) {
    const x = (Math.random() - 0.5) * W * 1.8;
    const y = -H + 0.1 + Math.random() * (H * 2 - 0.2);
    const z = (Math.random() - 0.5) * D * 1.8;
    addSurfacePoint(positions, colors, idx, x, y, z, 0.12, 0.12, 0.15, 0.0);
    // Make scatter very transparent by using darker colors
    const i = idx * 3;
    colors[i] *= 0.3;
    colors[i + 1] *= 0.3;
    colors[i + 2] *= 0.3;
    idx++;
  }

  return { positions, colors, count: pointCount };
}

/**
 * Mock anchors for demo.
 */
export function generateMockAnchors(spaceId: string): Anchor[] {
  return [
    { id: 'anchor-desk', spaceId, position: { x: 1, y: -0.3, z: -1.5 }, memoryIds: ['mem-1', 'mem-2'], createdAt: Date.now() },
    { id: 'anchor-wall', spaceId, position: { x: -1.5, y: 0.2, z: -2.8 }, memoryIds: ['mem-3'], createdAt: Date.now() },
    { id: 'anchor-shelf', spaceId, position: { x: -3.5, y: 0.5, z: -1 }, memoryIds: ['mem-4'], createdAt: Date.now() },
  ];
}

/**
 * Mock memories for demo.
 */
export function generateMockMemories(spaceId: string): Memory[] {
  const now = Date.now();
  return [
    {
      id: 'mem-1', anchorId: 'anchor-desk', spaceId, type: 'text',
      title: 'Q3 Budget Review', content: 'Review the Q3 budget numbers with Priya before Friday standup',
      tags: ['work', 'budget'], connections: ['mem-2'], position: { x: 1, y: -0.3, z: -1.5 },
      createdAt: now - 3600000, updatedAt: now - 3600000, color: '#00ffff',
    },
    {
      id: 'mem-2', anchorId: 'anchor-desk', spaceId, type: 'text',
      title: 'Email Priya', content: 'Send the proposal draft to Priya — she needs it by Thursday',
      tags: ['work', 'email'], connections: ['mem-1'], position: { x: 1.5, y: -0.1, z: -1.2 },
      createdAt: now - 1800000, updatedAt: now - 1800000, color: '#ff00ff',
    },
    {
      id: 'mem-3', anchorId: 'anchor-wall', spaceId, type: 'text',
      title: 'Hackathon Ideas', content: 'EchoSpace — spatial memory with 3D scan + voice + AI agent',
      tags: ['hackathon', 'ideas'], connections: [], position: { x: -1.5, y: 0.2, z: -2.8 },
      createdAt: now - 7200000, updatedAt: now - 7200000, color: '#00ff88',
    },
    {
      id: 'mem-4', anchorId: 'anchor-shelf', spaceId, type: 'text',
      title: 'Call Mom', content: 'Call Mom about her birthday plans — book restaurant',
      tags: ['personal'], connections: [], position: { x: -3.5, y: 0.5, z: -1 },
      createdAt: now - 86400000, updatedAt: now - 86400000, color: '#ffaa00',
    },
  ];
}
