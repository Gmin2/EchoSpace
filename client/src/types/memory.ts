import type { SpatialPosition } from './anchor';

export type MemoryType = 'text' | 'voice' | 'image' | 'ai-generated';

export interface Memory {
  id: string;
  anchorId: string;
  spaceId: string;
  type: MemoryType;
  title: string;
  content: string;
  imageUrl?: string;
  audioData?: ArrayBuffer;
  agentAudioData?: ArrayBuffer;
  tags: string[];
  connections: string[];
  position: SpatialPosition;
  createdAt: number;
  updatedAt: number;
  color: string;
}
