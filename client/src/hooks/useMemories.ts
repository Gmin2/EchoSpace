import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import type { Anchor, SpatialPosition } from '../types/anchor';
import type { Memory, MemoryType } from '../types/memory';
import type { RoomScan } from '../types/scan';

// Color palette for memory cards
const COLORS = ['#00ffff', '#ff00ff', '#00ff88', '#ffaa00', '#ff3366', '#6644ff', '#44ffcc'];
let colorIndex = 0;
function nextColor(): string {
  const c = COLORS[colorIndex % COLORS.length];
  colorIndex++;
  return c;
}

// Anchors
export function useAnchors(spaceId: string | null) {
  return useLiveQuery(
    () => (spaceId ? db.anchors.where('spaceId').equals(spaceId).toArray() : []),
    [spaceId],
    []
  );
}

export async function createAnchor(spaceId: string, position: SpatialPosition): Promise<Anchor> {
  const anchor: Anchor = {
    id: crypto.randomUUID(),
    spaceId,
    position,
    memoryIds: [],
    createdAt: Date.now(),
  };
  await db.anchors.add(anchor);
  return anchor;
}

// Memories
export function useMemories(spaceId: string | null) {
  return useLiveQuery(
    () => (spaceId ? db.memories.where('spaceId').equals(spaceId).toArray() : []),
    [spaceId],
    []
  );
}

export async function createMemory(
  anchorId: string,
  spaceId: string,
  content: string,
  type: MemoryType = 'text',
  position: SpatialPosition,
  extras?: { title?: string; imageUrl?: string; audioData?: ArrayBuffer }
): Promise<Memory> {
  const memory: Memory = {
    id: crypto.randomUUID(),
    anchorId,
    spaceId,
    type,
    title: extras?.title || content.slice(0, 50),
    content,
    imageUrl: extras?.imageUrl,
    audioData: extras?.audioData,
    tags: [],
    connections: [],
    position,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    color: nextColor(),
  };
  await db.memories.add(memory);

  // Update anchor's memoryIds
  const anchor = await db.anchors.get(anchorId);
  if (anchor) {
    await db.anchors.update(anchorId, {
      memoryIds: [...anchor.memoryIds, memory.id],
    });
  }

  return memory;
}

export async function updateMemoryConnections(memoryId: string, connectionIds: string[]): Promise<void> {
  await db.memories.update(memoryId, { connections: connectionIds, updatedAt: Date.now() });
}

export async function updateMemoryTags(memoryId: string, tags: string[]): Promise<void> {
  await db.memories.update(memoryId, { tags, updatedAt: Date.now() });
}

export async function deleteMemory(memoryId: string): Promise<void> {
  const memory = await db.memories.get(memoryId);
  if (memory) {
    // Remove from anchor's memoryIds
    const anchor = await db.anchors.get(memory.anchorId);
    if (anchor) {
      await db.anchors.update(memory.anchorId, {
        memoryIds: anchor.memoryIds.filter((id) => id !== memoryId),
      });
    }
    await db.memories.delete(memoryId);
  }
}

// Scans
export async function saveScan(
  spaceId: string,
  positions: Float32Array,
  colors: Float32Array,
  count: number,
  width: number,
  height: number
): Promise<RoomScan> {
  const scan: RoomScan = {
    id: crypto.randomUUID(),
    spaceId,
    pointPositions: positions.slice().buffer,
    pointColors: colors.slice().buffer,
    pointCount: count,
    width,
    height,
    createdAt: Date.now(),
  };
  await db.scans.add(scan);
  await db.spaces.update(spaceId, { scanId: scan.id, updatedAt: Date.now() });
  return scan;
}

export function useScan(spaceId: string | null) {
  return useLiveQuery(
    () => (spaceId ? db.scans.where('spaceId').equals(spaceId).first() : undefined),
    [spaceId]
  );
}
