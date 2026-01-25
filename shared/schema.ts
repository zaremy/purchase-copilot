import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const vehicles = pgTable("vehicles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  // user_id is nullable for now (PR1), will be required after RLS enabled (PR2)
  // FK references auth.users(id) - managed by Supabase Auth
  userId: uuid("user_id"),
  vin: text("vin").notNull(),
  year: integer("year").notNull(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  trim: text("trim"),
  price: integer("price").notNull().default(0),
  mileage: integer("mileage").notNull().default(0),
  color: text("color"),
  titleStatus: text("title_status"),
  image: text("image"),
  bodyType: text("body_type").notNull().default('other'),
  riskScore: integer("risk_score").notNull().default(0),
  completeness: integer("completeness").notNull().default(0),
  status: text("status").notNull().default('active'),
  checklistResponses: jsonb("checklist_responses").notNull().default({}),
  notes: text("notes").notNull().default(''),
  engine: text("engine"),
  transmission: text("transmission"),
  drivetrain: text("drivetrain"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertVehicleSchema = createInsertSchema(vehicles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateVehicleSchema = insertVehicleSchema.partial();

export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type UpdateVehicle = z.infer<typeof updateVehicleSchema>;
export type Vehicle = typeof vehicles.$inferSelect;

// Entitlements JSONB schema (profiles.entitlements)
// Version 1: pro flag with derived features
export interface EntitlementsPayload {
  version: 1;
  pro: boolean;
  source: 'admin' | 'revenuecat';
  updatedAt: string;
  expiresAt?: string;
  reason?: string;
  receiptId?: string;
}

// Default entitlements (null-safe)
export const DEFAULT_ENTITLEMENTS: EntitlementsPayload = {
  version: 1,
  pro: false,
  source: 'admin',
  updatedAt: new Date().toISOString(),
};

// Profiles table - auto-created by trigger on auth.users insert
// id references auth.users(id) - managed by Supabase Auth
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  firstName: text("first_name"),
  email: text("email"),
  phone: text("phone"),
  zipCode: text("zip_code"),
  entitlements: jsonb("entitlements").notNull().default({}),
  revenuecatAppUserId: text("revenuecat_app_user_id").unique(), // Set when RevenueCat SDK initializes
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertProfileSchema = createInsertSchema(profiles).omit({
  createdAt: true,
  updatedAt: true,
});

export const updateProfileSchema = insertProfileSchema.partial().omit({
  id: true,
});

export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type UpdateProfile = z.infer<typeof updateProfileSchema>;
export type Profile = typeof profiles.$inferSelect;

// Webhook receipts - every accepted RevenueCat webhook event
export const webhookReceipts = pgTable("webhook_receipts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: text("event_id").notNull().unique(), // RevenueCat event_id (idempotency key)
  eventType: text("event_type").notNull(),
  eventTimestamp: timestamp("event_timestamp").notNull(),
  appUserId: text("app_user_id").notNull(), // RevenueCat app_user_id (text, may not be UUID)
  userId: uuid("user_id"), // resolved profile UUID (nullable if unresolved)
  payloadHash: text("payload_hash").notNull(),
  processedStatus: text("processed_status").notNull().default('pending'), // 'pending' | 'processed' | 'skipped'
  skippedReason: text("skipped_reason"),
  entitlementSnapshot: jsonb("entitlement_snapshot"), // state after processing (null until processed)
  createdAt: timestamp("created_at").notNull().defaultNow(),
  processedAt: timestamp("processed_at"),
});

export type WebhookReceipt = typeof webhookReceipts.$inferSelect;
export type InsertWebhookReceipt = typeof webhookReceipts.$inferInsert;

// Admin receipts - explicit admin entitlement overrides
export const adminReceipts = pgTable("admin_receipts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  adminId: text("admin_id").notNull(), // service key identifier
  userId: uuid("user_id").notNull(), // profile UUID
  operation: text("operation").notNull(), // 'set' | 'revoke'
  reason: text("reason").notNull(),
  entitlementBefore: jsonb("entitlement_before"),
  entitlementAfter: jsonb("entitlement_after").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type AdminReceipt = typeof adminReceipts.$inferSelect;
export type InsertAdminReceipt = typeof adminReceipts.$inferInsert;
