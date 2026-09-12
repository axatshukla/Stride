import { createApp } from './app';
import { env } from './config/env';
import { initDatabase, closeDatabase } from './db';

// Initialize DB schema & seed data
initDatabase();

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(`=================================================`);
  console.log(`🚀 Stride Backend Server running in [${env.NODE_ENV}] mode`);
  console.log(`🌐 Port: ${env.PORT}`);
  console.log(`🔗 Health Check: http://localhost:${env.PORT}/api/health`);
  console.log(`=================================================`);
});

// Graceful termination handling
const handleGracefulShutdown = (signal: string) => {
  console.log(`\n🛑 Received ${signal}. Gracefully terminating HTTP server & DB...`);
  closeDatabase();
  server.close(() => {
    console.log('✅ HTTP server closed. Process exiting.');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('⚠️ Forcefully terminating server after timeout.');
    process.exit(1);
  }, 5000);
};

process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));
