import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../../stores/appStore';
import { sendChatMessage } from '../../hooks/useAgent';
import { useMemories } from '../../hooks/useMemories';
import { db } from '../../lib/db';

export default function AgentChat() {
  const spaceId = useAppStore((s) => s.currentSpaceId);
  const messages = useAppStore((s) => s.agentMessages);
  const loading = useAppStore((s) => s.agentLoading);
  const memories = useMemories(spaceId);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !spaceId || loading) return;
    const msg = input.trim();
    setInput('');

    const space = await db.spaces.get(spaceId);
    await sendChatMessage(msg, spaceId, space?.name || 'Space', memories);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-2 mb-3 min-h-0">
        {messages.length === 0 && (
          <p className="text-xs text-gray-600 text-center py-4">
            Ask the agent about your memories...
          </p>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`text-xs p-2 rounded-lg ${
              msg.role === 'user'
                ? 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 ml-4'
                : 'bg-gray-800/50 border border-gray-700/30 text-gray-300 mr-4'
            }`}
          >
            <span className="text-[10px] text-gray-500 block mb-0.5">
              {msg.role === 'user' ? 'You' : 'Agent'}
            </span>
            {msg.content}
          </div>
        ))}
        {loading && (
          <div className="text-xs text-gray-500 animate-pulse p-2">Agent thinking...</div>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask about your memories..."
          className="flex-1 bg-transparent border border-gray-700/50 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-cyan-400/50 transition-colors"
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="px-3 py-2 bg-cyan-500/20 border border-cyan-400/30 rounded-lg text-xs hover:bg-cyan-500/30 transition-colors disabled:opacity-30"
        >
          Send
        </button>
      </div>
    </div>
  );
}
