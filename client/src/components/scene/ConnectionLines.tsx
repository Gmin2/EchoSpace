import { Line } from '@react-three/drei';
import { useMemories } from '../../hooks/useMemories';
import { useAppStore } from '../../stores/appStore';

export default function ConnectionLines() {
  const spaceId = useAppStore((s) => s.currentSpaceId);
  const memories = useMemories(spaceId);

  // Build lines between connected memories
  const lines: { from: [number, number, number]; to: [number, number, number] }[] = [];
  const seen = new Set<string>();

  for (const mem of memories) {
    for (const connId of mem.connections) {
      const key = [mem.id, connId].sort().join('-');
      if (seen.has(key)) continue;
      seen.add(key);

      const target = memories.find((m) => m.id === connId);
      if (!target) continue;

      lines.push({
        from: [mem.position.x, mem.position.y + 0.3, mem.position.z],
        to: [target.position.x, target.position.y + 0.3, target.position.z],
      });
    }
  }

  if (lines.length === 0) return null;

  return (
    <>
      {lines.map((line, i) => (
        <Line
          key={i}
          points={[line.from, line.to]}
          color="#00ffff"
          lineWidth={2}
          dashed
          dashSize={0.1}
          gapSize={0.05}
        />
      ))}
    </>
  );
}
