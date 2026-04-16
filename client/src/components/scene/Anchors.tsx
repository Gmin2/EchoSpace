import { useAnchors } from '../../hooks/useMemories';
import { useAppStore } from '../../stores/appStore';
import AnchorMarker from './AnchorMarker';

export default function Anchors() {
  const spaceId = useAppStore((s) => s.currentSpaceId);
  const anchors = useAnchors(spaceId);

  return (
    <>
      {anchors.map((anchor) => (
        <AnchorMarker key={anchor.id} anchor={anchor} />
      ))}
    </>
  );
}
