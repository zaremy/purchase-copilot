# Playbook Migration Plan

## Summary
Migrate Manus React playbook to GitHub Pages at `/docs` as user-facing source of truth.

## Content Routing

| Content Type | Destination | Purpose |
|--------------|-------------|---------|
| Research spikes, raw notes | **Discussions** | Messy OK, scratchpad |
| Distilled truth, specs, strategy | **`/docs/playbook/`** | Canonical, user-facing |
| Implementation decisions | **`/docs/decisions/`** | ADRs (already exist) |
| Phase specs | **`/docs/specs/`** | Implementation specs (already exist) |

## Structure

```
docs/
  _config.yml           # baseurl: "/purchase-copilot"
  _layouts/default.html # Persistent left nav
  _includes/nav.html    # Shared navigation
  index.md              # Landing page
  assets/styles.css     # Single CSS (Porsche-inspired)
  playbook/
    index.md            # Home/Executive Summary
    product.md
    roadmap.md
    architecture.md
    specs.md
    strategy.md
    monetization.md
    market.md
    segments.md
    competition.md
    marketing.md
    future.md
    resources.md
  decisions/            # ADRs (existing)
  specs/                # Implementation specs (existing)
```

## Hard Guardrails

**`/docs` is NEVER part of runtime:**
- Allowed: `.md`, `.png/.jpg/.svg`, `styles.css`, `_config.yml`, `_layouts/*.html`, `_includes/*.html`
- NOT allowed: JS/TS, npm deps, build tooling, themes

**CI Gate fails if:**
- Disallowed file types in `/docs`
- Runtime code (`/src`, `/server`, `/client`) imports from `/docs`

## Page Headers (Drift-Killers)

```yaml
---
status: current | draft | deprecated
last_updated: 2026-01-21
anchors:
  - milestone: Phase 2B
  - issue: "#40"
  - code_path: /server/routes/auth.ts
---
```

## Playwright Tests

- `tests/playbook/content.spec.ts` - H1, metadata, no placeholders, links
- `tests/playbook/responsive.spec.ts` - 4 viewports, no overflow, nav behavior
- `tests/playbook/visual.spec.ts` - Screenshot baselines
- `tests/playbook/css_contract.spec.ts` - Style invariants

## Implementation Status

- [x] Update CLAUDE.md with `/docs` separation rules
- [x] Update PR template with docs checkbox
- [x] Add CI gate workflow
- [x] Create `/docs` structure (config, layouts, styles)
- [x] Extract 13 playbook pages from Manus TSX
- [x] Update README with playbook link
- [ ] Enable GitHub Pages on /docs
- [x] Create Playwright tests

## Completed

### Part 1: GitHub Discussions
Created 8 GitHub Discussions:
- #32-38: Research + ADRs
- #39: Phase 2A Lessons
- Labels added: `research_dump`, `worktime_learnings`

### Part 2: Playbook Migration (files created)

**Jekyll Structure:**
- `_config.yml` - Jekyll config with baseurl `/purchase-copilot`
- `_layouts/default.html` - Persistent left nav layout
- `_includes/nav.html` - Shared navigation partial
- `assets/styles.css` - Porsche-inspired CSS
- `index.md` - Landing page

**Playbook Pages (all 13):**
- `playbook/index.md` - Executive Summary
- `playbook/product.md`, `roadmap.md`, `architecture.md`, `specs.md`
- `playbook/strategy.md`, `monetization.md`, `market.md`, `segments.md`
- `playbook/competition.md`, `marketing.md`, `future.md`, `resources.md`

**Governance updates:**
- CLAUDE.md: Added Playbook Separation guardrail section
- PR template: Added docs checkbox
- CI workflow: Added contamination check step

### Part 3: Playwright Tests (created)

**Config:**
- `playwright.config.ts` - Chromium only, 4 viewports, Jekyll webserver

**Test files:**
- `tests/playbook/content.spec.ts` - H1, metadata, placeholders, internal links
- `tests/playbook/responsive.spec.ts` - 4 viewports, overflow, sidebar behavior
- `tests/playbook/visual.spec.ts` - Screenshot baselines for all pages
- `tests/playbook/css_contract.spec.ts` - Typography, layout, Porsche design compliance

**CI:**
- `.github/workflows/playbook-tests.yml` - Runs on docs/** changes
- `docs/Gemfile` - Jekyll dependencies for CI

**package.json scripts:**
- `test:playbook` - Run tests
- `test:playbook:ui` - Interactive UI mode
- `test:playbook:update` - Update snapshots
