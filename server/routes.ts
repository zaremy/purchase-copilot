import type { Express } from "express";
import { createServer, type Server } from "http";
import crypto from "crypto";
import { storage } from "./storage";
import { insertVehicleSchema, updateVehicleSchema, type EntitlementsPayload, DEFAULT_ENTITLEMENTS } from "@shared/schema";
import type { EntitlementsResponse } from "@shared/types";
import { pool } from "./db";
import { config, isProduction } from "./config";
import { requireAuth } from "./middleware/auth";
import { requireAdmin } from "./middleware/adminAuth";
import { verifyRevenueCatAuth } from "./middleware/webhookAuth";
import { getSubscriber, getProStatus } from "./billing/revenueCatClient";
import { z } from "zod";

// Validation schemas for admin endpoints
const setProSchema = z.object({
  userId: z.string().uuid(),
  pro: z.boolean(),
  reason: z.string().min(1, "Reason is required"),
});

const revokeSchema = z.object({
  userId: z.string().uuid(),
  reason: z.string().min(1, "Reason is required"),
});

/**
 * Derive feature flags from entitlements payload.
 * pro=true unlocks all features; server-side only.
 */
function deriveFeatures(entitlements: EntitlementsPayload): EntitlementsResponse['features'] {
  const isPro = entitlements.pro &&
    (!entitlements.expiresAt || new Date(entitlements.expiresAt) > new Date());
  return { reports: isPro, vin: isPro, photos: isPro, ai: isPro };
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // GET /api/health - Health check endpoint
  app.get("/api/health", async (req, res) => {
    const startTime = Date.now();
    const checks: Record<string, { status: "ok" | "error"; latencyMs?: number; error?: string }> = {};

    // Database connectivity check
    try {
      const dbStart = Date.now();
      await pool.query("SELECT 1");
      checks.database = { status: "ok", latencyMs: Date.now() - dbStart };
    } catch (error) {
      checks.database = {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }

    const allHealthy = Object.values(checks).every((c) => c.status === "ok");
    const response = {
      status: allHealthy ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      environment: config.NODE_ENV,
      version: process.env.npm_package_version || "unknown",
      checks,
      totalLatencyMs: Date.now() - startTime,
    };

    res.status(allHealthy ? 200 : 503).json(response);
  });

  // ==========================================================================
  // Entitlements Endpoints
  // ==========================================================================

  // GET /api/entitlements - Get current user's derived feature entitlements
  app.get("/api/entitlements", requireAuth, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "UNAUTHORIZED" });
      }

      const profile = await storage.getProfile(req.user.id);
      if (!profile) {
        return res.status(404).json({ error: "PROFILE_NOT_FOUND" });
      }

      // Null-safe: use default if entitlements missing or empty
      const entitlements = (profile.entitlements as EntitlementsPayload)?.version
        ? (profile.entitlements as EntitlementsPayload)
        : DEFAULT_ENTITLEMENTS;

      const response: EntitlementsResponse = {
        version: 1,
        features: deriveFeatures(entitlements),
        updatedAt: entitlements.updatedAt,
      };

      res.json(response);
    } catch (error) {
      console.error("Error fetching entitlements:", error);
      res.status(500).json({ error: "INTERNAL_ERROR" });
    }
  });

  // ==========================================================================
  // Admin Endpoints (disabled in production unless ADMIN_ENDPOINTS_ENABLED=true)
  // ==========================================================================

  // POST /api/admin/entitlements/set - Set pro status for a user
  app.post("/api/admin/entitlements/set", requireAdmin, async (req, res) => {
    try {
      const { userId, pro, reason } = setProSchema.parse(req.body);

      const receipt = await storage.setPro({
        userId,
        pro,
        reason,
        adminId: req.adminId!,
      });

      res.json({ success: true, receiptId: receipt.id });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "VALIDATION_ERROR", details: error.errors });
      }
      if (error instanceof Error && error.message === "USER_NOT_FOUND") {
        return res.status(404).json({ error: "USER_NOT_FOUND" });
      }
      console.error("Error setting entitlements:", error);
      res.status(500).json({ error: "INTERNAL_ERROR" });
    }
  });

  // POST /api/admin/entitlements/revoke - Revoke pro status for a user
  app.post("/api/admin/entitlements/revoke", requireAdmin, async (req, res) => {
    try {
      const { userId, reason } = revokeSchema.parse(req.body);

      // Revoke is just setPro with pro=false
      const receipt = await storage.setPro({
        userId,
        pro: false,
        reason,
        adminId: req.adminId!,
      });

      res.json({ success: true, receiptId: receipt.id });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "VALIDATION_ERROR", details: error.errors });
      }
      if (error instanceof Error && error.message === "USER_NOT_FOUND") {
        return res.status(404).json({ error: "USER_NOT_FOUND" });
      }
      console.error("Error revoking entitlements:", error);
      res.status(500).json({ error: "INTERNAL_ERROR" });
    }
  });

  // ==========================================================================
  // Billing Webhook Endpoints
  // ==========================================================================

  // POST /api/billing/webhook - RevenueCat webhook handler
  app.post("/api/billing/webhook", verifyRevenueCatAuth, async (req, res) => {
    try {
      const { event } = req.body;

      if (!event?.id || !event?.type || !event?.app_user_id) {
        return res.status(400).json({ error: "INVALID_PAYLOAD", message: "Missing required event fields" });
      }

      // Hash payload for audit trail
      const payloadHash = crypto
        .createHash("sha256")
        .update(JSON.stringify(req.body))
        .digest("hex");

      // Step 1: Insert receipt (idempotency via eventId unique constraint)
      const { receipt, dedupe } = await storage.insertWebhookReceipt({
        eventId: event.id,
        eventType: event.type,
        eventTimestamp: new Date(event.event_timestamp_ms),
        appUserId: event.app_user_id,
        payloadHash,
      });

      if (dedupe) {
        // Already processed this event
        return res.json({ received: true, dedupe: true });
      }

      // Step 2: Fetch canonical subscriber state from RevenueCat
      const subscriber = await getSubscriber(event.app_user_id);
      const { isPro, expiresAt } = getProStatus(subscriber);

      // Step 3: Build entitlement snapshot
      const entitlementSnapshot: EntitlementsPayload = {
        version: 1,
        pro: isPro,
        source: "revenuecat",
        updatedAt: new Date().toISOString(),
        expiresAt,
        receiptId: receipt!.id,
      };

      // Step 4: Update profile entitlements (if user resolved)
      if (receipt!.userId) {
        await storage.updateProfileEntitlements(receipt!.userId, entitlementSnapshot);
      }

      // Step 5: Mark receipt as processed
      await storage.markReceiptProcessed(receipt!.id, receipt!.userId, entitlementSnapshot);

      res.json({ received: true, processed: true, userId: receipt!.userId });
    } catch (error) {
      console.error("[webhook] Error processing webhook:", error);
      // Still return 200 to prevent RevenueCat retries for processing errors
      // The receipt is already recorded, we can investigate later
      res.json({ received: true, error: "PROCESSING_ERROR" });
    }
  });

  // ==========================================================================
  // Vehicle Endpoints
  // ==========================================================================

  // GET /api/vehicles - Get all vehicles
  app.get("/api/vehicles", async (req, res) => {
    try {
      const vehicles = await storage.getVehicles();
      res.json(vehicles);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      res.status(500).json({ error: "Failed to fetch vehicles" });
    }
  });

  // GET /api/vehicles/:id - Get a specific vehicle
  app.get("/api/vehicles/:id", async (req, res) => {
    try {
      const vehicle = await storage.getVehicle(req.params.id);
      if (!vehicle) {
        return res.status(404).json({ error: "Vehicle not found" });
      }
      res.json(vehicle);
    } catch (error) {
      console.error("Error fetching vehicle:", error);
      res.status(500).json({ error: "Failed to fetch vehicle" });
    }
  });

  // POST /api/vehicles - Create a new vehicle
  app.post("/api/vehicles", async (req, res) => {
    try {
      const validatedData = insertVehicleSchema.parse(req.body);
      const vehicle = await storage.createVehicle(validatedData);
      res.status(201).json(vehicle);
    } catch (error) {
      console.error("Error creating vehicle:", error);
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ error: "Invalid vehicle data", details: error });
      }
      res.status(500).json({ error: "Failed to create vehicle" });
    }
  });

  // PATCH /api/vehicles/:id - Update a vehicle
  app.patch("/api/vehicles/:id", async (req, res) => {
    try {
      const validatedData = updateVehicleSchema.parse(req.body);
      const vehicle = await storage.updateVehicle(req.params.id, validatedData);
      if (!vehicle) {
        return res.status(404).json({ error: "Vehicle not found" });
      }
      res.json(vehicle);
    } catch (error) {
      console.error("Error updating vehicle:", error);
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ error: "Invalid vehicle data", details: error });
      }
      res.status(500).json({ error: "Failed to update vehicle" });
    }
  });

  // DELETE /api/vehicles/:id - Delete a vehicle
  app.delete("/api/vehicles/:id", async (req, res) => {
    try {
      const success = await storage.deleteVehicle(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Vehicle not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      res.status(500).json({ error: "Failed to delete vehicle" });
    }
  });

  return httpServer;
}
