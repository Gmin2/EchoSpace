import { useAppStore } from './stores/appStore';
import SpaceList from './components/spaces/SpaceList';
import './App.css';

function App() {
  const currentSpaceId = useAppStore((s) => s.currentSpaceId);

  if (!currentSpaceId) {
    return <SpaceList />;
  }

  // TODO: Person A will build the 3D workspace view
  return (
    <div className="h-screen w-screen flex bg-[#0a0a0f]">
      {/* 3D Canvas area — Person A builds this */}
      <div className="flex-1 relative">
        <div className="absolute inset-0 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <p className="text-2xl neon-text mb-2">3D Workspace</p>
            <p className="text-sm opacity-60">Person A: Build SceneCanvas, PointCloud, etc. here</p>
            <button
              onClick={() => useAppStore.getState().setCurrentSpaceId(null)}
              className="mt-4 px-4 py-2 glass-panel neon-border text-sm hover:glow-cyan transition-all"
            >
              ← Back to Spaces
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar — will hold MemoryList, AgentChat */}
      <div className="w-80 glass-panel border-l border-cyan-900/30 p-4 overflow-y-auto">
        <h2 className="neon-text text-lg font-semibold mb-4">Memories</h2>
        <p className="text-sm text-gray-500">Sidebar content coming soon...</p>
      </div>
    </div>
  );
}

export default App;
