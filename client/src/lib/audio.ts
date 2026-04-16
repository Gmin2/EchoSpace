let mediaRecorder: MediaRecorder | null = null;
let audioChunks: Blob[] = [];

export async function startRecording(): Promise<void> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
  audioChunks = [];

  mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      audioChunks.push(event.data);
    }
  };

  mediaRecorder.start();
}

export async function stopRecording(): Promise<{ audioBase64: string; blob: Blob }> {
  return new Promise((resolve, reject) => {
    if (!mediaRecorder) {
      reject(new Error('No active recording'));
      return;
    }

    mediaRecorder.onstop = async () => {
      const blob = new Blob(audioChunks, { type: 'audio/webm' });

      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve({ audioBase64: base64, blob });
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);

      // Stop all tracks
      mediaRecorder!.stream.getTracks().forEach((track) => track.stop());
      mediaRecorder = null;
    };

    mediaRecorder.stop();
  });
}

export function playAudioBase64(base64: string, format = 'wav'): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!base64) {
      resolve();
      return;
    }
    const audio = new Audio(`data:audio/${format};base64,${base64}`);
    audio.onended = () => resolve();
    audio.onerror = () => reject(new Error('Audio playback failed'));
    audio.play();
  });
}

export function isRecordingSupported(): boolean {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}
