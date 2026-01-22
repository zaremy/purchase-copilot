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
- **`/docs` is NEVER part of runtime.** See "Playbook Separation" below.

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

## Playbook Separation (HARD GUARDRAIL)

The `/docs` folder is the user-facing playbook (GitHub Pages) but NEVER part of app runtime.

**Allowed in `/docs`:**
- `*.md` (markdown)
- `*.png`, `*.jpg`, `*.svg` (images)
- `_config.yml` (Jekyll config)
- `_layouts/*.html`, `_includes/*.html` (Jekyll partials)
- `assets/styles.css` (single CSS file)

**NOT allowed in `/docs`:**
- JavaScript/TypeScript
- npm dependencies or build tooling
- Jekyll themes (own the CSS)
- Anything importable by app code

**CI Gate fails if:**
- Disallowed file types in `/docs`
- Runtime code (`/src`, `/server`, `/client`) imports from `/docs`

**Maintenance rule:** PRs that change behavior/architecture update `/docs/playbook/` in the same PR.

## Agents
- @planner: spec + acceptance tests + file targets.
- @builder: implement + verify.
- @reviewer: audit + block issues.
