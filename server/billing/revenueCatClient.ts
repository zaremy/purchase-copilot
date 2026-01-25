import { config, hasBilling } from "../config";

/**
 * RevenueCat subscriber entitlement info
 */
export interface SubscriberEntitlement {
  isActive: boolean;
  expirationDate?: string;
  productIdentifier?: string;
}

/**
 * RevenueCat subscriber response
 */
export interface SubscriberResponse {
  subscriber: {
    entitlements: Record<string, SubscriberEntitlement>;
    subscriptions: Record<string, unknown>;
    non_subscriptions: Record<string, unknown>;
  };
}

/**
 * Fetch subscriber info from RevenueCat API.
 * Returns the current entitlement state (source of truth).
 *
 * @param appUserId - RevenueCat app_user_id
 * @returns Subscriber entitlements
 */
export async function getSubscriber(appUserId: string): Promise<SubscriberResponse["subscriber"]> {
  if (!hasBilling || !config.REVENUECAT_API_KEY) {
    console.warn("[revenueCat] API key not configured, returning empty subscriber");
    return {
      entitlements: {},
      subscriptions: {},
      non_subscriptions: {},
    };
  }

  const response = await fetch(
    `https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(appUserId)}`,
    {
      headers: {
        Authorization: `Bearer ${config.REVENUECAT_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[revenueCat] API error:", response.status, errorText);
    throw new Error(`RevenueCat API error: ${response.status}`);
  }

  const data: SubscriberResponse = await response.json();
  return data.subscriber;
}

/**
 * Check if subscriber has active "pro" entitlement.
 *
 * @param subscriber - Subscriber data from getSubscriber
 * @returns { isPro, expiresAt }
 */
export function getProStatus(subscriber: SubscriberResponse["subscriber"]): {
  isPro: boolean;
  expiresAt?: string;
} {
  const proEntitlement = subscriber.entitlements["pro"];

  if (!proEntitlement || !proEntitlement.isActive) {
    return { isPro: false };
  }

  return {
    isPro: true,
    expiresAt: proEntitlement.expirationDate,
  };
}
