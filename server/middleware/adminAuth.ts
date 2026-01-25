import { Request, Response, NextFunction } from "express";
import { config, isProduction, adminEndpointsEnabled } from "../config";

// Extend Express Request to include adminId
declare global {
  namespace Express {
    interface Request {
      adminId?: string;
    }
  }
}

/**
 * Middleware that requires admin authentication via X-Admin-Key header.
 * Disabled in production unless ADMIN_ENDPOINTS_ENABLED=true.
 */
export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Fail in production unless explicitly enabled
  if (isProduction && !adminEndpointsEnabled) {
    res.status(403).json({
      error: "ADMIN_DISABLED",
      message: "Admin endpoints are disabled in production",
    });
    return;
  }

  const key = req.headers["x-admin-key"];

  // Check if admin key is configured
  if (!config.ADMIN_SERVICE_KEY) {
    res.status(500).json({
      error: "INTERNAL_ERROR",
      message: "Admin service key not configured",
    });
    return;
  }

  // Verify the key
  if (key !== config.ADMIN_SERVICE_KEY) {
    res.status(401).json({
      error: "UNAUTHORIZED",
      message: "Invalid or missing X-Admin-Key header",
    });
    return;
  }

  // Set admin identifier for receipts
  req.adminId = "service-key";
  next();
}
