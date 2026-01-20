// Vercel Express entry point
// This file must NOT call listen() - Vercel handles request routing

// CRITICAL: Sentry must be initialized first before any other imports
import { initSentryServerless, flushSentry, Sentry } from "./sentry-serverless";
initSentryServerless();

import { waitUntil } from "@vercel/functions";
import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import { storage } from "../server/storage";
import { insertVehicleSchema, updateVehicleSchema } from "../shared/schema";
import { pool } from "../server/db";

const app = express();

// Middleware to flush Sentry before serverless function exits
// MUST be first middleware to ensure it runs for all requests
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.on("finish", () => {
    // waitUntil keeps function alive until Sentry events are flushed
    waitUntil(flushSentry(2000));
  });
  next();
});

// Middleware
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// GET /api/health - Health check endpoint
app.get("/api/health", async (req, res) => {
  const startTime = Date.now();
  const checks: Record<string, { status: "ok" | "error"; latencyMs?: number; error?: string }> = {};

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
    environment: process.env.NODE_ENV || "production",
    version: process.env.npm_package_version || "unknown",
    checks,
    totalLatencyMs: Date.now() - startTime,
  };

  res.status(allHealthy ? 200 : 503).json(response);
});

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
    if (error instanceof Error && error.name === "ZodError") {
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
    if (error instanceof Error && error.name === "ZodError") {
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

// Sentry error handler MUST be after all routes
Sentry.setupExpressErrorHandler(app);

// Error handler (after Sentry)
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
});

// Export the Express app as default - Vercel wraps it automatically
export default app;
