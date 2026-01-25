import { Request, Response, NextFunction } from "express";
import { config, hasWebhookAuth } from "../config";

/**
 * Middleware that verifies RevenueCat webhook Authorization header.
 * The auth token is configured in the RevenueCat dashboard and must match.
 */
export function verifyRevenueCatAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Check if webhook auth is configured
  if (!hasWebhookAuth) {
    console.warn("[webhook] Webhook auth not configured, skipping verification");
    return next();
  }

  const authHeader = req.headers["authorization"];
  const expected = `Bearer ${config.REVENUECAT_WEBHOOK_AUTH_TOKEN}`;

  if (authHeader !== expected) {
    console.warn("[webhook] Invalid Authorization header");
    res.status(401).json({
      error: "INVALID_AUTH",
      message: "Invalid or missing Authorization header",
    });
    return;
  }

  next();
}
