import { describe, it, expect, vi, beforeEach } from "vitest";
import type { EntitlementsPayload } from "@shared/schema";
import { DEFAULT_ENTITLEMENTS } from "@shared/schema";

/**
 * Test the deriveFeatures function logic.
 * Since it's defined in routes.ts, we recreate the logic here for unit testing.
 */
function deriveFeatures(entitlements: EntitlementsPayload) {
  const isPro = entitlements.pro &&
    (!entitlements.expiresAt || new Date(entitlements.expiresAt) > new Date());
  return { reports: isPro, vin: isPro, photos: isPro, ai: isPro };
}

describe("deriveFeatures", () => {
  it("should return all features enabled for active pro subscription", () => {
    const entitlements: EntitlementsPayload = {
      version: 1,
      pro: true,
      source: "revenuecat",
      updatedAt: "2026-01-24T00:00:00Z",
      expiresAt: "2027-01-24T00:00:00Z", // Future date
    };

    const features = deriveFeatures(entitlements);

    expect(features.reports).toBe(true);
    expect(features.vin).toBe(true);
    expect(features.photos).toBe(true);
    expect(features.ai).toBe(true);
  });

  it("should return all features disabled when pro=false", () => {
    const entitlements: EntitlementsPayload = {
      version: 1,
      pro: false,
      source: "admin",
      updatedAt: "2026-01-24T00:00:00Z",
    };

    const features = deriveFeatures(entitlements);

    expect(features.reports).toBe(false);
    expect(features.vin).toBe(false);
    expect(features.photos).toBe(false);
    expect(features.ai).toBe(false);
  });

  it("should return all features disabled when subscription expired", () => {
    const entitlements: EntitlementsPayload = {
      version: 1,
      pro: true,
      source: "revenuecat",
      updatedAt: "2026-01-24T00:00:00Z",
      expiresAt: "2020-01-01T00:00:00Z", // Past date
    };

    const features = deriveFeatures(entitlements);

    expect(features.reports).toBe(false);
    expect(features.vin).toBe(false);
    expect(features.photos).toBe(false);
    expect(features.ai).toBe(false);
  });

  it("should return features enabled for pro without expiration (lifetime/admin grant)", () => {
    const entitlements: EntitlementsPayload = {
      version: 1,
      pro: true,
      source: "admin",
      updatedAt: "2026-01-24T00:00:00Z",
      reason: "beta tester",
    };

    const features = deriveFeatures(entitlements);

    expect(features.reports).toBe(true);
    expect(features.vin).toBe(true);
    expect(features.photos).toBe(true);
    expect(features.ai).toBe(true);
  });

  it("should return features disabled for default entitlements", () => {
    const features = deriveFeatures(DEFAULT_ENTITLEMENTS);

    expect(features.reports).toBe(false);
    expect(features.vin).toBe(false);
    expect(features.photos).toBe(false);
    expect(features.ai).toBe(false);
  });
});

describe("DEFAULT_ENTITLEMENTS", () => {
  it("should have correct structure", () => {
    expect(DEFAULT_ENTITLEMENTS.version).toBe(1);
    expect(DEFAULT_ENTITLEMENTS.pro).toBe(false);
    expect(DEFAULT_ENTITLEMENTS.source).toBe("admin");
    expect(typeof DEFAULT_ENTITLEMENTS.updatedAt).toBe("string");
  });
});
