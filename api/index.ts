// Vercel serverless entry point
// This file exports the Express app as a handler for Vercel Functions
import { app, initRoutes } from "../server/app";

// Initialize routes on cold start
const routesReady = initRoutes();

// Export handler that waits for routes to be ready
export default async function handler(req: any, res: any) {
  await routesReady;
  return app(req, res);
}
