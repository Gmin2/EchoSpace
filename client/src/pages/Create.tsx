import { Mic, Send, ScanLine, Plus } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { createSpace } from "../hooks/useSpaces";
import { useAppStore } from "../stores/appStore";
import { startRecording, stopRecording } from "../lib/audio";

export default function Create() {
  const navigate = useNavigate();
  const [spaceName, setSpaceName] = useState("");
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello! Ready to map your new space? Give it a name and then scan your room." }
  ]);
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [scanStatus, setScanStatus] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addMessage = (role: string, content: string) => {
    setMessages(prev => [...prev, { role, content }]);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const msg = input.trim();
    setInput("");
    addMessage("user", msg);

    // If no space name yet, use this as the name
    if (!spaceName) {
      setSpaceName(msg);
      addMessage("assistant", `Great! I'll call this space "${msg}". Now click "Scan space" on the right to capture your room, or describe what's in it.`);
    } else {
      addMessage("assistant", "Got it! I'll remember that. Click Scan to capture your room when ready.");
    }
  };

  const handleMic = async () => {
    if (isRecording) {
      setIsRecording(false);
      try {
        const { audioBase64 } = await stopRecording();
        addMessage("user", "🎤 Voice message sent");
        // Send to voice API
        const res = await fetch("/api/voice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            audioBase64,
            context: { spaceId: "new", spaceName: spaceName || "New Space", memories: [] },
          }),
        });
        const data = await res.json();
        addMessage("assistant", data.agentText || "I heard you! Let's continue setting up your space.");
      } catch {
        addMessage("assistant", "Couldn't process that. Try again.");
      }
    } else {
      try {
        await startRecording();
        setIsRecording(true);
      } catch {
        addMessage("assistant", "Mic access denied. Please allow microphone permissions.");
      }
    }
  };

  // Camera functions
  const startCamera = async () => {
    setScanning(true);
    setScanStatus("Starting camera...");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
      streamRef.current = stream;
      // Wait a tick for the video element to be in DOM
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().then(() => {
            setCameraOn(true);
            setScanStatus("Take 2-4 photos of your room from different angles");
          });
        }
      }, 100);
    } catch {
      setScanStatus("Camera access denied.");
      setScanning(false);
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    const base64 = dataUrl.split(",")[1];
    setPhotos(prev => [...prev, base64]);
    setPreviews(prev => [...prev, dataUrl]);
    const count = photos.length + 1;
    if (count < 2) setScanStatus(`${count}/2 photos. Need at least 2.`);
    else if (count < 4) setScanStatus(`${count} photos. Generate now or add more.`);
    else setScanStatus("All 4 photos taken!");
  };

  const generateModel = async () => {
    setScanStatus("Generating 3D model... 30-60 seconds.");
    streamRef.current?.getTracks().forEach(t => t.stop());

    // Create the space
    const name = spaceName || "New Space";
    const space = await createSpace(name);

    try {
      const body: Record<string, string> = { front: photos[0] };
      if (photos[1]) body.left = photos[1];
      if (photos[2]) body.back = photos[2];
      if (photos[3]) body.right = photos[3];

      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.modelUrl) {
          useAppStore.getState().setRoomModelUrl(data.modelUrl);
        }
      }
    } catch {
      // Scan failed — still enter workspace
    }

    useAppStore.getState().setCurrentSpaceId(space.id);
    navigate(`/workspace/${space.id}`);
  };

  const skipScan = async () => {
    const name = spaceName || "New Space";
    const space = await createSpace(name);
    streamRef.current?.getTracks().forEach(t => t.stop());
    useAppStore.getState().setCurrentSpaceId(space.id);
    useAppStore.getState().updatePointCloud(new Float32Array(0), new Float32Array(0), 0);
    navigate(`/workspace/${space.id}`);
  };

  return (
    <div className="flex h-screen w-full bg-black text-[#DEDBC8] overflow-hidden">
      {/* Left Panel: Chat */}
      <div className="w-full md:w-[400px] lg:w-[450px] border-r border-white/10 flex flex-col pt-24 pb-6 px-6 relative z-10 bg-black/50 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-medium tracking-tight">
            {spaceName ? spaceName : "New Space"}
          </h1>
          <button onClick={() => navigate("/spaces")} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <Plus className="size-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto hide-scrollbar flex flex-col gap-4 pr-2">
          {messages.map((msg, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={idx}
              className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
            >
              <div className={`p-4 rounded-2xl max-w-[85%] text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-white/10 text-white rounded-br-sm"
                  : "bg-transparent border border-white/10 text-[#DEDBC8] rounded-bl-sm"
              }`}>
                {msg.content}
              </div>
            </motion.div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="mt-6 relative flex items-center">
          <button
            type="button"
            onClick={handleMic}
            className={`absolute left-2 p-2.5 rounded-full transition-colors ${
              isRecording ? "text-red-400 bg-red-500/20 animate-pulse" : "text-white/50 hover:text-white hover:bg-white/10"
            }`}
          >
            <Mic className="size-5" />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={spaceName ? "Describe what's in this space..." : "Name your space (e.g. Office, Kitchen)..."}
            className="w-full bg-white/5 border border-white/10 rounded-full py-4 pl-14 pr-14 text-sm focus:outline-none focus:border-white/30 transition-colors placeholder:text-white/30"
          />
          <button type="submit" className="absolute right-2 p-2.5 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors">
            <Send className="size-5" />
          </button>
        </form>
      </div>

      {/* Right Panel: Scan */}
      <div className="hidden md:flex flex-1 items-center justify-center relative flex-col gap-6">
        <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />

        {!scanning ? (
          /* Scan button */
          <motion.button
            onClick={startCamera}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group flex flex-col items-center gap-6 p-12 rounded-[2.5rem] border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
          >
            <div className="relative p-6 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
              <div className="absolute inset-0 rounded-full border border-white/20 animate-[spin_4s_linear_infinite] group-hover:border-white/40" />
              <ScanLine className="size-12 text-white/80 group-hover:text-white transition-colors" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-2xl font-medium tracking-tight text-white">Scan space</span>
              <span className="text-sm text-white/40">Initialize 3D memory map</span>
            </div>
          </motion.button>
        ) : (
          /* Camera UI */
          <div className="w-full max-w-xl px-8">
            <p className="text-sm text-white/50 mb-4 text-center">{scanStatus}</p>

            {/* Video feed */}
            <div className="rounded-2xl overflow-hidden bg-white/5 aspect-video mb-4 relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover absolute inset-0"
              />
              {!cameraOn && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/5">
                  <span className="text-white/30 text-sm animate-pulse">Starting camera...</span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {previews.length > 0 && (
              <div className="flex gap-2 mb-4 justify-center">
                {previews.map((src, i) => (
                  <div key={i} className="w-16 h-11 rounded-lg overflow-hidden border border-white/10">
                    <img src={src} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}

            <canvas ref={canvasRef} className="hidden" />

            {/* Buttons */}
            <div className="flex gap-3 justify-center">
              {photos.length < 4 && (
                <button onClick={capturePhoto} className="px-6 py-3 bg-white/10 border border-white/10 rounded-full text-sm hover:bg-white/15 transition-colors">
                  📸 Capture ({photos.length}/4)
                </button>
              )}
              {photos.length >= 2 && (
                <button onClick={generateModel} className="px-6 py-3 bg-white/10 border border-white/10 rounded-full text-sm hover:bg-white/15 transition-colors">
                  Generate 3D
                </button>
              )}
              <button onClick={skipScan} className="px-6 py-3 text-white/40 text-sm hover:text-white/60 transition-colors">
                Skip scan
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
