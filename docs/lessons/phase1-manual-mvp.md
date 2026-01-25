---
layout: default
title: "Lessons Learned: Phase 1 Manual MVP"
---

# Lessons Learned: Phase 1 Manual MVP

**Date:** Dec 2025 - Jan 2026
**Phase:** 1 - Manual MVP (shipped)

## Context

Built mobile-first used car inspection app with manual 30-point checklist workflow. Goal was to validate the core inspection flow before adding AI assistance in later phases.

> **Note:** This is historical documentation. For current patterns (auth, iOS safe areas, state management), consult Phase 2 lessons learned files which supersede early decisions documented here.

## What Worked Well

### Zustand + Persist
- Simple, no boilerplate state management
- localStorage integration via persist middleware was seamless
- Pattern carried forward to Phase 2 (just added `resetStore()` for auth)

### Tailwind + Radix UI
- Fast component composition with consistent design tokens
- Pre-built accessible components (sheets, dialogs, tabs)
- Premium feel without custom CSS complexity

### Capacitor for iOS
- Hybrid wrapper worked well for web-first codebase
- Single codebase for web preview and iOS app
- Minimal native code required

### Local-First Architecture
- No backend complexity for MVP - checklist template is static
- Fast iteration without API overhead
- Made adding Supabase sync in Phase 2 straightforward (data shape already defined)

### Wouter Routing
- Lightweight alternative to React Router
- No configuration overhead
- Sufficient for mobile app with simple navigation

### Two-Surface Layout
- Dark header bar + light content area created premium aesthetic
- Simple CSS, high visual impact
- Pattern still in use

## Gotchas / Surprises

### iOS Safe Area Handling (Issue #11)
- **Problem**: Sheet components didn't respect notch/Dynamic Island
- **Solution**: Used `createPortal` to render sheets to `document.body`
- **Pattern**: MobileLayout now owns safe-area inset calculation

### Black Screen on iOS Load
- **Problem**: API calls were blocking initial render
- **Solution**: Switched to localStorage entirely (local-first pattern)
- **Lesson**: Don't block render on network requests

### Form Input Capture on iOS
- **Problem**: Standard input handlers missed autofilled data
- **Solution**: Use FormData API + onChange capture
- **Pattern**: Carried to Phase 2B auth forms

### Keyboard UI Issues
- **Problem**: Capacitor keyboard events pushing sheet off-screen
- **Solution**: Set `resize: "none"` in Keyboard plugin config

### Capacitor Version Pinning
- **Problem**: Breaking changes between minor versions
- **Solution**: Pinned capacitor-swift-pm to 8.0.1
- **Lesson**: Pin Capacitor dependencies explicitly

## Tech Stack Decisions

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Frontend | React 19 + TypeScript | Vite dev server, fast HMR |
| Mobile | Capacitor 8.0 (iOS) | Hybrid wrapper, single codebase |
| UI Kit | Radix UI + Tailwind | Accessible components, utility CSS |
| State | Zustand + Persist | Simple, localStorage built-in |
| Backend | Express + Node.js | Basic CRUD, familiar stack |
| Database | PostgreSQL + Drizzle | Type-safe ORM, migrations |
| Routing | Wouter | Lightweight, no config |
| Animations | Framer Motion | Page transitions |

## Reusable Patterns

### Static Checklist Definition
```typescript
// lib/data.ts - 30 items across 5 sections
export const checklistItems: ChecklistItem[] = [
  { id: 'exterior-1', section: 'Exterior', label: 'Body panels' },
  // ... immutable, no API calls needed
];
```

### LocalVehicle Interface
```typescript
interface LocalVehicle {
  id: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  checklistResponses: Record<string, 'pass' | 'fail' | 'unknown'>;
  // JSONB allows flexible schema evolution
}
```

### Risk Scoring (Placeholder)
```typescript
// Simple formula - placeholder until ML in Phase 3
const riskScore = Math.min(100, failCount * 15);
```

### Two-Surface Layout
```tsx
// Dark header + light content
<div className="bg-neutral-900 text-white px-4 pb-4 pt-safe">
  {/* Header */}
</div>
<div className="bg-white flex-1 p-4">
  {/* Content */}
</div>
```

## Key Decisions Made

1. **Local-first, API later** - No auth/sync in MVP, added in Phase 2
2. **JSONB for responses** - Flexible schema without migrations
3. **Static checklist** - 30 items baked in, no dynamic loading
4. **Capacitor over React Native** - Web-first with native wrapper
5. **Zustand over Redux** - Simpler for client-only state

## What Required Iteration in Later Phases

| Phase 1 State | Phase 2 Change | Why |
|---------------|----------------|-----|
| No auth | Supabase Auth | Multi-user support |
| localStorage only | Supabase sync | Data persistence across devices |
| No user scoping | RLS policies | Data isolation |
| Hardcoded risk formula | (Phase 3) | ML-based scoring |

## MVP Scope Shipped

- 30-point checklist across 5 sections (Exterior, Interior, Mechanical, Underbody, Test Drive)
- Vehicle management (add/edit with VIN, make/model, year, price, mileage)
- Progress tracking and basic risk scoring
- Compare view (side-by-side up to 3 vehicles)
- Profile setup (name, email, phone, zip)
- iOS app via Capacitor
