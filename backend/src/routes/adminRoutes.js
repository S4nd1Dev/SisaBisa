import express from 'express';
import {
  getAdminStats,
  getUsersOverview,
} from '../controllers/adminController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats', authenticate, getAdminStats);
router.get('/users-overview', authenticate, getUsersOverview);

export default router;