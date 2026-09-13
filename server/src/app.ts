import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { healthRouter } from './routes/healthRoutes';
import { authRouter } from './routes/authRoutes';
import { taskRouter } from './routes/taskRoutes';
import teamRouter from './routes/teamRoutes';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';

export function createApp(): Express {
  const app = express();

  // 1. Security Headers via Helmet
  app.use(helmet());

  // 2. Cross-Origin Resource Sharing (CORS)
  app.use(
    cors({
      origin: [env.CLIENT_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-team-id'],
    })
  );

  // 3. Request Logging
  if (!env.isProduction) {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined'));
  }

  // 4. Body Parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // 5. API Routes Mounts
  app.use('/api/health', healthRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/teams', teamRouter);
  app.use('/api/tasks', taskRouter);

  // 6. 404 & Global Error Handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
