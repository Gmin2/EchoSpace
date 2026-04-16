/**
 * Convert a depth map (Float32Array of 0-1 values) into a 3D point cloud.
 */
export function depthToPointCloud(
  depthData: Float32Array,
  width: number,
  height: number,
  downsample = 4
): { positions: Float32Array; colors: Float32Array; count: number } {
  const outW = Math.ceil(width / downsample);
  const outH = Math.ceil(height / downsample);
  const count = outW * outH;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  const fov = (60 * Math.PI) / 180; // 60 degree FOV
  const aspect = width / height;
  const halfFovY = fov / 2;
  const halfFovX = Math.atan(Math.tan(halfFovY) * aspect);
  const depthScale = 6; // scale depth to world units

  let idx = 0;
  for (let y = 0; y < height; y += downsample) {
    for (let x = 0; x < width; x += downsample) {
      const depthIdx = y * width + x;
      const depth = depthData[depthIdx];
      if (depth === undefined || depth === 0) {
        idx++;
        continue;
      }

      const z = -depth * depthScale;
      const nx = (x / width - 0.5) * 2;  // normalized -1 to 1
      const ny = -(y / height - 0.5) * 2; // flip Y
      const px = nx * Math.tan(halfFovX) * Math.abs(z);
      const py = ny * Math.tan(halfFovY) * Math.abs(z);

      const i = idx * 3;
      positions[i] = px;
      positions[i + 1] = py;
      positions[i + 2] = z;

      // Color: near = cyan, far = deep blue
      const t = Math.min(depth, 1);
      colors[i] = 0.0 + t * 0.15;
      colors[i + 1] = 0.7 - t * 0.4;
      colors[i + 2] = 0.95;

      idx++;
    }
  }

  return { positions, colors, count };
}
