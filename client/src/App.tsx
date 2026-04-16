import { useState } from 'react';
import { useAppStore } from './stores/appStore';
import SpaceList from './components/spaces/SpaceList';
import SceneCanvas from './components/scene/SceneCanvas';
import Sidebar from './components/sidebar/Sidebar';
import AddMemoryPopup from './components/hud/AddMemoryPopup';
import VoiceIndicator from './components/hud/VoiceIndicator';
import ScanUI from './components/webcam/ScanUI';
import { createAnchor, createMemory } from './hooks/useMemories';
import type { SpatialPosition } from './types/anchor';
import './App.css';

function App() {
  const currentSpaceId = useAppStore((s) => s.currentSpaceId);
  const [pendingAnchorPos, setPendingAnchorPos] = useState<SpatialPosition | null>(null);
  const [showScan, setShowScan] = useState(false);

  if (!currentSpaceId) {
    return <SpaceList />;
  }

  const handlePlaceAnchor = (position: SpatialPosition) => {
    setPendingAnchorPos(position);
  };

  const handleSaveMemory = async (content: string) => {
    if (!pendingAnchorPos || !currentSpaceId) return;
    const anchor = await createAnchor(currentSpaceId, pendingAnchorPos);
    await createMemory(anchor.id, currentSpaceId, content, 'text', pendingAnchorPos);
    setPendingAnchorPos(null);
  };

  const handleModelReady = (glbUrl: string) => {
    useAppStore.getState().setRoomModelUrl(glbUrl);
    setShowScan(false);
  };

  return (
    <div className="h-screen w-screen flex bg-[#0a0a0f]">
      {/* 3D Canvas + HUD */}
      <div className="flex-1 relative">
        <SceneCanvas onPlaceAnchor={handlePlaceAnchor} />

        {/* Top bar */}
        <div className="absolute top-4 left-4 flex gap-2 items-center">
          <button
            onClick={() => useAppStore.getState().setCurrentSpaceId(null)}
            className="px-4 py-2 glass-panel neon-border text-sm hover:glow-cyan transition-all"
          >
            ← Back
          </button>
          <button
            onClick={() => setShowScan(true)}
            className="px-4 py-2 glass-panel neon-border text-sm hover:glow-cyan transition-all"
          >
            Scan Room
          </button>
        </div>

        {/* Voice indicator */}
        <VoiceIndicator />

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
            spaceId={currentSpaceId}
            onClose={() => setShowScan(false)}
            onModelReady={handleModelReady}
          />
        )}
      </div>

      {/* Sidebar */}
      <Sidebar />
    </div>
  );
}

export default App;
