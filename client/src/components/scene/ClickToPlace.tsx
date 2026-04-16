import { useThree } from '@react-three/fiber';
import type { SpatialPosition } from '../../types/anchor';

interface Props {
  onPlaceAnchor: (position: SpatialPosition) => void;
}

export default function ClickToPlace({ onPlaceAnchor }: Props) {
  const { camera, raycaster, pointer } = useThree();

  const handleClick = () => {
    raycaster.setFromCamera(pointer, camera);

    // Cast a ray and pick a point at distance 5 along the ray direction
    const origin = raycaster.ray.origin.clone();
    const direction = raycaster.ray.direction.clone();
    const point = origin.add(direction.multiplyScalar(5));

    onPlaceAnchor({ x: point.x, y: point.y, z: point.z });
  };

  return (
    <mesh visible={false} onClick={handleClick}>
      <sphereGeometry args={[50, 8, 8]} />
      <meshBasicMaterial side={2} />
    </mesh>
  );
}
