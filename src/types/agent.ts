export interface SpatialPosition {
  x: number;
  y: number;
  z: number;
}

export interface AgentContext {
  spaceId: string;
  spaceName: string;
  memories: {
    id: string;
    title: string;
    content: string;
    type: string;
    tags: string[];
    position: SpatialPosition;
  }[];
  cameraPosition?: SpatialPosition;
  nearestAnchorIds?: string[];
}

export type AgentActionType =
  | 'create_memory'
  | 'connect_memories'
  | 'generate_image'
  | 'suggest_tags'
  | 'narrate'
  | 'answer';

export interface AgentAction {
  type: AgentActionType;
  payload: Record<string, unknown>;
  explanation: string;
}

export interface AgentResponse {
  message: string;
  actions: AgentAction[];
}

export interface VoiceRequest {
  audioBase64: string;
  context: AgentContext;
}

export interface VoiceResponse {
  transcript: string;
  agentText: string;
  agentAudioBase64: string;
  actions: AgentAction[];
}

export interface ChatRequest {
  message: string;
  context: AgentContext;
}

export interface ChatResponse {
  data: AgentResponse;
}

export interface ImageRequest {
  prompt: string;
}

export interface ImageResponse {
  imageUrl: string;
}
