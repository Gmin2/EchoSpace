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

    const systemPrompt = buildAgentPrompt(context);

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-audio-preview',
      modalities: ['text', 'audio'],
      audio: { voice: 'alloy', format: 'wav' },
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Current space: "${context.spaceName}". ${context.memories.length} memories loaded.`,
            },
            {
              type: 'input_audio',
              input_audio: { data: audioBase64, format: 'wav' },
            },
          ],
        },
      ],
    });

    const choice = response.choices[0];
    const agentAudioBase64 = choice.message.audio?.data || '';
    const agentTranscript = choice.message.audio?.transcript || choice.message.content || '';

    // Try to parse structured actions from text content
    let agentText = agentTranscript;
    let actions: AgentAction[] = [];

    try {
      const parsed = JSON.parse(agentTranscript);
      if (parsed.message) agentText = parsed.message;
      if (Array.isArray(parsed.actions)) actions = parsed.actions;
    } catch {
      // Agent responded naturally without JSON — that's fine
    }

    const result: VoiceResponse = {
      transcript: agentTranscript,
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
