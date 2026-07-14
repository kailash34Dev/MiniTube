import express from 'express';
import { getAllVideos, getVideoById, streamVideoProxy, getRecommendations } from '../controllers/streamingController.js';

const router = express.Router();

router.get('/', getAllVideos);
router.get('/stream/:id/*file', streamVideoProxy);
router.get('/:id/recommendations', getRecommendations);
router.get('/:id', getVideoById);

export default router;
