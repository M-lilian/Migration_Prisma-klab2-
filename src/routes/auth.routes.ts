import { Router } from 'express';
import { register, login, getMe, changePassword, forgotPassword, resetPassword } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Public routes (No JWT required)
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Protected routes (JWT required)
router.get('/me', authenticate, getMe);
router.post('/change-password', authenticate, changePassword);

export default router;