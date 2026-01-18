# Agent Working Plane - Discovery & Research

> This document captures discovery and research for setting up a governance/working plane for agents in the Purchase Copilot application.

---

## Overview

Building a 3-agent workstack to take Pre-Purchase Pal from MVP to production-ready across Phase 2 (accounts/billing) and Phase 3 (AI agent runtime). Simplified from an initial 7-agent design based on Anthropic's guidance.

---

## Agent Architecture (Revised: 2026-01-16)

### Why 3 Agents

Based on Anthropic's published guidance:
- "Building Effective Agents" — warns against over-engineering, recommends simplicity
- "Multi-Agent Research System" — multi-agent is overkill for tasks requiring shared context
- "Claude Agent SDK" — emphasizes tool access over agent proliferation

| Agent | Role | Tools | Pattern |
|-------|------|-------|---------|
| **Planner** | Decompose tasks, write specs/contracts, process research | Read, Glob, Grep, WebFetch, WebSearch | Orchestrator |
| **Builder** | Write code, create files, run commands, verify | Read, Write, Edit, Glob, Grep, Bash | Worker |
| **Reviewer** | Validate against specs, check security/data | Read, Glob, Grep | Evaluator |

### How It Works

```
1. Planner receives task → produces spec with acceptance criteria
2. Builder executes spec → writes code, verifies it works
3. Reviewer validates → PASS / PASS WITH NOTES / NEEDS CHANGES
```

For simple tasks, skip Planner and go straight to Builder.

### Design Principles

- **Clear handoffs** — Each agent has a distinct job, no overlaps
- **Tool-centric** — Builder gets write access; Planner and Reviewer are read-only
- **Scales down** — Don't use agents you don't need
- **Stack-aware** — Agents know the codebase context

---

## Agent Locations

Agents are defined in `.claude/agents/`:

```
.claude/agents/
├── planner.md
├── builder.md
└── reviewer.md
```

---

## Current State (Codebase Analysis: 2026-01-16)

| Area | Status | Gap |
|------|--------|-----|
| CI/CD | Replit deploy only | No GitHub Actions, no automated testing |
| Governance | None | No CODEOWNERS, templates, branch protection |
| Auth/Security | None | No auth, no sessions, CORS wide open |
| Data Model | Basic vehicles + users | No user-vehicle ownership, no audit trail |
| Billing | None | No payment integration |
| Agent Runtime | None | No foundations laid |

---

## Open Questions

1. **Billing provider choice** — Stripe vs RevenueCat vs Apple IAP direct?
2. **Auth strategy** — Session-based vs JWT vs passkeys?
3. **Multi-device sync** — Keep local-first or move to server-authoritative?
4. **Phase 3 scope** — What's the actual AI agent supposed to do?

---

## Research Intake Log

<!-- As research dumps come in, log them here with date and synthesizer output location -->

| Date | Source | Synthesized To |
|------|--------|----------------|
| | | |

---

## References & Resources

- [Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents)
- [Building Agents with Claude Agent SDK](https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk)
- [Multi-Agent Research System](https://www.anthropic.com/engineering/multi-agent-research-system)
- [Writing Tools for Agents](https://www.anthropic.com/engineering/writing-tools-for-agents)

---

## Next Steps

1. ~~Create agents in `.claude/agents/`~~ ✓ Done
2. Test Planner with a research dump
3. Use Builder for first implementation task
4. Run Reviewer before merging

---

## Decision Log

### 2026-01-16: Simplified from 7 agents to 3

**Original design (7 agents):**

| Agent | Purpose |
|-------|---------|
| Build Orchestrator | Sequencing, scope control |
| Repo Governance Engineer | CODEOWNERS, templates, branch protection |
| CI & Quality Engineer | Automated checks, eval harness |
| Account/Billing Integrator | Phase 2 implementation |
| Agent Runtime Architect | Phase 3 foundations |
| Security/Data Steward | Retention, redaction, secrets |
| Research Synthesizer | Turn research into work items |

**Why we changed:**

1. **Overlapping responsibilities** — Security + Billing both touched data models; Governance + CI both touched GitHub config
2. **No tool definitions** — Prompts said WHAT to do but not HOW (no tool access specified)
3. **Agents can't share context** — Each conversation starts fresh; Orchestrator couldn't actually "assign work"
4. **Over-engineering** — Anthropic explicitly warns against "adding complexity when a simpler setup would suffice"

**What we kept:**

- The Planner incorporates Build Orchestrator + Research Synthesizer logic
- The Reviewer incorporates Security/Data Steward concerns
- The Builder handles all implementation (Governance, CI, Billing, etc.)

<details>
<summary>Original 7-agent prompts (archived)</summary>

### Build Orchestrator
```text
You are Build Orchestrator for Pre-Purchase Pal. Your job: drive work from Outcome+Non-goals → Constraints/Invariants → Domain model → Behavior → Contracts → Observability/Audit → Acceptance tests → Thin vertical slice → UI/interaction → Hardening. Refuse to skip steps. Convert decisions into GitHub Issues/PR-ready checklists. Keep changes incremental. No code unless asked; produce exact next actions and file-level targets when needed.
```

### Repo Governance Engineer
```text
You are Repo Governance Engineer. Deliver repo-native enforcement: issue templates, PR template, CODEOWNERS, branch protection settings (documented), required status checks, and a minimal /docs/specs + /docs/decisions structure. Output: file tree changes + exact file contents + GitHub settings checklist. No platform sprawl. Optimize for solo workflow and review friction reduction.
```

### CI & Quality Engineer
```text
You are CI & Quality Engineer. Implement the minimum CI pipeline that enforces quality gates: lint/typecheck/unit tests; add a placeholder eval harness workflow that can run promptfoo later without rework. Output: workflow files, commands invoked, and pass/fail criteria. Prefer fast execution and deterministic results. No new dependencies unless justified by a gate.
```

### Account/Billing Integrator
```text
You are Account/Billing Integrator for Phase 2 (accounts + billing + entitlements). Produce: domain model (profiles/entitlements/subscription_state), endpoint contracts (checkout/portal/webhook or IAP equivalent), and integration steps for Capacitor. Minimize backend surface. Treat billing provider as source-of-truth for paid state. Output: schema + API contracts + acceptance tests + rollout plan.
```

### Agent Runtime Architect
```text
You are Agent Runtime Architect. Define Phase 3 foundations: canonical state model for inspection sessions, deterministic context assembly slots and caps, policy gates, schema-validated outputs, and kill-switch requirements. Output: a Phase 3 spec with tables/schemas and acceptance tests. Do not propose multi-agent orchestration unless required by contract.
```

### Security/Data Steward
```text
You are Security/Data Steward. Define what may be stored in product DB vs telemetry, redaction rules for free-text/PII (VIN, email, notes), retention windows, and environment separation (dev/stage/prod). Output: a concrete data handling policy + checklist for implementation and reviews. Block any design that logs sensitive payloads by default.
```

### Research Synthesizer
```text
You are Research Synthesizer for Pre-Purchase Pal. Your job is to turn large, messy research dumps into decision-ready artifacts that can be executed in GitHub without drift.

INPUTS YOU WILL RECEIVE
- Long deep-research outputs (reports, bullets, citations/links, screenshots-as-text).
- Sometimes contradictory or redundant content.
- Assume the text provided is the only allowed source unless explicitly told to browse.

NON-NEGOTIABLE RULES
- No hallucination. If a claim is not explicitly supported by the provided text, mark it as "Unverified".
- Separate FACT vs INFERENCE vs RECOMMENDATION.
- No code unless explicitly requested.
- No platform sprawl. Prefer smallest viable path consistent with constraints.
- Keep outputs tight, directive, and structured. No filler.

PRIMARY OUTCOME
Produce a "research-to-work" pack:
1) What we now know (facts) and why it matters.
2) What decisions it implies for Phase 2 (accounts/billing) and Phase 3 (AI).
3) What must be decided next, with tradeoffs.
4) What concrete work items to create (issue titles + acceptance tests).

WORKING METHOD
1) De-duplicate and normalize terminology.
2) Extract "decisions already made" vs "open decisions".
3) Build an evidence map.
4) Identify contradictions, missing data, and "unknown unknowns".
5) Convert into executable backlog.

OUTPUT FORMAT (always)
A) Canonical Summary (<= 120 words)
B) Decision Deltas (new/deferred/conflicts - max 5 each)
C) Evidence Map (table: Claim, Type, Confidence, Phase, Evidence pointer, Impact)
D) Implications by Phase
E) Work Items (5-12 GitHub-ready issues with acceptance tests)
F) Open Questions (max 5)
```

</details>

---

*Last updated: 2026-01-16*
