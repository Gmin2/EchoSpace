import { useState, useCallback } from 'react';

/**
 * Placeholder depth estimation hook.
 * TF.js depth-estimation has ESM compatibility issues with Vite 8.
 * For now, generates a simple depth map from webcam frame brightness.
 */
export function useDepthEstimation() {
  const [isModelReady, setIsModelReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const initModel = useCallback(async () => {
    // No model to load — using brightness-based depth
    setIsModelReady(true);
    console.log('Depth estimation ready (brightness-based fallback)');
  }, []);

  const estimateDepth = useCallback(
    async (video: HTMLVideoElement): Promise<Float32Array | null> => {
      setIsProcessing(true);
      try {
        const w = video.videoWidth || 640;
        const h = video.videoHeight || 480;

        // Draw video frame to an offscreen canvas
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;
        ctx.drawImage(video, 0, 0, w, h);

        const imageData = ctx.getImageData(0, 0, w, h);
        const pixels = imageData.data;
        const depthData = new Float32Array(w * h);

        // Convert to grayscale brightness as a rough "depth" proxy
        // Darker areas = further away, brighter = closer
        for (let i = 0; i < w * h; i++) {
          const r = pixels[i * 4];
          const g = pixels[i * 4 + 1];
          const b = pixels[i * 4 + 2];
          // Luminance formula
          const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
          // Invert: bright = near (low depth), dark = far (high depth)
          depthData[i] = 1.0 - brightness;
        }

        return depthData;
      } catch (err) {
        console.error('Depth estimation failed:', err);
        return null;
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  return { initModel, estimateDepth, isModelReady, isProcessing };
}
