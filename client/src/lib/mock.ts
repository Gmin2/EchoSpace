import type { Anchor } from '../types/anchor';
import type { Memory } from '../types/memory';

/**
 * Generate a mock room-shaped point cloud (box with some furniture bumps).
 */
export function generateMockRoomCloud(pointCount = 20000) {
  const positions = new Float32Array(pointCount * 3);
  const colors = new Float32Array(pointCount * 3);

  for (let i = 0; i < pointCount; i++) {
    const idx = i * 3;
    const r = Math.random();

    if (r < 0.3) {
      // Floor
      positions[idx] = (Math.random() - 0.5) * 8;
      positions[idx + 1] = -2;
      positions[idx + 2] = (Math.random() - 0.5) * 6;
    } else if (r < 0.5) {
      // Back wall
      positions[idx] = (Math.random() - 0.5) * 8;
      positions[idx + 1] = (Math.random() - 0.5) * 4;
      positions[idx + 2] = -3;
    } else if (r < 0.65) {
      // Left wall
      positions[idx] = -4;
      positions[idx + 1] = (Math.random() - 0.5) * 4;
      positions[idx + 2] = (Math.random() - 0.5) * 6;
    } else if (r < 0.8) {
      // Right wall
      positions[idx] = 4;
      positions[idx + 1] = (Math.random() - 0.5) * 4;
      positions[idx + 2] = (Math.random() - 0.5) * 6;
    } else if (r < 0.9) {
      // Desk (box shape)
      positions[idx] = (Math.random() - 0.5) * 2 + 1;
      positions[idx + 1] = -1 + Math.random() * 0.1;
      positions[idx + 2] = (Math.random() - 0.5) * 1;
    } else {
      // Random scatter (ceiling, objects)
      positions[idx] = (Math.random() - 0.5) * 8;
      positions[idx + 1] = 2 + Math.random() * 0.2;
      positions[idx + 2] = (Math.random() - 0.5) * 6;
    }

    // Color by height: floor=dark blue, mid=cyan, top=light
    const height = (positions[idx + 1] + 2) / 4; // normalize 0-1
    colors[idx] = 0.0 + height * 0.2;       // R
    colors[idx + 1] = 0.6 + height * 0.4;   // G
    colors[idx + 2] = 0.9 + height * 0.1;   // B
  }

  return { positions, colors, count: pointCount };
}

/**
 * Mock anchors for demo.
 */
export function generateMockAnchors(spaceId: string): Anchor[] {
  return [
    { id: 'anchor-desk', spaceId, position: { x: 1, y: -0.5, z: 0 }, memoryIds: ['mem-1', 'mem-2'], createdAt: Date.now() },
    { id: 'anchor-wall', spaceId, position: { x: -2, y: 0, z: -2.5 }, memoryIds: ['mem-3'], createdAt: Date.now() },
    { id: 'anchor-corner', spaceId, position: { x: 3, y: -0.5, z: 2 }, memoryIds: ['mem-4'], createdAt: Date.now() },
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
      tags: ['work', 'budget'], connections: ['mem-2'], position: { x: 1, y: -0.5, z: 0 },
      createdAt: now - 3600000, updatedAt: now - 3600000, color: '#00ffff',
    },
    {
      id: 'mem-2', anchorId: 'anchor-desk', spaceId, type: 'text',
      title: 'Email Priya', content: 'Send the proposal draft to Priya — she needs it by Thursday',
      tags: ['work', 'email'], connections: ['mem-1'], position: { x: 1.5, y: -0.3, z: 0.3 },
      createdAt: now - 1800000, updatedAt: now - 1800000, color: '#ff00ff',
    },
    {
      id: 'mem-3', anchorId: 'anchor-wall', spaceId, type: 'text',
      title: 'Hackathon Ideas', content: 'EchoSpace — spatial memory with 3D scan + voice + AI agent',
      tags: ['hackathon', 'ideas'], connections: [], position: { x: -2, y: 0, z: -2.5 },
      createdAt: now - 7200000, updatedAt: now - 7200000, color: '#00ff88',
    },
    {
      id: 'mem-4', anchorId: 'anchor-corner', spaceId, type: 'text',
      title: 'Call Mom', content: 'Call Mom about her birthday plans — book restaurant',
      tags: ['personal'], connections: [], position: { x: 3, y: -0.5, z: 2 },
      createdAt: now - 86400000, updatedAt: now - 86400000, color: '#ffaa00',
    },
  ];
}
