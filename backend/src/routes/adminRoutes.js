import express from 'express';
import {
  getAdminStats,
  getUsersOverview,
  getExpiredItemsOverview,
} from '../controllers/adminController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats', authenticate, getAdminStats);
router.get('/users-overview', authenticate, getUsersOverview);
router.get('/expired-items', authenticate, getExpiredItemsOverview);

export default router;