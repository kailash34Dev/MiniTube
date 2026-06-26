import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import uploadRoutes from './routes/uploadRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.use('/api/videos', uploadRoutes);

app.listen(PORT, () => {
  console.log(`Video Upload Service is running on port ${PORT}`);
});
