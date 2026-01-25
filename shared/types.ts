/**
 * Entitlements response returned by GET /api/entitlements
 * Contains derived features, not raw pro flag
 */
export interface EntitlementsResponse {
  version: 1;
  features: {
    reports: boolean;
    vin: boolean;
    photos: boolean;
    ai: boolean;
  };
  updatedAt: string;
}

/**
 * Feature names that can be checked via useEntitlement hook
 */
export type Feature = 'reports' | 'vin' | 'photos' | 'ai';

/**
 * Tri-state entitlement status for UI gating
 * - unknown: entitlements not yet loaded
 * - allowed: user has access to the feature
 * - denied: user does not have access
 */
export type EntitlementState = 'unknown' | 'allowed' | 'denied';
