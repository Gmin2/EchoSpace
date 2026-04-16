import { Grid } from '@react-three/drei';

export default function GridFloor() {
  return (
    <Grid
      position={[0, -2, 0]}
      args={[20, 20]}
      cellSize={0.5}
      cellThickness={0.5}
      cellColor="#0a3a3a"
      sectionSize={2}
      sectionThickness={1}
      sectionColor="#00ffff"
      fadeDistance={20}
      fadeStrength={1}
      infiniteGrid
    />
  );
}
