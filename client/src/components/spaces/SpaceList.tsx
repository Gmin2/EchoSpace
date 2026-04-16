import { useState } from 'react';
import { useSpaces, createSpace, deleteSpace } from '../../hooks/useSpaces';
import { useAppStore } from '../../stores/appStore';
import { db } from '../../lib/db';
import {
  generateMockRoomCloud,
  generateMockAnchors,
  generateMockMemories,
} from '../../lib/mock';

export default function SpaceList() {
  const spaces = useSpaces();
  const setCurrentSpaceId = useAppStore((s) => s.setCurrentSpaceId);
  const updatePointCloud = useAppStore((s) => s.updatePointCloud);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    const space = await createSpace(newName.trim());
    setNewName('');
    setCreating(false);
    enterSpace(space.id);
  };

  const handleLoadDemo = async () => {
    const space = await createSpace('Hackathon Desk', 'Demo space with pre-loaded memories');

    // Add mock scan data
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

    // Add mock anchors and memories
    const anchors = generateMockAnchors(space.id);
    const memories = generateMockMemories(space.id);
    await db.anchors.bulkAdd(anchors);
    await db.memories.bulkAdd(memories);

    enterSpace(space.id);
  };

  const enterSpace = async (spaceId: string) => {
    // Load point cloud into Zustand
    const scan = await db.scans.where('spaceId').equals(spaceId).first();
    if (scan) {
      const positions = new Float32Array(scan.pointPositions);
      const colors = new Float32Array(scan.pointColors);
      updatePointCloud(positions, colors, scan.pointCount);
    } else {
      // No scan yet — load mock
      const { positions, colors, count } = generateMockRoomCloud(20000);
      updatePointCloud(positions, colors, count);
    }
    setCurrentSpaceId(spaceId);
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-[#0a0a0f]">
      <div className="glass-panel p-8 w-full max-w-lg">
        <h1 className="text-3xl font-bold neon-text mb-1">EchoSpace</h1>
        <p className="text-sm text-gray-400 mb-6">Your spatial second brain</p>

        {/* Space list */}
        <div className="space-y-2 mb-6">
          {spaces.length === 0 && (
            <p className="text-gray-500 text-sm py-4 text-center">
              No spaces yet. Create one or load the demo.
            </p>
          )}
          {spaces.map((space) => (
            <div
              key={space.id}
              className="flex items-center justify-between p-3 rounded-lg neon-border hover:glow-cyan transition-all cursor-pointer"
              onClick={() => enterSpace(space.id)}
            >
              <div>
                <p className="font-medium">{space.name}</p>
                {space.description && (
                  <p className="text-xs text-gray-500">{space.description}</p>
                )}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteSpace(space.id);
                }}
                className="text-red-400/60 hover:text-red-400 text-sm px-2"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {creating ? (
            <div className="flex gap-2">
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                placeholder="Space name (e.g. Kitchen, Office)"
                className="flex-1 bg-transparent border border-cyan-800/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-400 transition-colors"
              />
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-cyan-500/20 border border-cyan-400/40 rounded-lg text-sm hover:bg-cyan-500/30 transition-colors"
              >
                Create
              </button>
              <button
                onClick={() => setCreating(false)}
                className="px-3 py-2 text-gray-500 text-sm"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setCreating(true)}
              className="w-full py-3 neon-border rounded-lg text-sm hover:glow-cyan transition-all"
            >
              + New Space
            </button>
          )}

          <button
            onClick={handleLoadDemo}
            className="w-full py-3 bg-gradient-to-r from-cyan-500/20 to-magenta-500/20 neon-border rounded-lg text-sm hover:glow-magenta transition-all"
          >
            Load Demo (Hackathon Desk)
          </button>
        </div>
      </div>
    </div>
  );
}
