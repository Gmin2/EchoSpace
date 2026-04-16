import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAppStore } from '../../stores/appStore';

const MAX_POINTS = 50000;
const emptyPositions = new Float32Array(MAX_POINTS * 3);
const emptyColors = new Float32Array(MAX_POINTS * 3);

export default function PointCloud() {
  const posRef = useRef<THREE.BufferAttribute>(null);
  const colRef = useRef<THREE.BufferAttribute>(null);
  const pointsRef = useRef<THREE.Points>(null);

  useFrame(() => {
    const { pointCloudPositions, pointCloudColors, pointCloudCount } = useAppStore.getState();
    if (!posRef.current || !colRef.current || pointCloudCount === 0) return;

    const posArr = posRef.current.array as Float32Array;
    const colArr = colRef.current.array as Float32Array;

    posArr.set(pointCloudPositions.subarray(0, Math.min(pointCloudCount * 3, MAX_POINTS * 3)));
    colArr.set(pointCloudColors.subarray(0, Math.min(pointCloudCount * 3, MAX_POINTS * 3)));

    posRef.current.needsUpdate = true;
    colRef.current.needsUpdate = true;

    if (pointsRef.current) {
      pointsRef.current.geometry.setDrawRange(0, Math.min(pointCloudCount, MAX_POINTS));
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          ref={posRef}
          attach="attributes-position"
          args={[emptyPositions, 3]}
        />
        <bufferAttribute
          ref={colRef}
          attach="attributes-color"
          args={[emptyColors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        vertexColors
        sizeAttenuation
        transparent
        opacity={0.85}
        depthWrite={false}
      />
    </points>
  );
}
