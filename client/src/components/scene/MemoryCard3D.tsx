import { Billboard, Html } from '@react-three/drei';
import type { Memory } from '../../types/memory';
import { useAppStore } from '../../stores/appStore';

interface Props {
  memory: Memory;
}

export default function MemoryCard3D({ memory }: Props) {
  const selectedAnchorId = useAppStore((s) => s.selectedAnchorId);
  const isVisible = !selectedAnchorId || selectedAnchorId === memory.anchorId;

  if (!isVisible) return null;

  return (
    <Billboard
      position={[memory.position.x, memory.position.y + 0.4, memory.position.z]}
      follow
      lockX={false}
      lockY={false}
      lockZ={false}
    >
      <Html distanceFactor={6} center>
        <div
          className="memory-card-3d"
          style={{ borderColor: memory.color + '66', boxShadow: `0 0 12px ${memory.color}33` }}
          onClick={(e) => {
            e.stopPropagation();
            useAppStore.getState().setSelectedAnchorId(memory.anchorId);
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: memory.color, boxShadow: `0 0 6px ${memory.color}`,
            }} />
            <span style={{ fontWeight: 600, fontSize: 13, color: memory.color }}>
              {memory.title}
            </span>
          </div>
          <p style={{ fontSize: 11, opacity: 0.7, margin: 0, lineHeight: 1.3 }}>
            {memory.content.length > 80 ? memory.content.slice(0, 80) + '...' : memory.content}
          </p>
          {memory.tags.length > 0 && (
            <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
              {memory.tags.map((tag) => (
                <span key={tag} style={{
                  fontSize: 9, padding: '1px 5px', borderRadius: 4,
                  background: 'rgba(0,255,255,0.1)', border: '1px solid rgba(0,255,255,0.2)',
                }}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </Html>
    </Billboard>
  );
}
