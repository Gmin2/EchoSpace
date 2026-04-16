import Dexie, { type Table } from 'dexie';
import type { Space } from '../types/space';
import type { RoomScan } from '../types/scan';
import type { Anchor } from '../types/anchor';
import type { Memory } from '../types/memory';

class EchoSpaceDB extends Dexie {
  spaces!: Table<Space, string>;
  scans!: Table<RoomScan, string>;
  anchors!: Table<Anchor, string>;
  memories!: Table<Memory, string>;

  constructor() {
    super('echospace');
    this.version(2).stores({
      spaces: 'id, createdAt, updatedAt',
      scans: 'id, spaceId, createdAt',
      anchors: 'id, spaceId, createdAt',
      memories: 'id, anchorId, spaceId, type, createdAt, *tags',
    });
  }
}

export const db = new EchoSpaceDB();
