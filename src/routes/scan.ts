import { Router } from 'express';
import { fal } from '@fal-ai/client';
import { config } from '../config';

const router = Router();

// Configure fal client
fal.config({ credentials: config.falKey });

interface ScanRequest {
  front: string;   // base64 image
  left?: string;
  back?: string;
  right?: string;
}

interface ScanResponse {
  modelUrl: string;
  previewUrl?: string;
  taskId: string;
}

// Helper: base64 to Blob then upload to fal storage
async function uploadBase64(base64: string, name: string): Promise<string> {
  const buffer = Buffer.from(base64, 'base64');
  const blob = new Blob([buffer], { type: 'image/jpeg' });
  const file = new File([blob], `${name}.jpg`, { type: 'image/jpeg' });
  const url = await fal.storage.upload(file);
  return url;
}

router.post('/scan', async (req, res) => {
  try {
    const { front, left, back, right } = req.body as ScanRequest;
    const isMock = req.headers['x-mock-mode'] === 'true';

    if (isMock) {
      return res.json({
        modelUrl: '',
        previewUrl: '',
        taskId: 'mock-task',
      } as ScanResponse);
    }

    if (!front) {
      return res.status(400).json({ error: 'front image required' });
    }

    if (!config.falKey) {
      return res.status(500).json({ error: 'FAL_KEY not configured' });
    }

    console.log('Uploading images to fal storage...');

    // Upload images to fal storage
    const input: Record<string, string> = {};
    input.front_image_url = await uploadBase64(front, 'front');
    console.log('  front uploaded');

    if (left) {
      input.left_image_url = await uploadBase64(left, 'left');
      console.log('  left uploaded');
    }
    if (back) {
      input.back_image_url = await uploadBase64(back, 'back');
      console.log('  back uploaded');
    }
    if (right) {
      input.right_image_url = await uploadBase64(right, 'right');
      console.log('  right uploaded');
    }

    console.log('Calling Tripo3D API...');

    // Call Tripo3D
    const result = await fal.subscribe('tripo3d/tripo/v2.5/multiview-to-3d', {
      input: {
        front_image_url: input.front_image_url,
        left_image_url: input.left_image_url,
        back_image_url: input.back_image_url,
        right_image_url: input.right_image_url,
        texture: 'standard' as const,
        texture_alignment: 'original_image' as const,
        orientation: 'align_image' as const,
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === 'IN_PROGRESS' && update.logs) {
          update.logs.forEach((log) => console.log('  [tripo]', log.message));
        }
      },
    });

    const data = result.data as any;
    const response: ScanResponse = {
      modelUrl: data.model_mesh?.url || '',
      previewUrl: data.rendered_image?.url || '',
      taskId: data.task_id || '',
    };

    console.log('Scan complete:', response.modelUrl);
    res.json(response);
  } catch (error: any) {
    console.error('Scan route error:', error?.message || error);
    res.status(500).json({ error: 'Scan processing failed', details: error?.message });
  }
});

export default router;
