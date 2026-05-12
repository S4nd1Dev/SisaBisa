import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import {
  register,
  login,
  sendOtp,
  verifyRegister,
} from '../controllers/authController.js';


const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/send-otp', sendOtp);
router.post('/verify-register', verifyRegister);
router.get('/me', authenticate, (req, res) => {
  res.json({
    message: 'Token valid',
    user: req.user,
  });
});

export default router;