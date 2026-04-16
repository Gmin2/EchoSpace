import { Router } from 'express';
import { openai } from '../lib/openai';
import { buildAgentPrompt } from '../lib/agent-prompt';
import { mockVoiceResponse } from '../lib/mock';
import type { VoiceRequest, VoiceResponse, AgentAction } from '../types/agent';

const router = Router();

router.post('/voice', async (req, res) => {
  try {
    const { audioBase64, context } = req.body as VoiceRequest;
    const isMock = req.headers['x-mock-mode'] === 'true';

    if (isMock) {
      const mock = mockVoiceResponse(context);
      return res.json(mock);
    }

    if (!audioBase64 || !context) {
      return res.status(400).json({ error: 'audioBase64 and context required' });
    }

    // Step 1: Transcribe audio with Whisper
    const audioBuffer = Buffer.from(audioBase64, 'base64');
    const audioFile = new File([audioBuffer], 'audio.webm', { type: 'audio/webm' });

    const transcription = await openai.audio.transcriptions.create({
      model: 'whisper-1',
      file: audioFile,
    });

    const userTranscript = transcription.text;
    console.log('Transcribed:', userTranscript);

    // Step 2: Reason with GPT-4o (text-only, same as chat route)
    const systemPrompt = buildAgentPrompt(context);

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userTranscript },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 1024,
    });

    const raw = response.choices[0].message.content || '{}';
    let agentText = raw;
    let actions: AgentAction[] = [];

    try {
      const parsed = JSON.parse(raw);
      if (parsed.message) agentText = parsed.message;
      if (Array.isArray(parsed.actions)) actions = parsed.actions;
    } catch {
      // Use raw text
    }

    // Step 3: Generate speech response with TTS
    let agentAudioBase64 = '';
    try {
      const tts = await openai.audio.speech.create({
        model: 'tts-1',
        voice: 'alloy',
        input: agentText,
      });
      const ttsBuffer = Buffer.from(await tts.arrayBuffer());
      agentAudioBase64 = ttsBuffer.toString('base64');
    } catch (ttsErr) {
      console.error('TTS failed:', ttsErr);
    }

    const result: VoiceResponse = {
      transcript: userTranscript,
      agentText,
      agentAudioBase64,
      actions,
    };

    res.json(result);
  } catch (error: any) {
    console.error('Voice route error:', error?.message || error);
    res.status(500).json({ error: 'Voice processing failed' });
  }
});

export default router;
