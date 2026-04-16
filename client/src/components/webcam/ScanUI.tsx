import { useRef, useState } from 'react';

interface Props {
  onClose: () => void;
  spaceId: string;
  onModelReady: (glbUrl: string) => void;
}

export default function ScanUI({ onClose, onModelReady }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraOn, setCameraOn] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]); // base64 array
  const [previews, setPreviews] = useState<string[]>([]); // data URL array
  const [status, setStatus] = useState('Take 2-4 photos of your room from different angles');
  const [isProcessing, setIsProcessing] = useState(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraOn(true);
    } catch (err) {
      setStatus('Camera access denied.');
      console.error('Camera error:', err);
    }
  };

  const capture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    const base64 = dataUrl.split(',')[1];

    setPhotos((prev) => [...prev, base64]);
    setPreviews((prev) => [...prev, dataUrl]);
    const count = photos.length + 1;
    if (count < 2) {
      setStatus(`${count}/2 photos taken. Need at least 2.`);
    } else if (count < 4) {
      setStatus(`${count} photos taken. You can generate now or add more (up to 4) for better quality.`);
    } else {
      setStatus('All 4 photos taken! Ready to generate.');
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const generate = async () => {
    if (photos.length === 0) return;
    setIsProcessing(true);
    setStatus('Generating 3D model... This takes 30-60 seconds.');

    streamRef.current?.getTracks().forEach((t) => t.stop());

    try {
      const body: Record<string, string> = { front: photos[0] };
      if (photos[1]) body.left = photos[1];
      if (photos[2]) body.back = photos[2];
      if (photos[3]) body.right = photos[3];

      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Scan failed');
      }

      const data = await res.json();
      if (data.modelUrl) {
        onModelReady(data.modelUrl);
      } else {
        setStatus('Generation failed. Try again.');
        setIsProcessing(false);
      }
    } catch (err: any) {
      setStatus(`Error: ${err.message}`);
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    onClose();
  };

  return (
    <div className="absolute inset-0 z-50 bg-black/85 flex items-center justify-center p-6">
      <div className="glass-panel p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="neon-text text-xl font-semibold">Scan Room</h2>
          <button onClick={handleCancel} className="text-gray-500 hover:text-gray-300">✕</button>
        </div>

        <p className="text-sm text-gray-400 mb-4">{status}</p>

        {/* Camera feed */}
        <div className="mb-4 rounded-lg overflow-hidden bg-gray-900 aspect-video relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{ display: cameraOn ? 'block' : 'none' }}
          />
          {!cameraOn && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-gray-600 text-sm">Camera preview</p>
            </div>
          )}
        </div>

        {/* Photo thumbnails */}
        {previews.length > 0 && (
          <div className="flex gap-2 mb-4">
            {previews.map((src, i) => (
              <div key={i} className="relative w-20 h-14 rounded overflow-hidden border border-cyan-800/40">
                <img src={src} className="w-full h-full object-cover" alt={`Photo ${i + 1}`} />
                <button
                  onClick={() => removePhoto(i)}
                  className="absolute top-0 right-0 bg-black/70 text-red-400 text-[10px] px-1 hover:text-red-300"
                >
                  ✕
                </button>
                <span className="absolute bottom-0 left-0 bg-black/70 text-[9px] px-1 text-gray-300">
                  {['Front', 'Left', 'Back', 'Right'][i]}
                </span>
              </div>
            ))}
            {photos.length < 4 && (
              <div className="w-20 h-14 rounded border border-dashed border-gray-700 flex items-center justify-center">
                <span className="text-gray-600 text-[10px]">{4 - photos.length} more</span>
              </div>
            )}
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />

        {/* Buttons */}
        <div className="flex gap-3">
          {!cameraOn && (
            <button onClick={startCamera} className="flex-1 py-3 bg-cyan-500/20 border border-cyan-400/40 rounded-lg text-sm hover:bg-cyan-500/30 transition-colors">
              Start Camera
            </button>
          )}

          {cameraOn && !isProcessing && photos.length < 4 && (
            <button onClick={capture} className="flex-1 py-3 bg-cyan-500/20 border border-cyan-400/40 rounded-lg text-sm hover:bg-cyan-500/30 transition-colors">
              📸 Capture ({photos.length}/4)
            </button>
          )}

          {photos.length >= 2 && !isProcessing && (
            <button onClick={generate} className="flex-1 py-3 bg-green-500/20 border border-green-400/40 rounded-lg text-sm hover:bg-green-500/30 transition-colors">
              Generate 3D Model{photos.length < 4 ? ' (or add more photos)' : ''}
            </button>
          )}

          {isProcessing && (
            <div className="flex-1 py-3 text-center text-sm text-gray-400 animate-pulse">
              Generating 3D model...
            </div>
          )}

          <button onClick={handleCancel} className="px-6 py-3 text-gray-500 text-sm hover:text-gray-300">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
