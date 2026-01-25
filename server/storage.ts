import { eq, or, sql } from "drizzle-orm";
import { db } from "./db";
import {
  type User, type InsertUser,
  type Vehicle, type InsertVehicle, type UpdateVehicle,
  type Profile, type AdminReceipt, type WebhookReceipt,
  type EntitlementsPayload, DEFAULT_ENTITLEMENTS,
  users, vehicles, profiles, adminReceipts, webhookReceipts
} from "@shared/schema";

export interface SetProParams {
  userId: string;
  pro: boolean;
  reason: string;
  adminId: string;
}

export interface InsertWebhookReceiptParams {
  eventId: string;
  eventType: string;
  eventTimestamp: Date;
  appUserId: string;
  payloadHash: string;
}

export interface ProcessWebhookResult {
  receiptId: string;
  dedupe: boolean;
  processed: boolean;
  userId: string | null;
}

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Profile methods
  getProfile(id: string): Promise<Profile | undefined>;

  // Entitlement methods
  setPro(params: SetProParams): Promise<AdminReceipt>;

  // Webhook methods
  resolveUserId(appUserId: string): Promise<string | null>;
  insertWebhookReceipt(params: InsertWebhookReceiptParams): Promise<{ receipt: WebhookReceipt | null; dedupe: boolean }>;
  markReceiptProcessed(receiptId: string, userId: string | null, entitlementSnapshot: EntitlementsPayload): Promise<void>;
  updateProfileEntitlements(userId: string, entitlements: EntitlementsPayload): Promise<void>;

  // Vehicle methods
  getVehicles(): Promise<Vehicle[]>;
  getVehicle(id: string): Promise<Vehicle | undefined>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicle(id: string, vehicle: UpdateVehicle): Promise<Vehicle | undefined>;
  deleteVehicle(id: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  // Profile methods
  async getProfile(id: string): Promise<Profile | undefined> {
    const result = await db.select().from(profiles).where(eq(profiles.id, id)).limit(1);
    return result[0];
  }

  // Entitlement methods
  async setPro(params: SetProParams): Promise<AdminReceipt> {
    const { userId, pro, reason, adminId } = params;

    // Get current profile and entitlements
    const profile = await this.getProfile(userId);
    if (!profile) {
      throw new Error("USER_NOT_FOUND");
    }

    // Get current entitlements (with null-safe default)
    const currentEntitlements = (profile.entitlements as EntitlementsPayload)?.version
      ? (profile.entitlements as EntitlementsPayload)
      : DEFAULT_ENTITLEMENTS;

    // Build new entitlements
    const newEntitlements: EntitlementsPayload = {
      version: 1,
      pro,
      source: "admin",
      updatedAt: new Date().toISOString(),
      reason,
    };

    // Update profile entitlements
    await db
      .update(profiles)
      .set({
        entitlements: newEntitlements,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, userId));

    // Create admin receipt
    const [receipt] = await db
      .insert(adminReceipts)
      .values({
        adminId,
        userId,
        operation: pro ? "set" : "revoke",
        reason,
        entitlementBefore: currentEntitlements,
        entitlementAfter: newEntitlements,
      })
      .returning();

    return receipt;
  }

  // Webhook methods

  /**
   * Resolve RevenueCat app_user_id to profile UUID.
   * Tries revenuecat_app_user_id first, then falls back to matching by id.
   */
  async resolveUserId(appUserId: string): Promise<string | null> {
    // Try to match by revenuecat_app_user_id first
    const byRevenueCatId = await db
      .select({ id: profiles.id })
      .from(profiles)
      .where(eq(profiles.revenuecatAppUserId, appUserId))
      .limit(1);

    if (byRevenueCatId[0]) {
      return byRevenueCatId[0].id;
    }

    // Fall back to matching by profile id (if appUserId is a valid UUID)
    // This handles the case where SDK logs in with Supabase user ID directly
    try {
      const byId = await db
        .select({ id: profiles.id })
        .from(profiles)
        .where(eq(profiles.id, appUserId))
        .limit(1);

      return byId[0]?.id ?? null;
    } catch {
      // appUserId is not a valid UUID, can't match by id
      return null;
    }
  }

  /**
   * Insert webhook receipt with idempotency.
   * Returns dedupe: true if receipt already exists (conflict on eventId).
   */
  async insertWebhookReceipt(params: InsertWebhookReceiptParams): Promise<{ receipt: WebhookReceipt | null; dedupe: boolean }> {
    const { eventId, eventType, eventTimestamp, appUserId, payloadHash } = params;

    // Resolve user ID before insert
    const userId = await this.resolveUserId(appUserId);

    // Insert with ON CONFLICT DO NOTHING for idempotency
    const result = await db
      .insert(webhookReceipts)
      .values({
        eventId,
        eventType,
        eventTimestamp,
        appUserId,
        userId,
        payloadHash,
        processedStatus: 'pending',
      })
      .onConflictDoNothing({ target: webhookReceipts.eventId })
      .returning();

    if (result.length === 0) {
      // Conflict - receipt already exists (dedupe)
      return { receipt: null, dedupe: true };
    }

    return { receipt: result[0], dedupe: false };
  }

  /**
   * Mark webhook receipt as processed with entitlement snapshot.
   */
  async markReceiptProcessed(
    receiptId: string,
    userId: string | null,
    entitlementSnapshot: EntitlementsPayload
  ): Promise<void> {
    await db
      .update(webhookReceipts)
      .set({
        processedStatus: 'processed',
        userId,
        entitlementSnapshot,
        processedAt: new Date(),
      })
      .where(eq(webhookReceipts.id, receiptId));
  }

  /**
   * Update profile entitlements.
   */
  async updateProfileEntitlements(userId: string, entitlements: EntitlementsPayload): Promise<void> {
    await db
      .update(profiles)
      .set({
        entitlements,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, userId));
  }

  // Vehicle methods
  async getVehicles(): Promise<Vehicle[]> {
    return await db.select().from(vehicles).orderBy(vehicles.createdAt);
  }

  async getVehicle(id: string): Promise<Vehicle | undefined> {
    const result = await db.select().from(vehicles).where(eq(vehicles.id, id)).limit(1);
    return result[0];
  }

  async createVehicle(insertVehicle: InsertVehicle): Promise<Vehicle> {
    const result = await db.insert(vehicles).values(insertVehicle).returning();
    return result[0];
  }

  async updateVehicle(id: string, updateVehicle: UpdateVehicle): Promise<Vehicle | undefined> {
    const result = await db
      .update(vehicles)
      .set({ ...updateVehicle, updatedAt: new Date() })
      .where(eq(vehicles.id, id))
      .returning();
    return result[0];
  }

  async deleteVehicle(id: string): Promise<boolean> {
    const result = await db.delete(vehicles).where(eq(vehicles.id, id)).returning();
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();
