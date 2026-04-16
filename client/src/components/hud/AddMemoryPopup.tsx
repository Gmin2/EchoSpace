import { useState } from 'react';
import type { SpatialPosition } from '../../types/anchor';

interface Props {
  position: SpatialPosition;
  onSave: (content: string) => void;
  onCancel: () => void;
}

export default function AddMemoryPopup({ onSave, onCancel }: Props) {
  const [content, setContent] = useState('');

  const handleSave = () => {
    if (!content.trim()) return;
    onSave(content.trim());
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className="glass-panel p-5 w-80 pointer-events-auto" style={{ boxShadow: '0 0 30px rgba(0,255,255,0.15)' }}>
        <h3 className="neon-text text-sm font-semibold mb-3">Add Memory Here</h3>
        <textarea
          autoFocus
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSave(); }
            if (e.key === 'Escape') onCancel();
          }}
          placeholder="What do you want to remember?"
          rows={3}
          className="w-full bg-transparent border border-cyan-800/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-400 transition-colors resize-none"
        />
        <div className="flex gap-2 mt-3 justify-end">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-gray-500 text-sm hover:text-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 bg-cyan-500/20 border border-cyan-400/40 rounded-lg text-sm hover:bg-cyan-500/30 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
