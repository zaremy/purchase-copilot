# ADR 0003: Free Tiers Until Triggers

**Status:** Accepted (Supabase upgraded to Pro 2026-01-20)

## Context

Supabase, Vercel, and RevenueCat all offer generous free tiers. Premature upgrade to paid tiers wastes money and creates unnecessary complexity.

Need clear triggers for when to upgrade.

## Decision

Stay on free tiers for all services. Upgrade only when specific triggers are hit.

### Upgrade Triggers

| Service | Tier | Limits | Upgrade Trigger |
|---------|------|--------|-----------------|
| Supabase | **Pro ($25/mo)** | 8GB storage, 100k MAU, daily backups, PITR | *Upgraded 2026-01-20* |
| Vercel | Free | 100GB bandwidth, 10s function timeout | Bandwidth >80GB or timeout issues |
| RevenueCat | Free | Free until $2.5k/mo revenue | Automatic (1% fee kicks in) |

### Monitoring

Check monthly:
- Supabase dashboard: storage and MAU
- Vercel dashboard: bandwidth and function duration
- RevenueCat dashboard: MRR

## Consequences

### Positive

- ~$0/month at launch
- Forces focus on product, not infrastructure optimization
- Clear decision points documented

### Negative

- Supabase DB pauses after 7 days inactivity (before launch this is fine)
- May need rapid upgrade if growth is sudden (acceptable risk)

### Upgrade Path

When triggers hit:
1. Supabase: Upgrade to Pro ($25/month) — removes pause, adds PITR backup
2. Vercel: Upgrade to Pro ($20/month) — higher limits, longer timeouts
3. RevenueCat: No action needed (automatic fee)

Budget estimate at Phase 3: $45-50/month infrastructure
