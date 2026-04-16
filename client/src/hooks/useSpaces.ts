import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import type { Space } from '../types/space';

export function useSpaces() {
  const spaces = useLiveQuery(() => db.spaces.orderBy('updatedAt').reverse().toArray(), []);
  return spaces ?? [];
}

export async function createSpace(name: string, description?: string): Promise<Space> {
  const space: Space = {
    id: crypto.randomUUID(),
    name,
    description,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  await db.spaces.add(space);
  return space;
}

export async function deleteSpace(id: string): Promise<void> {
  await db.transaction('rw', [db.spaces, db.scans, db.anchors, db.memories], async () => {
    await db.memories.where('spaceId').equals(id).delete();
    await db.anchors.where('spaceId').equals(id).delete();
    await db.scans.where('spaceId').equals(id).delete();
    await db.spaces.delete(id);
  });
}

export async function updateSpace(id: string, updates: Partial<Pick<Space, 'name' | 'description' | 'scanId'>>): Promise<void> {
  await db.spaces.update(id, { ...updates, updatedAt: Date.now() });
}
