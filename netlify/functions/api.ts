// ============================================================
// Netlify Serverless Function Handler for Express API
// ============================================================

import serverless from 'serverless-http';
import { createApp } from '../../server/src/app';
import { initDatabase } from '../../server/src/db';

const app = createApp();
let dbReady = false;

const serverlessHandler = serverless(app);

export const handler = async (event: any, context: any) => {
  // Prevent Lambda execution freeze while DB operations resolve
  context.callbackWaitsForEmptyEventLoop = false;

  if (!dbReady) {
    await initDatabase();
    dbReady = true;
  }

  return serverlessHandler(event, context);
};
