import { Router } from 'express';
import { openai } from '../lib/openai';
import { buildAgentPrompt } from '../lib/agent-prompt';
import { mockChatResponse } from '../lib/mock';
import type { ChatRequest, ChatResponse, AgentAction } from '../types/agent';

const router = Router();

router.post('/chat', async (req, res) => {
  try {
    const { message, context } = req.body as ChatRequest;
    const isMock = req.headers['x-mock-mode'] === 'true';

    if (isMock) {
      const mock = mockChatResponse(context);
      return res.json({ data: mock } as ChatResponse);
    }

    if (!message || !context) {
      return res.status(400).json({ error: 'message and context required' });
    }

    const systemPrompt = buildAgentPrompt(context);

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 1024,
    });

    const raw = response.choices[0].message.content || '{}';
    let agentMessage = raw;
    let actions: AgentAction[] = [];

    try {
      const parsed = JSON.parse(raw);
      if (parsed.message) agentMessage = parsed.message;
      if (Array.isArray(parsed.actions)) actions = parsed.actions;
    } catch {
      // Use raw text as message
    }

    const result: ChatResponse = {
      data: { message: agentMessage, actions },
    };

    res.json(result);
  } catch (error: any) {
    console.error('Chat route error:', error?.message || error);
    res.status(500).json({ error: 'Chat processing failed' });
  }
});

export default router;
