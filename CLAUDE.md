# Pre-Purchase Pal — AI Work Contract (Repo Memory)

## Product Context
- Pre-Purchase Pal: mobile-first vehicle inspection app.
- Phase 1: shipped manual MVP.
- Phase 2 (active): accounts + billing + entitlements.
- Phase 3 (later): AI inspection guidance runtime.

## Stack (assumed unless repo contradicts)
- Frontend: React + TypeScript, Capacitor (iOS).
- Backend: Node/TypeScript (Express or equivalent).
- DB/ORM: Postgres + Drizzle (or repo-defined equivalent).
- State: local-first client state (Zustand or equivalent).

## Non-Negotiables
- No secrets in code. Use env vars. Do not commit `.env`.
- Treat VIN, email, phone, free-text notes as sensitive. Do not log raw values.
- Smallest viable change. No new architecture unless required by spec.

## Build Workflow (enforced)
- Any non-trivial work starts with @planner output (spec + acceptance tests).
- @builder implements only what the spec requires and proves acceptance with commands run.
- @reviewer audits diff vs spec; blocks on security/PII/entitlement integrity issues.

## Definition of Done (per PR)
- Linked issue exists.
- Acceptance tests are listed in PR and mapped to evidence.
- Commands run are recorded in PR (typecheck/build/tests).
- Risk + rollback noted.
- Any data/PII touch is explicitly called out with redaction policy.
- **Blocking items completed**: If status table shows "Blocking Merge", all such items must be done before merge. If user requests merge with incomplete blockers, explicitly ask for confirmation.

## Phase Boundaries
### Phase 2: Accounts/Billing
- Auth + account identity.
- Entitlements gating (server + client).
- Billing provider integration + webhook/receipt sync.
- Account management UI (manage subscription, delete account).

### Phase 3: AI
- Canonical inspection session state model.
- Deterministic context assembly (slots + caps).
- Schema-validated responses (no free-form).
- Observability + eval harness.

## Conventions
- Prefer explicit types and narrow interfaces.
- Avoid "magic" global state; keep state transitions explicit.
- Add minimal docs for any new contract in `docs/specs/` or `docs/decisions/`.

## Agents
- @planner: spec + acceptance tests + file targets.
- @builder: implement + verify.
- @reviewer: audit + block issues.
