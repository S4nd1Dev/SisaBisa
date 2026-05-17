import express from 'express';
import {
  getRecommendations,
  getRecipeDetail,
} from '../controllers/recommendationController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authenticate, getRecommendations);
router.post('/detail', authenticate, getRecipeDetail);

export default router;