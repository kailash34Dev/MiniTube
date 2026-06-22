import express from 'express';
import multer from 'multer';
import upload from '../middlewares/upload.js';
import { uploadVideo, getAllVideos, getVideoById } from '../controllers/videoController.js';

const router = express.Router();

router.get('/', getAllVideos);
router.get('/:id', getVideoById);
router.post('/upload', upload.single('video'), uploadVideo);

// Handle Multer errors globally for this router
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  } else if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
});

export default router;
