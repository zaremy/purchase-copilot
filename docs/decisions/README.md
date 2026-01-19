# Architecture Decision Records (ADRs)

This directory contains Architecture Decision Records for Pre-Purchase Pal.

## What is an ADR?

An ADR documents a significant decision about the system. It captures:
- **Context:** Why we needed to make a decision
- **Decision:** What we decided
- **Consequences:** What happens as a result

## When to Write an ADR

Write an ADR when:
- Choosing between technologies (database, auth provider, etc.)
- Making irreversible commitments
- Establishing patterns that will be followed project-wide
- Explicitly rejecting an approach

Don't write an ADR for:
- Routine implementation choices
- Decisions that can be easily changed later
- Per-feature design (that goes in specs)

## Template

```markdown
# ADR [NUMBER]: [TITLE]

**Status:** Proposed | Accepted | Deprecated | Superseded

## Context

[Why we need to make this decision]

## Decision

[What we decided]

## Consequences

[What happens as a result - both positive and negative]
```

## Index

| ADR | Title | Status |
|-----|-------|--------|
| [0001](0001-supabase-vercel.md) | Supabase + Vercel for Phase 2 | Accepted |
| [0002](0002-billing-channels.md) | Billing Channels | Accepted |
| [0003](0003-free-tiers.md) | Free Tiers Until Triggers | Accepted |
| [0004](0004-no-credit-ledger.md) | No Credit Ledger | Accepted |
