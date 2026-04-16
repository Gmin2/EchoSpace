import { useAppStore } from '../../stores/appStore';
import { useMemories } from '../../hooks/useMemories';
import { sendVoiceMessage } from '../../hooks/useAgent';
import { startRecording, stopRecording } from '../../lib/audio';
import { db } from '../../lib/db';

export default function VoiceIndicator() {
  const isRecording = useAppStore((s) => s.isRecording);
  const isAgentSpeaking = useAppStore((s) => s.isAgentSpeaking);
  const spaceId = useAppStore((s) => s.currentSpaceId);
  const memories = useMemories(spaceId);

  const handleToggleRecord = async () => {
    if (isRecording) {
      // Stop and send
      useAppStore.getState().setIsRecording(false);
      try {
        const { audioBase64 } = await stopRecording();
        if (spaceId) {
          const space = await db.spaces.get(spaceId);
          await sendVoiceMessage(audioBase64, spaceId, space?.name || 'Space', memories);
        }
      } catch (err) {
        console.error('Recording failed:', err);
      }
    } else {
      // Start recording
      try {
        await startRecording();
        useAppStore.getState().setIsRecording(true);
      } catch (err) {
        console.error('Mic access failed:', err);
      }
    }
  };

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3">
      <button
        onClick={handleToggleRecord}
        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
          isRecording
            ? 'bg-red-500/30 border-2 border-red-400 glow-magenta animate-pulse'
            : 'bg-cyan-500/20 border-2 border-cyan-400/40 hover:bg-cyan-500/30 hover:glow-cyan'
        }`}
      >
        <span className="text-xl">{isRecording ? '⏹' : '🎤'}</span>
      </button>
      {isRecording && (
        <span className="text-xs text-red-400 animate-pulse">Listening...</span>
      )}
      {isAgentSpeaking && (
        <span className="text-xs text-cyan-400 animate-pulse">Agent speaking...</span>
      )}
    </div>
  );
}
