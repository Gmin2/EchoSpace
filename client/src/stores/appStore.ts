import { create } from 'zustand';

interface AgentMessage {
  role: 'user' | 'agent';
  content: string;
  audioBase64?: string;
  timestamp: number;
}

interface AppStore {
  // Current space
  currentSpaceId: string | null;
  setCurrentSpaceId: (id: string | null) => void;

  // Point cloud (hot path — updated at 10 FPS, read in useFrame)
  pointCloudPositions: Float32Array;
  pointCloudColors: Float32Array;
  pointCloudCount: number;
  updatePointCloud: (positions: Float32Array, colors: Float32Array, count: number) => void;

  // Room model (GLB from scan)
  roomModelUrl: string | null;
  setRoomModelUrl: (url: string | null) => void;

  // UI
  selectedAnchorId: string | null;
  setSelectedAnchorId: (id: string | null) => void;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  mockMode: boolean;
  toggleMockMode: () => void;

  // Voice
  isRecording: boolean;
  setIsRecording: (v: boolean) => void;
  isAgentSpeaking: boolean;
  setIsAgentSpeaking: (v: boolean) => void;

  // Agent
  agentMessages: AgentMessage[];
  agentLoading: boolean;
  addAgentMessage: (msg: Omit<AgentMessage, 'timestamp'>) => void;
  setAgentLoading: (v: boolean) => void;
  clearAgentMessages: () => void;
}

export const useAppStore = create<AppStore>((set) => ({
  currentSpaceId: null,
  setCurrentSpaceId: (id) => set({ currentSpaceId: id, selectedAnchorId: null }),

  pointCloudPositions: new Float32Array(0),
  pointCloudColors: new Float32Array(0),
  pointCloudCount: 0,
  updatePointCloud: (positions, colors, count) =>
    set({ pointCloudPositions: positions, pointCloudColors: colors, pointCloudCount: count }),

  roomModelUrl: null,
  setRoomModelUrl: (url) => set({ roomModelUrl: url }),

  selectedAnchorId: null,
  setSelectedAnchorId: (id) => set({ selectedAnchorId: id }),
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  mockMode: false, // always live
  toggleMockMode: () => set((s) => ({ mockMode: !s.mockMode })),

  isRecording: false,
  setIsRecording: (v) => set({ isRecording: v }),
  isAgentSpeaking: false,
  setIsAgentSpeaking: (v) => set({ isAgentSpeaking: v }),

  agentMessages: [],
  agentLoading: false,
  addAgentMessage: (msg) =>
    set((s) => ({ agentMessages: [...s.agentMessages, { ...msg, timestamp: Date.now() }] })),
  setAgentLoading: (v) => set({ agentLoading: v }),
  clearAgentMessages: () => set({ agentMessages: [] }),
}));
