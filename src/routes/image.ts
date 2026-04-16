import { Router } from 'express';
import { openai } from '../lib/openai';
import { mockImageResponse } from '../lib/mock';
import type { ImageRequest, ImageResponse } from '../types/agent';

const router = Router();

router.post('/image', async (req, res) => {
  try {
    const { prompt } = req.body as ImageRequest;
    const isMock = req.headers['x-mock-mode'] === 'true';

    if (isMock) {
      return res.json({ imageUrl: mockImageResponse() } as ImageResponse);
    }

    if (!prompt) {
      return res.status(400).json({ error: 'prompt required' });
    }

    const response = await openai.images.generate({
      model: 'gpt-image-1',
      prompt: `Futuristic holographic visualization: ${prompt}. Style: glowing neon, dark background, sci-fi aesthetic.`,
      n: 1,
      size: '1024x1024',
      quality: 'low',
    });

    const imageBase64 = response.data?.[0]?.b64_json;
    const imageUrl = `data:image/png;base64,${imageBase64}`;

    res.json({ imageUrl } as ImageResponse);
  } catch (error: any) {
    console.error('Image route error:', error?.message || error);
    res.status(500).json({ error: 'Image generation failed' });
  }
});

export default router;
