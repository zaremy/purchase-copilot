# Architecture

Pre-Purchase Pal — Mobile-first vehicle inspection app for used car buyers.

## Phase Overview

| Phase | Name | Status | Scope |
|-------|------|--------|-------|
| 1 | MVP | Complete | Manual inspection checklist, local-first |
| 2A | Infra Migration | Next | Replit → Supabase/Vercel |
| 2B | Auth | Planned | Supabase Auth + profiles |
| 2C | Billing | Deferred | RevenueCat + entitlements |
| 3 | AI | Future | AI-powered inspection guidance |

## Current Stack (Phase 1)

```
┌─────────────────────────────────────────────────────────────┐
│                         iOS App                              │
│  React 19 + TypeScript + Capacitor                          │
│  State: Zustand (local-first, persisted to localStorage)    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Express API                             │
│  Node.js + TypeScript                                       │
│  Validation: Zod                                            │
│  Currently: Replit deployment                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      PostgreSQL                              │
│  ORM: Drizzle                                               │
│  Currently: Replit-provisioned                              │
└─────────────────────────────────────────────────────────────┘
```

## Target Stack (Phase 2A+)

```
┌─────────────────────────────────────────────────────────────┐
│                         iOS App                              │
│  + Supabase Auth client (Phase 2B)                          │
│  + RevenueCat SDK (Phase 2C)                                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Vercel (Serverless)                       │
│  Express API                                                │
│  + Supabase service client (Phase 2B)                       │
│  + RevenueCat webhooks (Phase 2C)                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Supabase                                │
│  PostgreSQL + Auth + RLS                                    │
│  Pro tier (daily backups + PITR)                            │
└─────────────────────────────────────────────────────────────┘
```

## Key Directories

```
/
├── client/                 # React frontend (Capacitor iOS)
│   └── src/
│       ├── components/     # UI components
│       ├── pages/          # Route pages
│       └── lib/            # Utilities, store, hooks
├── server/                 # Express backend
│   ├── config.ts           # Env validation
│   ├── routes.ts           # API routes
│   ├── db.ts               # Database connection
│   └── storage.ts          # Data access layer
├── shared/                 # Shared types (client + server)
│   └── schema.ts           # Drizzle schema + Zod validators
├── ios/                    # Capacitor iOS project
└── docs/                   # Documentation
    ├── architecture.md     # This file
    ├── runbooks/           # Operational docs
    ├── specs/              # Phase specifications
    └── decisions/          # ADRs
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check + DB connectivity |
| GET | `/api/vehicles` | List all vehicles |
| GET | `/api/vehicles/:id` | Get vehicle by ID |
| POST | `/api/vehicles` | Create vehicle |
| PATCH | `/api/vehicles/:id` | Update vehicle |
| DELETE | `/api/vehicles/:id` | Delete vehicle |

## Data Flow

### Current (Local-First)

1. User interacts with app
2. Zustand updates local state
3. State persisted to localStorage
4. (Optional) Sync to server on demand

### Phase 2B+ (Cloud-Synced)

1. User authenticates via Supabase Auth
2. Vehicle data stored in Supabase PostgreSQL
3. RLS policies enforce user_id boundary
4. Real-time sync via Supabase client

## Specs

- [Phase 2A: Infrastructure Migration](specs/phase2a-infra-migration.md)
- [Phase 2B: Authentication](specs/phase2b-auth.md)
- [Phase 2C: Billing](specs/phase2c-billing.md) (Deferred)

## Decisions

- [0001: Supabase + Vercel](decisions/0001-supabase-vercel.md)
- [0002: Billing Channels](decisions/0002-billing-channels.md)
- [0003: Free Tiers](decisions/0003-free-tiers.md)
- [0004: No Credit Ledger](decisions/0004-no-credit-ledger.md)

## Runbooks

- [Environments](runbooks/environments.md)
- [Release & Rollback](runbooks/release.md)
