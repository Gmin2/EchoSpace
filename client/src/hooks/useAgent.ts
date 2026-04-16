import { useAppStore } from '../stores/appStore';
import { createAnchor, createMemory, updateMemoryConnections, updateMemoryTags } from './useMemories';
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

async function dispatchActions(actions: AgentAction[], spaceId: string) {
  for (const action of actions) {
    const type = action.type.toLowerCase();

    switch (type) {
      case 'create_memory': {
        const content = action.payload.content as string;
        const title = action.payload.title as string;
        const position = action.payload.position as { x: number; y: number; z: number };
        if (content && position) {
          const anchor = await createAnchor(spaceId, position);
          await createMemory(anchor.id, spaceId, content, 'text', position, { title });
          console.log('Agent created memory:', title);
        }
        break;
      }
      case 'connect_memories': {
        const ids = (action.payload.ids as string[]) || [];
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
          const res = await fetch(`${API_BASE}/image`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt }),
          });
          const data = await res.json();
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
    const res = await fetch(`${API_BASE}/voice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ audioBase64, context }),
    });

    const data: VoiceResponse = await res.json();

    // Safety: if agentText is still JSON, extract it
    let voiceMsg = data.agentText;
    let voiceActions = data.actions || [];
    try {
      if (voiceMsg.startsWith('{')) {
        const parsed = JSON.parse(voiceMsg);
        if (parsed.message) voiceMsg = parsed.message;
        if (Array.isArray(parsed.actions)) voiceActions = parsed.actions;
      }
    } catch { /* already plain text */ }
    data.agentText = voiceMsg;
    data.actions = voiceActions;

    store.addAgentMessage({
      role: 'agent',
      content: voiceMsg,
      audioBase64: data.agentAudioBase64,
    });

    if (data.agentAudioBase64) {
      store.setIsAgentSpeaking(true);
      await playAudioBase64(data.agentAudioBase64, 'mp3');
      store.setIsAgentSpeaking(false);
    }

    await dispatchActions(data.actions, spaceId);
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
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, context }),
    });

    const data = await res.json();
    const chatData = data.data || {};
    const audioBase64 = data.audioBase64 || '';

    // Safety: if message is still JSON, extract it
    let agentMsg = chatData.message || '';
    let actions = chatData.actions || [];
    try {
      if (agentMsg.startsWith('{')) {
        const parsed = JSON.parse(agentMsg);
        if (parsed.message) agentMsg = parsed.message;
        if (Array.isArray(parsed.actions)) actions = parsed.actions;
      }
    } catch { /* already plain text */ }

    store.addAgentMessage({ role: 'agent', content: agentMsg, audioBase64 });

    // Play agent voice
    if (audioBase64) {
      store.setIsAgentSpeaking(true);
      await playAudioBase64(audioBase64, 'mp3');
      store.setIsAgentSpeaking(false);
    }

    await dispatchActions(actions, spaceId);
  } catch (err) {
    console.error('Chat request failed:', err);
    store.addAgentMessage({ role: 'agent', content: 'Sorry, something went wrong.' });
  } finally {
    store.setAgentLoading(false);
  }
}
