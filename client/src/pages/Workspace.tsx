import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mic, Send, Plus } from 'lucide-react';
import { useAppStore } from '../stores/appStore';
import SceneCanvas from '../components/scene/SceneCanvas';
import AddMemoryPopup from '../components/hud/AddMemoryPopup';
import ScanUI from '../components/webcam/ScanUI';
import { createAnchor, createMemory, useMemories } from '../hooks/useMemories';
import { sendChatMessage } from '../hooks/useAgent';
import { startRecording, stopRecording } from '../lib/audio';
import { db } from '../lib/db';
import type { SpatialPosition } from '../types/anchor';

export default function Workspace() {
  const { spaceId } = useParams();
  const navigate = useNavigate();
  const currentSpaceId = useAppStore((s) => s.currentSpaceId);
  const updatePointCloud = useAppStore((s) => s.updatePointCloud);
  const agentMessages = useAppStore((s) => s.agentMessages);
  const agentLoading = useAppStore((s) => s.agentLoading);
  const isRecording = useAppStore((s) => s.isRecording);
  const memories = useMemories(currentSpaceId);

  const [pendingAnchorPos, setPendingAnchorPos] = useState<SpatialPosition | null>(null);
  const [showScan, setShowScan] = useState(false);
  const [input, setInput] = useState('');
  const [spaceName, setSpaceName] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (spaceId && spaceId !== currentSpaceId) {
      loadSpace(spaceId);
    }
  }, [spaceId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [agentMessages]);

  const loadSpace = async (id: string) => {
    const space = await db.spaces.get(id);
    if (!space) {
      navigate('/spaces');
      return;
    }
    setSpaceName(space.name);
    const scan = await db.scans.where('spaceId').equals(id).first();
    if (scan) {
      const positions = new Float32Array(scan.pointPositions);
      const colors = new Float32Array(scan.pointColors);
      updatePointCloud(positions, colors, scan.pointCount);
    } else {
      updatePointCloud(new Float32Array(0), new Float32Array(0), 0);
    }
    useAppStore.getState().setCurrentSpaceId(id);
  };

  const handlePlaceAnchor = (position: SpatialPosition) => {
    setPendingAnchorPos(position);
  };

  const handleSaveMemory = async (title: string, content: string) => {
    if (!pendingAnchorPos || !currentSpaceId) return;
    const anchor = await createAnchor(currentSpaceId, pendingAnchorPos);
    await createMemory(anchor.id, currentSpaceId, content || title, 'text', pendingAnchorPos, { title });
    setPendingAnchorPos(null);
  };

  const handleModelReady = (glbUrl: string) => {
    useAppStore.getState().setRoomModelUrl(glbUrl);
    setShowScan(false);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !currentSpaceId || agentLoading) return;
    const msg = input.trim();
    setInput('');
    await sendChatMessage(msg, currentSpaceId, spaceName, memories);
  };

  const handleMic = async () => {
    if (isRecording) {
      useAppStore.getState().setIsRecording(false);
      try {
        const { audioBase64 } = await stopRecording();
        if (currentSpaceId) {
          // Show processing state
          useAppStore.getState().addAgentMessage({ role: 'user', content: '🎤 Processing voice...' });
          useAppStore.getState().setAgentLoading(true);

          const res = await fetch('/api/voice', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              audioBase64,
              context: {
                spaceId: currentSpaceId,
                spaceName,
                memories: memories.map(m => ({ id: m.id, title: m.title, content: m.content, type: m.type, tags: m.tags, position: m.position })),
              },
            }),
          });
          const data = await res.json();

          // Replace "Processing voice..." with the actual transcript
          const store = useAppStore.getState();
          const msgs = [...store.agentMessages];
          const lastUserIdx = msgs.findLastIndex(m => m.content === '🎤 Processing voice...');
          if (lastUserIdx >= 0) {
            msgs[lastUserIdx] = { ...msgs[lastUserIdx], content: `🎤 "${data.transcript || 'Voice message'}"` };
          }

          // Add agent response
          let agentText = data.agentText || '';
          let actions = data.actions || [];
          try {
            if (agentText.startsWith('{')) {
              const parsed = JSON.parse(agentText);
              if (parsed.message) agentText = parsed.message;
              if (Array.isArray(parsed.actions)) actions = parsed.actions;
            }
          } catch { /* already plain text */ }

          msgs.push({ role: 'agent', content: agentText, audioBase64: data.agentAudioBase64, timestamp: Date.now() });
          // Update all messages at once
          useAppStore.setState({ agentMessages: msgs, agentLoading: false });

          // Play audio
          if (data.agentAudioBase64) {
            const { playAudioBase64 } = await import('../lib/audio');
            useAppStore.getState().setIsAgentSpeaking(true);
            await playAudioBase64(data.agentAudioBase64, 'mp3');
            useAppStore.getState().setIsAgentSpeaking(false);
          }

          // Dispatch actions
          const { default: dispatchModule } = await import('../hooks/useAgent');
        }
      } catch (err) {
        console.error('Recording failed:', err);
        useAppStore.getState().setAgentLoading(false);
      }
    } else {
      try {
        await startRecording();
        useAppStore.getState().setIsRecording(true);
      } catch {
        console.error('Mic access denied');
      }
    }
  };

  if (!currentSpaceId && !spaceId) {
    navigate('/spaces');
    return null;
  }

  return (
    <div className="flex h-screen w-full bg-black text-[#DEDBC8] overflow-hidden">
      {/* Left Panel: Chat */}
      <div className="w-full md:w-[400px] lg:w-[450px] border-r border-white/10 flex flex-col pt-6 pb-6 px-6 relative z-10 bg-black/50 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/spaces')}
              className="text-white/40 hover:text-white text-sm transition-colors"
            >
              ←
            </button>
            <h1 className="text-xl font-medium tracking-tight">{spaceName || 'Space'}</h1>
          </div>
          <button
            onClick={() => setShowScan(true)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white"
          >
            <Plus className="size-5" />
          </button>
        </div>

        {/* Memory count */}
        {memories.length > 0 && (
          <div className="text-xs text-white/30 mb-4">
            {memories.length} memor{memories.length === 1 ? 'y' : 'ies'} in this space
          </div>
        )}

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto hide-scrollbar flex flex-col gap-4 pr-2">
          {agentMessages.length === 0 && (
            <div className="border border-white/10 rounded-2xl rounded-bl-sm p-4 text-sm leading-relaxed text-[#DEDBC8]">
              Hello! I'm your spatial memory agent. Click on objects in the 3D scene to add memories, or ask me anything about your space.
            </div>
          )}
          {agentMessages.map((msg, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={idx}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className={`p-4 rounded-2xl max-w-[85%] text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-white/10 text-white rounded-br-sm'
                  : 'bg-transparent border border-white/10 text-[#DEDBC8] rounded-bl-sm'
              }`}>
                {msg.content}
              </div>
            </motion.div>
          ))}
          {agentLoading && (
            <div className="border border-white/10 rounded-2xl rounded-bl-sm p-4 text-sm text-white/40 animate-pulse">
              Thinking...
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        {/* Recording indicator */}
        {isRecording && (
          <div className="flex items-center gap-3 mt-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-full">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm text-red-400 flex-1">Listening...</span>
            <button
              onClick={handleMic}
              className="text-xs text-red-300 hover:text-white bg-red-500/20 px-3 py-1 rounded-full transition-colors"
            >
              Stop
            </button>
          </div>
        )}

        {/* Input */}
        {!isRecording && (
          <form onSubmit={handleSend} className="mt-4 relative flex items-center">
            <button
              type="button"
              onClick={handleMic}
              className="absolute left-2 p-2.5 rounded-full transition-colors text-white/50 hover:text-white hover:bg-white/10"
            >
              <Mic className="size-5" />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your memories..."
              className="w-full bg-white/5 border border-white/10 rounded-full py-4 pl-14 pr-14 text-sm focus:outline-none focus:border-white/30 transition-colors placeholder:text-white/30"
            />
            <button
              type="submit"
              className="absolute right-2 p-2.5 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <Send className="size-5" />
            </button>
          </form>
        )}
      </div>

      {/* Right Panel: 3D Scene */}
      <div className="hidden md:flex flex-1 relative">
        <SceneCanvas onPlaceAnchor={handlePlaceAnchor} />

        {/* Add Memory Popup */}
        {pendingAnchorPos && (
          <AddMemoryPopup
            position={pendingAnchorPos}
            onSave={handleSaveMemory}
            onCancel={() => setPendingAnchorPos(null)}
          />
        )}

        {/* Scan UI */}
        {showScan && (
          <ScanUI
            spaceId={currentSpaceId || ''}
            onClose={() => setShowScan(false)}
            onModelReady={handleModelReady}
          />
        )}
      </div>
    </div>
  );
}
