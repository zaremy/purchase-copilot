# Pre-Purchase Pal — AI Work Contract (Repo Memory)

## Product Context
- Pre-Purchase Pal: mobile-first vehicle inspection app.
- Phase 1: shipped manual MVP.
- Phase 2: shipped backend foundation (auth + infra).
- Phase 3 (active): Pro Plan (tooling + monetization).
- Phase 4 (later): Distribution + GTM.

## AI/Tool-First Invariants (Non-Negotiable)
Everything ships as deterministic tools that an AI/agent can call.

Rules:
- Every feature exposes a tool contract: name, inputs, outputs, errors, auth requirements, version.
- Tools are deterministic + idempotent where possible (same inputs → same outputs; retries safe).
- Side effects require explicit "action tools" with receipts (audit event + stable ids).
- UI is a thin client over tools; no hidden business logic only in UI.
- Canonical state is server-owned; UI reflects state, never invents it.
- Every tool has: validation, rate/cost guardrails, logging, and test coverage for edge cases.

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

## Issue Closure Protocol

**When user says "close issue", "ship it", or "done" — automatically execute these steps:**

1. **Merge PR** (if not already merged)
   ```bash
   gh pr merge <number> --squash --delete-branch
   ```

2. **Verify issue closed** (should auto-close via "Closes #N" in PR)
   ```bash
   gh issue view <number> --json state
   ```

3. **Update lessons learned** (if significant learnings)
   - Add to existing `docs/lessons/<phase>-<topic>.md` or create new file
   - Include gotchas, patterns, and maintenance notes

4. **Update readiness** (if sub-phase complete)
   - Check milestone: `gh api repos/zaremy/purchase-copilot/milestones --jq '...'`
   - Update `docs/_data/readiness.yml` if sub-phase status changes

5. **Commit docs updates** (if any)
   - Branch from main, commit, push, merge via PR

6. **Show progress recap** (always)
   - Display current phase progress with visual bars
   - Example format:
   ```
   Phase 3 Progress:
   3E Billing Tools    ████████████ complete
   3B VIN Tools        ░░░░░░░░░░░░ current ← next
   3C Media Tools      ░░░░░░░░░░░░ pending
   3A Reports Tool     ░░░░░░░░░░░░ pending
   3D Guidance         ░░░░░░░░░░░░ pending
   ```

**Do not ask for confirmation** — just execute the protocol. User can interrupt if needed.

## Phase Boundaries
### Phase 2: Backend Foundation (Complete)
- 2A: Infrastructure migration (Replit → Supabase/Vercel)
- 2B: Auth (Supabase Auth + Apple Sign-In)

### Phase 3: Pro Plan (Tooling + Monetization)
Build order:
1. 3E: Billing Tools (entitlement model first, paywall UI later)
2. 3B: VIN Tools (decode/scan/lookup) + 3C: Media Tools (photo capture/attach)
3. 3A: Reports Tool (generate/share/export - flagship paid output)
4. 3D: Guidance Orchestrator (AI uses tools; no business logic in prompts)

### Phase 4: Distribution + GTM
- Welcome/Onboarding (activation funnels)
- Google Sign-In (conversion friction reduction)
- Marketing Site (acquisition)

### Operability Lane (runs alongside Phase 3-4)
- Cost controls, rate limits, abuse prevention
- Logging, receipts, audit events
- Error handling, retry logic

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
| **Tool contracts** | `docs/contracts/tools.md` |
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

**When a sub-phase completes** (e.g., 3E Billing Tools ships):
1. Update the sub-phase status from `current` to `completed`
2. Set `closed` equal to `total`
3. Move `current` status to the next incomplete sub-phase
4. Update `app_phases` section:
   - Increment `closed` count for the parent phase
   - If all sub-phases done, set parent status to `completed` and move `current` to next phase

**Example: Completing Phase 3E**
```yaml
# Before
app_phases:
  - id: phase3
    label: "Phase 3"
    closed: 0
    total: 5
    status: current

phase_details:
  phase3:
    items:
      - label: "3E Billing Tools"
        status: current
        closed: 0
        total: 1

# After
app_phases:
  - id: phase3
    label: "Phase 3"
    closed: 1
    total: 5
    status: current  # still current, more sub-phases remain

phase_details:
  phase3:
    items:
      - label: "3E Billing Tools"
        status: completed
        closed: 1
        total: 1
      - label: "3B VIN Tools"
        status: current  # next in sequence
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

### Accuracy Rules for Architecture Docs

**Document what's shipped, not what's planned.** Tech stack sections should reflect actual implementation, verified against the codebase:

| Check | Source |
|-------|--------|
| State management | `client/src/lib/store.ts` (Zustand, not React Context) |
| Auth client | `client/src/lib/supabase.ts` |
| Feature flags | `client/src/lib/config.ts` |

**Separate shipped vs pending.** When a sub-phase is partially complete, structure the section as:
```markdown
### Shipped: [Feature Name]
- What's actually working

### Pending: [Feature Name] (#issue)
- What's not yet implemented
```

**Verify before writing.** Don't copy forward from old docs or assume patterns. Read the actual code files to confirm the current implementation.

### Local Preview

Jekyll is installed via Homebrew Ruby 4.0:

```bash
/opt/homebrew/lib/ruby/gems/4.0.0/bin/jekyll build --source docs --destination _site/purchase-copilot
```

The `_site/` folder is gitignored. GitHub Pages rebuilds on merge to main.

## Conventions
- Prefer explicit types and narrow interfaces.
- Avoid "magic" global state; keep state transitions explicit.
- Add minimal docs for any new contract in `docs/specs/` or `docs/decisions/`.

## Agents
- @planner: spec + acceptance tests + file targets.
- @builder: implement + verify.
- @reviewer: audit + block issues.
