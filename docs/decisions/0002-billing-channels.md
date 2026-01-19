# ADR 0002: Billing Channels

**Status:** Accepted

## Context

Apple requires native In-App Purchase (IAP) for digital content in iOS apps. Using Stripe Checkout or any external payment flow for subscriptions would violate App Store guidelines and result in rejection.

Options considered:
1. **StoreKit directly** - Apple's native IAP framework
2. **RevenueCat** - Abstraction layer over StoreKit
3. **Stripe only** - Web-based payments (not allowed for iOS digital goods)

## Decision

- **iOS:** RevenueCat (abstracts StoreKit complexity)
- **Web:** Stripe Checkout (if needed later)

RevenueCat will be the source of truth for subscription status. Webhooks sync entitlements to Supabase `profiles.entitlements` JSONB column.

## Consequences

### Positive

- RevenueCat handles App Store receipt validation
- Cross-platform support if Android added later
- Dashboard for subscription analytics
- Webhook-based sync keeps Supabase authoritative for feature gating

### Negative

- Another service to configure and monitor
- RevenueCat documentation is notoriously frustrating (budget 2-3x time estimates)
- YouTube tutorials often more helpful than official docs

### Implementation Notes

```
User purchases → App Store → RevenueCat → Webhook → Server → Supabase
```

Server webhook endpoint validates RevenueCat signature and updates:
```sql
UPDATE profiles
SET entitlements = '{"pro": true, "expires_at": "..."}'
WHERE id = [user_id];
```

Client checks entitlements via Supabase profile, not RevenueCat SDK directly (single source of truth).

### Cost

- RevenueCat: Free until $2,500/month revenue, then 1% fee
- Stripe: 2.9% + $0.30 per transaction (web only)
