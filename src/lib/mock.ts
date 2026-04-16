import type { AgentContext, AgentResponse, VoiceResponse } from '../types/agent';

export function mockVoiceResponse(context: AgentContext): VoiceResponse {
  const memoryCount = context.memories.length;
  const firstTwo = context.memories.slice(0, 2);

  return {
    transcript: '(mock) User said something about their memories',
    agentText: `I can see ${memoryCount} memories in your ${context.spaceName}. ${
      firstTwo.length >= 2
        ? `I notice "${firstTwo[0].title}" and "${firstTwo[1].title}" might be related.`
        : 'Try adding more memories so I can find connections!'
    }`,
    agentAudioBase64: '', // empty in mock mode — no audio playback
    actions:
      firstTwo.length >= 2
        ? [
            {
              type: 'connect_memories',
              payload: { ids: [firstTwo[0].id, firstTwo[1].id] },
              explanation: 'These memories share similar themes',
            },
          ]
        : [],
  };
}

export function mockChatResponse(context: AgentContext): AgentResponse {
  const memoryCount = context.memories.length;
  return {
    message: `I can see ${memoryCount} memories in "${context.spaceName}". What would you like to know?`,
    actions: [],
  };
}

export function mockImageResponse(): string {
  // 1x1 cyan pixel as base64 PNG placeholder
  return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
}
