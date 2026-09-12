import { Router } from 'express';
import { signup, login, getMe, getAllUsers } from '../controllers/authController';
import { requireAuth } from '../middleware/authMiddleware';

export const authRouter = Router();

// Public Authentication Endpoints
authRouter.post('/signup', signup);
authRouter.post('/login', login);

// Protected Authentication Endpoints
authRouter.get('/me', requireAuth, getMe);
authRouter.get('/users', requireAuth, getAllUsers);
