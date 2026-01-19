import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertVehicleSchema, updateVehicleSchema } from "@shared/schema";
import { pool } from "./db";
import { config, isProduction } from "./config";

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
