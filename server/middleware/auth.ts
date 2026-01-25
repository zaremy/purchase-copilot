import { Request, Response, NextFunction } from "express";
import { createClient } from "@supabase/supabase-js";
import { config, hasSupabase } from "../config";

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email?: string;
      };
    }
  }
}

// Create Supabase admin client for token verification
const supabaseAdmin = hasSupabase
  ? createClient(config.SUPABASE_URL!, config.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

/**
 * Middleware that requires a valid Supabase auth token.
 * Extracts user from JWT and attaches to req.user.
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  // If Supabase is not configured, skip auth (development mode)
  if (!supabaseAdmin) {
    console.warn("[auth] Supabase not configured, skipping auth");
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "UNAUTHORIZED", message: "Missing or invalid Authorization header" });
    return;
  }

  const token = authHeader.slice(7); // Remove "Bearer " prefix

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      res.status(401).json({ error: "UNAUTHORIZED", message: "Invalid or expired token" });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
    };

    next();
  } catch (err) {
    console.error("[auth] Token verification error:", err);
    res.status(500).json({ error: "INTERNAL_ERROR", message: "Authentication failed" });
  }
}
