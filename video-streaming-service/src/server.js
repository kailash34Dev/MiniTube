import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import streamingRoutes from './routes/streamingRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;

app.use(cors());
app.use(express.json());

app.use('/api/videos', streamingRoutes);

app.listen(PORT, () => {
  console.log(`Video Streaming Service is running on port ${PORT}`);
});
