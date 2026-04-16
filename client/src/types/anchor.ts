export interface SpatialPosition {
  x: number;
  y: number;
  z: number;
}

export interface Anchor {
  id: string;
  spaceId: string;
  position: SpatialPosition;
  memoryIds: string[];
  createdAt: number;
}
