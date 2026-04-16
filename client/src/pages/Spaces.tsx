import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { useSpaces, createSpace, deleteSpace } from "../hooks/useSpaces";
import { db } from "../lib/db";
import { generateMockRoomCloud, generateMockAnchors, generateMockMemories } from "../lib/mock";
import { useAppStore } from "../stores/appStore";
import { useState } from "react";

const ROOM_PRESETS = [
  { name: "Office", icon: "🖥️", gradient: "from-blue-500/20 to-cyan-500/20" },
  { name: "Kitchen", icon: "🍳", gradient: "from-orange-500/20 to-yellow-500/20" },
  { name: "Living Room", icon: "🛋️", gradient: "from-green-500/20 to-emerald-500/20" },
  { name: "Bedroom", icon: "🛏️", gradient: "from-purple-500/20 to-pink-500/20" },
];

export default function Spaces() {
  const spaces = useSpaces();
  const navigate = useNavigate();
  const updatePointCloud = useAppStore((s) => s.updatePointCloud);
  const [showCustom, setShowCustom] = useState(false);
  const [customName, setCustomName] = useState("");

  const enterSpace = async (spaceId: string) => {
    const scan = await db.scans.where("spaceId").equals(spaceId).first();
    if (scan) {
      const positions = new Float32Array(scan.pointPositions);
      const colors = new Float32Array(scan.pointColors);
      updatePointCloud(positions, colors, scan.pointCount);
    } else {
      updatePointCloud(new Float32Array(0), new Float32Array(0), 0);
    }
    useAppStore.getState().setCurrentSpaceId(spaceId);
    navigate(`/workspace/${spaceId}`);
  };

  const handleCreatePreset = async (name: string) => {
    const space = await createSpace(name);
    enterSpace(space.id);
  };

  const handleCreateCustom = async () => {
    if (!customName.trim()) return;
    const space = await createSpace(customName.trim());
    setCustomName("");
    setShowCustom(false);
    enterSpace(space.id);
  };

  const handleLoadDemo = async () => {
    const space = await createSpace("Hackathon Desk", "Demo space with pre-loaded memories");
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
    await db.anchors.bulkAdd(generateMockAnchors(space.id));
    await db.memories.bulkAdd(generateMockMemories(space.id));
    enterSpace(space.id);
  };

  return (
    <div className="min-h-screen bg-black text-primary pt-28 pb-16 px-4 md:px-8">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-medium tracking-tight mb-3">Your Spaces</h1>
          <p className="text-white/40 text-sm md:text-base">Select a space to explore or create a new one</p>
        </motion.div>

        {spaces.length > 0 && (
          <div className="mb-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {spaces.map((space, i) => (
                <motion.div
                  key={space.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.5 }}
                  onClick={() => enterSpace(space.id)}
                  className="group relative bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-white/20 rounded-2xl p-6 cursor-pointer transition-all duration-300"
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteSpace(space.id); }}
                    className="absolute top-3 right-3 text-white/20 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ✕
                  </button>
                  <div className="text-3xl mb-3">
                    {space.name === "Office" ? "🖥️" : space.name === "Kitchen" ? "🍳" : space.name === "Living Room" ? "🛋️" : space.name === "Bedroom" ? "🛏️" : space.name === "Hackathon Desk" ? "💻" : "📍"}
                  </div>
                  <h3 className="font-medium text-lg mb-1">{space.name}</h3>
                  <p className="text-white/30 text-xs">{space.description || "Click to open"}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <h2 className="text-sm uppercase tracking-widest text-white/30 mb-4">
            {spaces.length > 0 ? "Create New" : "Create Your First Space"}
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            {ROOM_PRESETS.map((preset, i) => (
              <motion.button
                key={preset.name}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                onClick={() => handleCreatePreset(preset.name)}
                className={`bg-gradient-to-br ${preset.gradient} border border-white/10 hover:border-white/20 rounded-2xl p-5 text-left transition-all duration-300 hover:scale-[1.02]`}
              >
                <div className="text-3xl mb-3">{preset.icon}</div>
                <p className="font-medium text-sm">{preset.name}</p>
              </motion.button>
            ))}
          </div>
          <div className="flex gap-3">
            {showCustom ? (
              <div className="flex gap-2 flex-1">
                <input
                  autoFocus
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleCreateCustom(); if (e.key === "Escape") setShowCustom(false); }}
                  placeholder="e.g. Garage, Studio, Lab..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-full px-5 py-3 text-sm focus:outline-none focus:border-white/30 transition-colors placeholder:text-white/30"
                />
                <button onClick={handleCreateCustom} className="px-6 py-3 bg-white/10 border border-white/10 rounded-full text-sm hover:bg-white/15 transition-colors">Create</button>
                <button onClick={() => setShowCustom(false)} className="px-4 py-3 text-white/40 text-sm">Cancel</button>
              </div>
            ) : (
              <>
                <button onClick={() => setShowCustom(true)} className="flex-1 py-3 border border-white/10 hover:border-white/20 rounded-full text-sm flex items-center justify-center gap-2 hover:bg-white/5 transition-all">
                  <Plus className="w-4 h-4" /> Custom Space
                </button>
                <button onClick={handleLoadDemo} className="flex-1 py-3 bg-white/5 border border-white/10 hover:border-white/20 rounded-full text-sm hover:bg-white/10 transition-all">
                  Load Demo
                </button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
