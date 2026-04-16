import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import GridFloor from './GridFloor';
import Anchors from './Anchors';
import MemoryCards from './MemoryCards';
import ConnectionLines from './ConnectionLines';
import RoomModel from './RoomModel';
import PostProcessing from './PostProcessing';
import type { SpatialPosition } from '../../types/anchor';

interface Props {
  onPlaceAnchor?: (position: SpatialPosition) => void;
}

export default function SceneCanvas({ onPlaceAnchor }: Props) {
  const handleClick = (e: any) => {
    if (!onPlaceAnchor) return;
    e.stopPropagation();
    const point = e.point;
    onPlaceAnchor({ x: point.x, y: point.y, z: point.z });
  };

  return (
    <Canvas
      camera={{ position: [0, 2, 6], fov: 45 }}
      style={{ background: '#0a0a0f' }}
    >
      <ambientLight intensity={1} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <pointLight position={[-3, 3, 2]} intensity={0.4} color="#00ffff" />
      <OrbitControls enableDamping dampingFactor={0.1} />
      <GridFloor />
      <group onClick={handleClick}>
        <RoomModel />
      </group>
      <Anchors />
      <MemoryCards />
      <ConnectionLines />
      <PostProcessing />
    </Canvas>
  );
}
