import { useState } from 'react';
import MemoryList from './MemoryList';
import AgentChat from './AgentChat';

export default function Sidebar() {
  const [tab, setTab] = useState<'memories' | 'agent'>('memories');

  return (
    <div className="w-80 glass-panel border-l border-cyan-900/30 flex flex-col h-full">
      {/* Tabs */}
      <div className="flex border-b border-gray-800/50">
        <button
          onClick={() => setTab('memories')}
          className={`flex-1 py-3 text-xs font-medium transition-colors ${
            tab === 'memories' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          Memories
        </button>
        <button
          onClick={() => setTab('agent')}
          className={`flex-1 py-3 text-xs font-medium transition-colors ${
            tab === 'agent' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          Agent
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-y-auto min-h-0">
        {tab === 'memories' ? <MemoryList /> : <AgentChat />}
      </div>
    </div>
  );
}
