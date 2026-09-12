import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth';
import { getDatabase } from '../db/database';
import { AppError } from './errorHandler';

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  initials: string;
  color: string;
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * Express middleware to authenticate requests via Bearer JWT.
 * Verifies token, fetches user from database, and attaches req.user.
 */
export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Authentication required. Missing Bearer token in Authorization header.', 401));
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return next(new AppError('Authentication required. Empty token provided.', 401));
  }

  try {
    const payload = verifyToken(token);
    const db = getDatabase();

    const user = db
      .prepare('SELECT id, name, email, initials, color FROM users WHERE id = ?')
      .get(payload.userId) as AuthenticatedUser | undefined;

    if (!user) {
      return next(new AppError('User belonging to this token no longer exists.', 401));
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}
