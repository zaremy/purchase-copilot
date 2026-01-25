/**
 * RevenueCat webhook payload fixtures for testing.
 * Based on https://www.revenuecat.com/docs/webhooks
 */

export const subscriptionPurchasedEvent = {
  api_version: "1.0",
  event: {
    id: "test-event-id-1",
    type: "INITIAL_PURCHASE",
    app_user_id: "test-user-id",
    event_timestamp_ms: 1706000000000,
    subscriber_attributes: {},
    product_id: "prepurchase_pro_monthly",
    entitlement_ids: ["pro"],
    period_type: "NORMAL",
    currency: "USD",
    price: 9.99,
  },
};

export const subscriptionRenewedEvent = {
  api_version: "1.0",
  event: {
    id: "test-event-id-2",
    type: "RENEWAL",
    app_user_id: "test-user-id",
    event_timestamp_ms: 1706000000001,
    subscriber_attributes: {},
    product_id: "prepurchase_pro_monthly",
    entitlement_ids: ["pro"],
    period_type: "NORMAL",
  },
};

export const subscriptionCancelledEvent = {
  api_version: "1.0",
  event: {
    id: "test-event-id-3",
    type: "CANCELLATION",
    app_user_id: "test-user-id",
    event_timestamp_ms: 1706000000002,
    subscriber_attributes: {},
    product_id: "prepurchase_pro_monthly",
    entitlement_ids: ["pro"],
    cancel_reason: "UNSUBSCRIBE",
  },
};

export const subscriptionExpiredEvent = {
  api_version: "1.0",
  event: {
    id: "test-event-id-4",
    type: "EXPIRATION",
    app_user_id: "test-user-id",
    event_timestamp_ms: 1706000000003,
    subscriber_attributes: {},
    product_id: "prepurchase_pro_monthly",
    entitlement_ids: ["pro"],
    expiration_reason: "BILLING_ERROR",
  },
};

export const subscriberWithProActive = {
  subscriber: {
    entitlements: {
      pro: {
        isActive: true,
        expirationDate: "2026-02-25T00:00:00Z",
        productIdentifier: "prepurchase_pro_monthly",
      },
    },
    subscriptions: {},
    non_subscriptions: {},
  },
};

export const subscriberWithProExpired = {
  subscriber: {
    entitlements: {
      pro: {
        isActive: false,
        expirationDate: "2026-01-01T00:00:00Z",
        productIdentifier: "prepurchase_pro_monthly",
      },
    },
    subscriptions: {},
    non_subscriptions: {},
  },
};

export const subscriberWithNoEntitlements = {
  subscriber: {
    entitlements: {},
    subscriptions: {},
    non_subscriptions: {},
  },
};
