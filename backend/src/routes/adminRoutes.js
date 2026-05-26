import express from 'express';
import { getAdminStats } from '../controllers/adminController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats', authenticate, getAdminStats);

export default router;