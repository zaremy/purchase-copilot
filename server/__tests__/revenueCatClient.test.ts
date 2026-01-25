import { describe, it, expect, vi } from "vitest";
import {
  subscriberWithProActive,
  subscriberWithProExpired,
  subscriberWithNoEntitlements,
} from "./fixtures/revenuecat-webhooks";

// Mock the config module before importing the client
vi.mock("../config", () => ({
  config: {
    REVENUECAT_API_KEY: "test-api-key",
  },
  hasBilling: true,
}));

// Import after mocking
import { getProStatus } from "../billing/revenueCatClient";

describe("getProStatus", () => {
  it("should return isPro=true with expiresAt for active subscription", () => {
    const result = getProStatus(subscriberWithProActive.subscriber);

    expect(result.isPro).toBe(true);
    expect(result.expiresAt).toBe("2026-02-25T00:00:00Z");
  });

  it("should return isPro=false for expired subscription", () => {
    const result = getProStatus(subscriberWithProExpired.subscriber);

    expect(result.isPro).toBe(false);
    expect(result.expiresAt).toBeUndefined();
  });

  it("should return isPro=false when no entitlements exist", () => {
    const result = getProStatus(subscriberWithNoEntitlements.subscriber);

    expect(result.isPro).toBe(false);
    expect(result.expiresAt).toBeUndefined();
  });
});
