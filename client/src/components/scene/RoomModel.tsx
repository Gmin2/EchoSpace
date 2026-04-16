import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Suspense } from 'react';

function Model() {
  const gltf = useLoader(GLTFLoader, '/wooden-main.glb');
  return <primitive object={gltf.scene} scale={8} position={[0, -2, 0]} />;
}

export default function RoomModel() {
  return (
    <Suspense fallback={null}>
      <Model />
    </Suspense>
  );
}
