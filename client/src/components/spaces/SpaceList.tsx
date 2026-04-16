import { useState } from 'react';
import { useSpaces, createSpace, deleteSpace } from '../../hooks/useSpaces';
import { useAppStore } from '../../stores/appStore';
import { db } from '../../lib/db';
import {
  generateMockRoomCloud,
  generateMockAnchors,
  generateMockMemories,
} from '../../lib/mock';

const ROOM_PRESETS = [
  { name: 'Office', icon: '🖥️', color: '#00ffff', description: 'Your workspace' },
  { name: 'Kitchen', icon: '🍳', color: '#ff8800', description: 'Cooking & meals' },
  { name: 'Living Room', icon: '🛋️', color: '#00ff88', description: 'Relax & unwind' },
  { name: 'Bedroom', icon: '🛏️', color: '#aa66ff', description: 'Rest & personal' },
] as const;

export default function SpaceList() {
  const spaces = useSpaces();
  const setCurrentSpaceId = useAppStore((s) => s.setCurrentSpaceId);
  const updatePointCloud = useAppStore((s) => s.updatePointCloud);
  const [customName, setCustomName] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  const handleCreatePreset = async (name: string) => {
    const space = await createSpace(name);
    enterSpace(space.id);
  };

  const handleCreateCustom = async () => {
    if (!customName.trim()) return;
    const space = await createSpace(customName.trim());
    setCustomName('');
    setShowCustom(false);
    enterSpace(space.id);
  };

  const handleLoadDemo = async () => {
    const space = await createSpace('Hackathon Desk', 'Demo space with pre-loaded memories');
    const { positions, colors, count } = generateMockRoomCloud(20000);
    await db.scans.add({
      id: crypto.randomUUID(),
      spaceId: space.id,
      pointPositions: positions.buffer.slice(0) as ArrayBuffer,
      pointColors: colors.buffer.slice(0) as ArrayBuffer,
      pointCount: count,
      width: 640,
      height: 480,
      createdAt: Date.now(),
    });
    const anchors = generateMockAnchors(space.id);
    const memories = generateMockMemories(space.id);
    await db.anchors.bulkAdd(anchors);
    await db.memories.bulkAdd(memories);
    enterSpace(space.id);
  };

  const enterSpace = async (spaceId: string) => {
    const scan = await db.scans.where('spaceId').equals(spaceId).first();
    if (scan) {
      const positions = new Float32Array(scan.pointPositions);
      const colors = new Float32Array(scan.pointColors);
      updatePointCloud(positions, colors, scan.pointCount);
    } else {
      // No scan yet — start with empty scene
      updatePointCloud(new Float32Array(0), new Float32Array(0), 0);
    }
    setCurrentSpaceId(spaceId);
  };

  return (
    <div className="h-screen w-screen bg-[#0a0a0f] flex flex-col items-center justify-center p-6">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-5xl font-bold neon-text mb-2">EchoSpace</h1>
        <p className="text-gray-400 text-lg">Your spatial second brain</p>
      </div>

      <div className="w-full max-w-4xl">
        {/* Existing spaces */}
        {spaces.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm uppercase tracking-wider text-gray-500 mb-3">Your Spaces</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {spaces.map((space) => (
                <div
                  key={space.id}
                  onClick={() => enterSpace(space.id)}
                  className="group relative glass-panel p-4 rounded-xl cursor-pointer hover:glow-cyan transition-all border border-cyan-900/30 hover:border-cyan-400/50"
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteSpace(space.id); }}
                    className="absolute top-2 right-2 text-gray-600 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ✕
                  </button>
                  <div className="text-2xl mb-2">
                    {space.name === 'Office' ? '🖥️' :
                     space.name === 'Kitchen' ? '🍳' :
                     space.name === 'Living Room' ? '🛋️' :
                     space.name === 'Bedroom' ? '🛏️' :
                     space.name === 'Hackathon Desk' ? '💻' : '📍'}
                  </div>
                  <p className="font-medium text-sm">{space.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {space.description || 'Click to open'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Create new space */}
        <div>
          <h2 className="text-sm uppercase tracking-wider text-gray-500 mb-3">
            {spaces.length > 0 ? 'Add a New Space' : 'Create Your First Space'}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {ROOM_PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => handleCreatePreset(preset.name)}
                className="glass-panel p-4 rounded-xl text-left hover:glow-cyan transition-all border border-transparent hover:border-cyan-400/30"
              >
                <div className="text-3xl mb-2">{preset.icon}</div>
                <p className="font-medium text-sm" style={{ color: preset.color }}>{preset.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{preset.description}</p>
              </button>
            ))}
          </div>

          {/* Custom name + demo */}
          <div className="flex gap-3">
            {showCustom ? (
              <div className="flex gap-2 flex-1">
                <input
                  autoFocus
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateCustom();
                    if (e.key === 'Escape') setShowCustom(false);
                  }}
                  placeholder="e.g. Garage, Studio, Lab..."
                  className="flex-1 bg-transparent border border-cyan-800/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-400 transition-colors"
                />
                <button onClick={handleCreateCustom} className="px-4 py-2 bg-cyan-500/20 border border-cyan-400/40 rounded-lg text-sm hover:bg-cyan-500/30 transition-colors">
                  Create
                </button>
                <button onClick={() => setShowCustom(false)} className="px-3 py-2 text-gray-500 text-sm">
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setShowCustom(true)}
                  className="flex-1 py-3 neon-border rounded-lg text-sm hover:glow-cyan transition-all"
                >
                  + Custom Space
                </button>
                <button
                  onClick={handleLoadDemo}
                  className="flex-1 py-3 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 neon-border rounded-lg text-sm hover:glow-magenta transition-all"
                >
                  Load Demo
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
