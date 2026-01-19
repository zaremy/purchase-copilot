# ADR 0004: No Credit Ledger

**Status:** Accepted

## Context

Some apps use credit/token systems where users purchase credits and spend them per action (e.g., per AI inspection, per report).

Credit ledger systems add significant complexity:
- State management (balance tracking, race conditions)
- Fraud surface (credit manipulation, refund gaming)
- Refund edge cases (partial credits, expired credits)
- Pricing complexity (credit packs, discounts, bonuses)

## Decision

Subscription entitlements only for Phase 2C. No per-inspection credits.

Entitlement model:
```typescript
// Simple boolean check
if (profile.entitlements.pro) {
  // Allow pro features
}
```

Not:
```typescript
// Complex credit check
if (profile.credits >= inspectionCost) {
  profile.credits -= inspectionCost;
  // Allow feature
}
```

## Consequences

### Positive

- Simpler billing logic (boolean entitlement check vs balance tracking)
- No fraud surface from credit manipulation
- Easier refunds (cancel subscription, not partial credit refund)
- Clear value proposition ("unlimited inspections" vs "10 credits for $X")

### Negative

- Less pricing flexibility (can't charge per-inspection)
- May limit monetization options (acceptable for Phase 2)

### Future Consideration

If credits become necessary (e.g., AI features with high marginal cost):
1. Scope as Phase 3.5 with dedicated spec
2. Design ledger with idempotent operations
3. Add audit logging for all credit changes
4. Consider third-party billing (Stripe Billing) over custom ledger

This decision can be revisited after Phase 3 ships and usage patterns are understood.
