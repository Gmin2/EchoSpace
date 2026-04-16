export interface RoomScan {
  id: string;
  spaceId: string;
  pointPositions: ArrayBuffer;
  pointColors: ArrayBuffer;
  pointCount: number;
  width: number;
  height: number;
  createdAt: number;
}
