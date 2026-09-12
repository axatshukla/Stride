import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

/** Middleware to catch unhandled routes and forward a 404 AppError */
export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(new AppError(`Cannot find endpoint ${req.method} ${req.originalUrl} on this server`, 404));
}
