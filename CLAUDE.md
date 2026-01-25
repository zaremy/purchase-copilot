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

## Context Preservation on Compact
When compacting mid-issue, update the GitHub issue with current status before compaction:
1. Comment on linked issue with: current state, blockers, next steps
2. Include any error messages or diagnostics discovered
3. This ensures context survives session boundaries

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

## Playbook Maintenance

The playbook at `/docs` is the source of truth for product/architecture documentation. When completing work, update the playbook in the same PR.

### Governance: GitHub Is Source of Truth

**GitHub milestones and issues are the authoritative source for progress data.** The playbook must reflect GitHub, never the reverse.

Before updating `readiness.yml`:
1. Run `gh api repos/zaremy/purchase-copilot/milestones --jq '.[] | {title, closed_issues, open_issues}'`
2. Verify issue assignments: `gh issue list --milestone "<milestone>" --state all --json number,title,state`
3. If misalignment exists:
   - Fix GitHub first (assign milestones, close/open issues as needed)
   - Then update playbook to match

**Never invent progress.** If an issue is open, the corresponding item is not complete.

### Content Routing

| Content Type | Destination |
|-------------|-------------|
| Phase progress updates | `docs/_data/readiness.yml` |
| Architecture changes | `docs/playbook/architecture.md` (in appropriate phase tab) |
| New specs/contracts | `docs/specs/` |
| Architecture decisions | `docs/decisions/` |
| Research dumps | GitHub Discussions (not `/docs`) |
| Lessons learned | `docs/lessons/<phase>-<topic>.md` |

### Lessons Learned

**Location:** `docs/lessons/<phase>-<topic>.md` (e.g., `phase2b-apple-signin.md`)

**When to write:**
- After completing a phase or sub-phase
- After encountering significant gotchas worth preserving

**When to consult:**
- Before starting work on auth, iOS, Capacitor, or Supabase features
- When hitting cryptic errors in these domains

**Template:**
```markdown
---
layout: default
title: "Lessons Learned: [Phase] [Topic]"
---

# Lessons Learned: [Phase] [Topic]

**Date:** YYYY-MM-DD

## Context
Brief description of work completed.

## What Worked Well
- Item 1
- Item 2

## Gotchas / Surprises
- **Issue**: Description
- **Solution**: Fix

## Effort (Optional)
| Task | Expected | Actual | Notes |
|------|----------|--------|-------|

## Key Decisions
- Decision 1 and rationale

## Reusable Patterns
Code snippets or patterns for future reference.

## Maintenance Notes
Scheduled tasks, expiring credentials, etc.
```

### Updating System Readiness

File: `docs/_data/readiness.yml`

**When a sub-phase completes** (e.g., 2C Billing ships):
1. Update the sub-phase status from `current` to `completed`
2. Set `closed` equal to `total`
3. Move `current` status to the next incomplete sub-phase
4. Update `app_phases` section:
   - Increment `closed` count for the parent phase
   - If all sub-phases done, set parent status to `completed` and move `current` to next phase

**Example: Completing Phase 2C**
```yaml
# Before
app_phases:
  - id: phase2
    label: "Phase 2"
    closed: 2
    total: 3
    status: current

phase_details:
  phase2:
    items:
      - label: "2C Billing"
        status: current
        closed: 0
        total: 1

# After
app_phases:
  - id: phase2
    label: "Phase 2"
    closed: 3
    total: 3
    status: completed
  - id: phase3
    label: "Phase 3"
    closed: 0
    total: 1
    status: current  # moved here

phase_details:
  phase2:
    items:
      - label: "2C Billing"
        status: completed
        closed: 1
        total: 1
```

**Sync from GitHub milestones:**
```bash
gh api repos/zaremy/purchase-copilot/milestones --jq '.[] | {title, closed_issues, open_issues}'
```

### Status Values
- `completed` - Work is done (green bar, 100%)
- `current` - Active work (blue pulsing bar)
- `pending` - Future work (gray bar, 0%)

### Architecture Tab Content
Each phase tab in `docs/playbook/architecture.md` contains:
1. Contextual readiness bar (auto-rendered from `_data/readiness.yml`)
2. Phase-specific technical content

Update the content when:
- Tech stack changes
- New architectural decisions are made
- Cost projections change

## Conventions
- Prefer explicit types and narrow interfaces.
- Avoid "magic" global state; keep state transitions explicit.
- Add minimal docs for any new contract in `docs/specs/` or `docs/decisions/`.

## Agents
- @planner: spec + acceptance tests + file targets.
- @builder: implement + verify.
- @reviewer: audit + block issues.
