---
layout: default
title: Technical Architecture
status: current
last_updated: 2026-01-21
anchors:
  - milestone: Phase 2A
  - code_path: /server/
---

# Technical Architecture

A robust, offline-first React Native application backed by a scalable Node.js/PostgreSQL backend.

---

## Phase 1: MVP (Complete)

### Focus: Reliability & Data Capture

The MVP architecture prioritizes offline-first capabilities, robust photo storage, and structured data capture without the complexity of AI integration.

### Tech Stack

| Layer | Technology |
|-------|------------|
| Mobile App | React Native (Expo), TanStack Query, MMKV, NativeWind |
| Backend API | Node.js (Express), PostgreSQL (Supabase), Drizzle ORM, Supabase Auth |
| Data Services | NHTSA API (VIN), AWS S3 (Photos), PostHog (Analytics) |

### Key Decisions

**Offline-First Sync**: Inspections often happen in dead zones. The app functions 100% offline, syncing data when connectivity is restored using TanStack Query's persistence adapters.

**Local-First Validation**: Zod schemas are shared between client and server. We validate all inputs on the device before they ever hit the network, ensuring instant feedback.

### Cost to Serve (MVP)

| Metric | Value |
|--------|-------|
| Monthly Infrastructure | $50 - $100 |
| Cost Per Inspection | $0.05 |
| Break-Even Point | 20 Users |

At $14.99/vehicle, only 20 paid inspections per month cover the entire MVP infrastructure cost.

---

## Phase 2: Backend Foundation (Active)

### Focus: Auth & Billing Infrastructure

Moving from MVP to a scalable, monetized platform. This phase focuses on establishing robust Auth & Billing foundations.

### Tech Stack

| Layer | Technology |
|-------|------------|
| Backend Runtime | Node.js 20 (Vercel Serverless), Express, TypeScript (Strict), esbuild |
| Database & ORM | Supabase (PostgreSQL), Vercel Integration, Drizzle ORM, Transaction Mode |
| Observability | Sentry.io (Vercel Connector), Release Tracking, Source Maps |

### System Readiness: 35%

- Specs Defined
- Infrastructure Ready
- Auth Integration (In Progress)
- Billing (Pending)

### Production Checklist

**Ready:**
- Database (Supabase US-West-2)
- API Hosting (Vercel Serverless)
- Build Pipeline (esbuild → Vercel)
- Health Check (/api/health)
- Server Sentry (Dashboard Active)

**Pending:**
- Client Sentry Verification
- Rollback Drill
- Backup Drill
- Supabase Password Reset

### Key Decisions

**Managed Integration Strategy**: We deliberately chose Vercel's native integrations for Supabase and Sentry over manual configuration. This ensures environment variables are automatically synced and deployments are atomically linked to database migrations and error tracking releases.

**Phased Rollout (2A → 2B → 2C)**: Instead of a "big bang" release, we split the backend foundation into three distinct sub-phases: Infrastructure (Current), Authentication (Next), and Billing (Deferred). This isolates risk.

### Cost to Serve (Phase 2)

| Metric | Value |
|--------|-------|
| Monthly Infrastructure | $25 - $50 |
| Cost Per Inspection | $0.45 |
| Gross Margin | 96% |

---

## Phase 3: AI Integration (Planned)

### Focus: LLM Integration & Guidance

### Tech Stack Additions

| Layer | Technology |
|-------|------------|
| LLM Services | OpenAI GPT-4-turbo, JSON Mode (Strict), VIN + Market Context, Caching Proxy |
| Enriched Data | MarketCheck API, CarFax/AutoCheck, NHTSA Recall API, pgvector |
| Performance | BullMQ (Async Jobs), Server-Sent Events, Upstash Redis, Helicone |

### Key AI Decisions

**Field-Only LLM Constraint**: We strictly limit the LLM to structured JSON output based on specific fields. It never generates free-form advice without citing the specific inspection field it relates to. This prevents hallucination and liability.

**Contextual Caching**: We cache generated checklists by Year/Make/Model. If a user inspects a "2015 Honda Civic", we check if we've already generated a checklist for that car. This reduces LLM costs by 80%.

### Cost to Serve (Phase 3)

| Metric | Value |
|--------|-------|
| Monthly Infrastructure | $150 - $300 |
| Cost Per Inspection | $0.45 |
| Gross Margin | 96% |

---

## Phase 4: Platform Scale (Future)

### Focus: Enterprise & Multi-Tenant

### Tech Stack Additions

| Layer | Technology |
|-------|------------|
| Video | Daily.co/Twilio Video, Cloud Composition, WebRTC |
| Enterprise API | Kong/Apollo GraphQL, SSO/SAML/OIDC, Row-Level Security |
| Advanced AI | Custom YOLO (Damage), Google Vision/Textract (OCR), Whisper (Voice) |

### Cost to Serve (Phase 4)

| Metric | Value |
|--------|-------|
| Monthly Infrastructure | $2,500+ |
| Cost Per Session | $1.20 |
| Marketplace Take Rate | 20% |

---

## Billing Infrastructure

### In-App Purchases (RevenueCat)
- Direct integration with Apple App Store & Google Play Store
- Single SKU: "Pro Upgrade" ($9.99)
- Restores purchases across devices
- Syncs `is_pro` status to Supabase User table

### Web Payments (Stripe Checkout)
- Simple Stripe Checkout for web-based upgrades
- Stripe Webhook → Supabase Edge Function
- Updates user role to 'pro'

---

## Eliminated Approaches

| Rejected | Reason |
|----------|--------|
| Blockchain Vehicle History | Lack of adoption by major DMVs/manufacturers |
| Peer-to-Peer Payments | Avoid money transmitter licensing |
| On-Device LLM (Llama Stack) | Hallucination risk and battery drain |
| Generative UI (Google A2UI) | Need deterministic UI for liability control |
| Agentic Frameworks (AutoGen) | Overkill for linear inspection flow |
