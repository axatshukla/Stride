import dotenv from 'dotenv';
import path from 'path';

// Load .env from project root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const env = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  JWT_SECRET: process.env.JWT_SECRET || 'stride_jwt_secret_dev_key_secure_123',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1h',
  DATABASE_URL: process.env.DATABASE_URL || process.env.NEON_DATABASE_URL || '',
  DB_TYPE: process.env.DATABASE_URL ? 'postgres' : (process.env.DB_TYPE || 'sqlite'),
  DB_PATH: process.env.DB_PATH || './server/data/taskflow.db',
  isProduction: process.env.NODE_ENV === 'production',
};
