# Phase 2C: Billing

**Status:** DEFERRED

> This phase is intentionally deferred until Phase 2B (Auth) ships and is validated with real users. No paywall until proven demand.

## Outcome

Users can subscribe to unlock premium features. Entitlements are synced from RevenueCat to Supabase.

## Non-Goals

- Credit ledger / per-inspection billing (see [ADR 0004](../decisions/0004-no-credit-ledger.md))
- Web billing (iOS first)
- Multiple subscription tiers

## Why RevenueCat

Apple requires native IAP for digital content in iOS apps. Stripe Checkout cannot be used.

See [ADR 0002: Billing Channels](../decisions/0002-billing-channels.md).

## Technical Approach

### RevenueCat Setup

1. Create RevenueCat project
2. Configure product in App Store Connect
3. Add RevenueCat SDK to iOS app
4. Configure webhook to server

### Product Configuration

| Product ID | Type | Price | Features |
|------------|------|-------|----------|
| `prepurchase_pro_monthly` | Auto-renewable subscription | $9.99/mo | TBD |

### Webhook Flow

```
User purchases → App Store → RevenueCat → Webhook → Server → Supabase
```

### Database Changes

```sql
-- Entitlements stored in profiles.entitlements JSONB
-- Example: { "pro": true, "expires_at": "2026-02-18T00:00:00Z" }

UPDATE profiles
SET entitlements = '{"pro": true, "expires_at": "..."}'
WHERE id = [user_id];
```

### Client Integration

```typescript
import Purchases from 'react-native-purchases';

await Purchases.configure({ apiKey: REVENUECAT_API_KEY });

// Check entitlement
const customerInfo = await Purchases.getCustomerInfo();
const isPro = customerInfo.entitlements.active['pro'] !== undefined;

// Purchase
const { customerInfo } = await Purchases.purchaseProduct('prepurchase_pro_monthly');
```

## UI Changes

### New Screens

1. **Paywall** - Show subscription options
2. **Subscription Management** - View status, link to Apple subscription settings

### Gating

```typescript
if (!isPro) {
  // Show paywall
} else {
  // Show pro feature
}
```

## Acceptance Tests

- [ ] RevenueCat project configured
- [ ] Product created in App Store Connect
- [ ] Purchase flow works (Sandbox)
- [ ] Webhook updates entitlements in Supabase
- [ ] Pro features gated correctly
- [ ] Subscription management works
- [ ] Restore purchases works

## Files Changed

- New: RevenueCat SDK integration
- New: `client/src/pages/Paywall.tsx`
- New: `server/routes/webhooks.ts` (RevenueCat webhook)
- Modified: `server/config.ts` (RevenueCat keys)
- Modified: Feature-gated components

## Defer Criteria

Ship Phase 2C when:
1. Phase 2B is live in App Store
2. User feedback indicates demand for premium features
3. Premium features are defined

## Estimated Effort

Budget 2-3x normal estimates. RevenueCat docs are frustrating; use YouTube tutorials.
