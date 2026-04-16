import { useMemories, deleteMemory } from '../../hooks/useMemories';
import { useAppStore } from '../../stores/appStore';

export default function MemoryList() {
  const spaceId = useAppStore((s) => s.currentSpaceId);
  const selectedAnchorId = useAppStore((s) => s.selectedAnchorId);
  const memories = useMemories(spaceId);

  if (memories.length === 0) {
    return <p className="text-sm text-gray-500 py-4 text-center">No memories yet. Click in the 3D scene to add one.</p>;
  }

  return (
    <div className="space-y-2">
      {memories.map((mem) => (
        <div
          key={mem.id}
          onClick={() => useAppStore.getState().setSelectedAnchorId(mem.anchorId)}
          className={`p-3 rounded-lg cursor-pointer transition-all border ${
            selectedAnchorId === mem.anchorId
              ? 'border-cyan-400/60 glow-cyan'
              : 'border-gray-800/50 hover:border-cyan-800/40'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: mem.color, boxShadow: `0 0 6px ${mem.color}` }}
            />
            <span className="text-sm font-medium" style={{ color: mem.color }}>
              {mem.title}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); deleteMemory(mem.id); }}
              className="ml-auto text-gray-600 hover:text-red-400 text-xs"
            >
              ✕
            </button>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            {mem.content.length > 100 ? mem.content.slice(0, 100) + '...' : mem.content}
          </p>
          {mem.tags.length > 0 && (
            <div className="flex gap-1 mt-1.5 flex-wrap">
              {mem.tags.map((tag) => (
                <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                  {tag}
                </span>
              ))}
            </div>
          )}
          {mem.connections.length > 0 && (
            <p className="text-[10px] text-gray-600 mt-1">
              🔗 {mem.connections.length} connection{mem.connections.length > 1 ? 's' : ''}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
