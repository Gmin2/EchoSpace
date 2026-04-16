import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Mesh } from 'three';
import type { Anchor } from '../../types/anchor';
import { useAppStore } from '../../stores/appStore';

interface Props {
  anchor: Anchor;
}

export default function AnchorMarker({ anchor }: Props) {
  const meshRef = useRef<Mesh>(null);
  const selectedId = useAppStore((s) => s.selectedAnchorId);
  const isSelected = selectedId === anchor.id;

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    const pulse = 1 + Math.sin(t * 3) * 0.15;
    meshRef.current.scale.setScalar(isSelected ? pulse * 1.3 : pulse);
  });

  return (
    <mesh
      ref={meshRef}
      position={[anchor.position.x, anchor.position.y, anchor.position.z]}
      onClick={(e) => {
        e.stopPropagation();
        useAppStore.getState().setSelectedAnchorId(
          isSelected ? null : anchor.id
        );
      }}
    >
      <sphereGeometry args={[0.12, 16, 16]} />
      <meshStandardMaterial
        color={isSelected ? '#ff00ff' : '#00ffff'}
        emissive={isSelected ? '#ff00ff' : '#00ffff'}
        emissiveIntensity={isSelected ? 1.5 : 0.8}
        transparent
        opacity={0.9}
      />
    </mesh>
  );
}
