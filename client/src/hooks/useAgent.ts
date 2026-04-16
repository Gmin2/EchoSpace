import { useAppStore } from '../stores/appStore';
import { updateMemoryConnections, updateMemoryTags } from './useMemories';
import { playAudioBase64 } from '../lib/audio';
import type { AgentContext, VoiceResponse, ChatResponse, AgentAction } from '../types/agent';

const API_BASE = '/api';

function buildContext(spaceId: string, spaceName: string, memories: any[]): AgentContext {
  return {
    spaceId,
    spaceName,
    memories: memories.map((m) => ({
      id: m.id,
      title: m.title,
      content: m.content,
      type: m.type,
      tags: m.tags,
      position: m.position,
    })),
  };
}

async function dispatchActions(actions: AgentAction[]) {
  for (const action of actions) {
    switch (action.type) {
      case 'connect_memories': {
        const ids = (action.payload.ids as string[]) || [];
        // Connect each memory to all others in the list
        for (const id of ids) {
          const others = ids.filter((oid) => oid !== id);
          await updateMemoryConnections(id, others);
        }
        break;
      }
      case 'suggest_tags': {
        const memoryId = action.payload.memoryId as string;
        const tags = action.payload.tags as string[];
        if (memoryId && tags) {
          await updateMemoryTags(memoryId, tags);
        }
        break;
      }
      case 'generate_image': {
        const prompt = action.payload.prompt as string;
        if (prompt) {
          const mockMode = useAppStore.getState().mockMode;
          const headers: Record<string, string> = { 'Content-Type': 'application/json' };
          if (mockMode) headers['X-Mock-Mode'] = 'true';

          const res = await fetch(`${API_BASE}/image`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ prompt }),
          });
          const data = await res.json();
          // The caller can use data.imageUrl
          console.log('Generated image:', data.imageUrl?.slice(0, 50));
        }
        break;
      }
      default:
        break;
    }
  }
}

export async function sendVoiceMessage(
  audioBase64: string,
  spaceId: string,
  spaceName: string,
  memories: any[]
): Promise<VoiceResponse | null> {
  const store = useAppStore.getState();
  const context = buildContext(spaceId, spaceName, memories);

  store.setAgentLoading(true);
  store.addAgentMessage({ role: 'user', content: '🎤 Voice message' });

  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (store.mockMode) headers['X-Mock-Mode'] = 'true';

    const res = await fetch(`${API_BASE}/voice`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ audioBase64, context }),
    });

    const data: VoiceResponse = await res.json();

    store.addAgentMessage({
      role: 'agent',
      content: data.agentText,
      audioBase64: data.agentAudioBase64,
    });

    // Play agent audio
    if (data.agentAudioBase64) {
      store.setIsAgentSpeaking(true);
      await playAudioBase64(data.agentAudioBase64);
      store.setIsAgentSpeaking(false);
    }

    // Dispatch actions
    await dispatchActions(data.actions);

    return data;
  } catch (err) {
    console.error('Voice request failed:', err);
    store.addAgentMessage({ role: 'agent', content: 'Sorry, something went wrong.' });
    return null;
  } finally {
    store.setAgentLoading(false);
  }
}

export async function sendChatMessage(
  message: string,
  spaceId: string,
  spaceName: string,
  memories: any[]
): Promise<void> {
  const store = useAppStore.getState();
  const context = buildContext(spaceId, spaceName, memories);

  store.setAgentLoading(true);
  store.addAgentMessage({ role: 'user', content: message });

  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (store.mockMode) headers['X-Mock-Mode'] = 'true';

    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ message, context }),
    });

    const data: ChatResponse = await res.json();

    store.addAgentMessage({ role: 'agent', content: data.data.message });

    // Dispatch actions
    await dispatchActions(data.data.actions);
  } catch (err) {
    console.error('Chat request failed:', err);
    store.addAgentMessage({ role: 'agent', content: 'Sorry, something went wrong.' });
  } finally {
    store.setAgentLoading(false);
  }
}
