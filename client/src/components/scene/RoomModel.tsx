import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Suspense } from 'react';

function Table() {
  const gltf = useLoader(GLTFLoader, '/round_table.glb');
  return <primitive object={gltf.scene} scale={2} position={[0, -2, 0]} />;
}

function CoffeeMug() {
  const gltf = useLoader(GLTFLoader, '/coffeeMug.glb');
  return <primitive object={gltf.scene} scale={0.03} position={[1.2, 0.03, -0.5]} />;
}

function Laptop() {
  return (
    <group position={[-0.5, 0.05, 0.2]} rotation={[0, 0.4, 0]}>
      {/* Base */}
      <mesh>
        <boxGeometry args={[0.7, 0.025, 0.45]} />
        <meshStandardMaterial color="#333333" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Screen */}
      <mesh position={[0, 0.24, -0.21]} rotation={[-0.2, 0, 0]}>
        <boxGeometry args={[0.68, 0.42, 0.015]} />
        <meshStandardMaterial color="#222222" metalness={0.5} roughness={0.2} />
      </mesh>
      {/* Screen glow */}
      <mesh position={[0, 0.24, -0.2]} rotation={[-0.2, 0, 0]}>
        <planeGeometry args={[0.6, 0.36]} />
        <meshStandardMaterial color="#0a1628" emissive="#004466" emissiveIntensity={0.5} />
      </mesh>
      {/* Keyboard surface */}
      <mesh position={[0, 0.015, 0.05]}>
        <planeGeometry args={[0.55, 0.3]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.3} roughness={0.6} />
      </mesh>
    </group>
  );
}

function WaterBottle() {
  return (
    <group position={[-1.0, 0.19, -0.4]}>
      {/* Body */}
      <mesh>
        <cylinderGeometry args={[0.045, 0.05, 0.3, 16]} />
        <meshStandardMaterial color="#5599dd" transparent opacity={0.5} metalness={0.1} roughness={0.05} />
      </mesh>
      {/* Cap */}
      <mesh position={[0, 0.17, 0]}>
        <cylinderGeometry args={[0.04, 0.045, 0.05, 16]} />
        <meshStandardMaterial color="#ffffff" metalness={0.2} roughness={0.4} />
      </mesh>
      {/* Water */}
      <mesh position={[0, -0.03, 0]}>
        <cylinderGeometry args={[0.04, 0.045, 0.2, 16]} />
        <meshStandardMaterial color="#3377bb" transparent opacity={0.35} />
      </mesh>
    </group>
  );
}

export default function RoomModel() {
  return (
    <Suspense fallback={null}>
      <Table />
      <CoffeeMug />
      <Laptop />
      <WaterBottle />
    </Suspense>
  );
}
