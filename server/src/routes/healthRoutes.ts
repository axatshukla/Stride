import { Router, Request, Response } from 'express';
import { env } from '../config/env';

export const healthRouter = Router();

/**
 * @route   GET /api/health
 * @desc    Health check endpoint for monitoring and uptime verification
 * @access  Public
 */
healthRouter.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    message: 'Stride REST API is operational',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: env.NODE_ENV,
    version: '1.0.0',
  });
});
