import { useMemories } from '../../hooks/useMemories';
import { useAppStore } from '../../stores/appStore';
import MemoryCard3D from './MemoryCard3D';

export default function MemoryCards() {
  const spaceId = useAppStore((s) => s.currentSpaceId);
  const memories = useMemories(spaceId);

  return (
    <>
      {memories.map((memory) => (
        <MemoryCard3D key={memory.id} memory={memory} />
      ))}
    </>
  );
}
