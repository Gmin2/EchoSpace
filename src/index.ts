import express from 'express';
import cors from 'cors';
import { config } from './config';
import healthRouter from './routes/health';
import voiceRouter from './routes/voice';
import chatRouter from './routes/chat';
import imageRouter from './routes/image';
import scanRouter from './routes/scan';

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.use('/api', healthRouter);
app.use('/api', voiceRouter);
app.use('/api', chatRouter);
app.use('/api', imageRouter);
app.use('/api', scanRouter);

app.listen(config.port, () => {
  console.log(`EchoSpace server running on http://localhost:${config.port}`);
  console.log(`OpenAI: ${config.openaiApiKey ? 'yes' : 'NO'} | Fal: ${config.falKey ? 'yes' : 'NO'}`);
});
