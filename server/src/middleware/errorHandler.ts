import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

/** Custom application error with HTTP status code */
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/** Centralized Express error-handling middleware */
export function errorHandler(
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = 'statusCode' in err ? err.statusCode : 500;
  const message = err.message || 'Internal Server Error';

  const responsePayload: {
    success: false;
    error: string;
    statusCode: number;
    stack?: string;
  } = {
    success: false,
    error: message,
    statusCode,
  };

  if (!env.isProduction) {
    responsePayload.stack = err.stack;
  }

  res.status(statusCode).json(responsePayload);
}
