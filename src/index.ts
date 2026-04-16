import express from 'express';
import cors from 'cors';
import { config } from './config';
import healthRouter from './routes/health';
import voiceRouter from './routes/voice';
import chatRouter from './routes/chat';
import imageRouter from './routes/image';

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.use('/api', healthRouter);
app.use('/api', voiceRouter);
app.use('/api', chatRouter);
app.use('/api', imageRouter);

app.listen(config.port, () => {
  console.log(`EchoSpace server running on http://localhost:${config.port}`);
  console.log(`API key configured: ${config.openaiApiKey ? 'yes' : 'NO — set OPENAI_API_KEY in .env'}`);
});
