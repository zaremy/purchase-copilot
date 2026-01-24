---
layout: default
title: Technical Architecture
---

# Technical Architecture

**SYSTEM DESIGN**

A robust, offline-first React Native application backed by a scalable Node.js/PostgreSQL backend.

<div class="phase-tabs" role="tablist">
  <button class="phase-tab active" role="tab" aria-selected="true" data-tab="phase1">Phase 1</button>
  <button class="phase-tab" role="tab" aria-selected="false" data-tab="phase2">Phase 2</button>
  <button class="phase-tab" role="tab" aria-selected="false" data-tab="phase3">Phase 3</button>
  <button class="phase-tab" role="tab" aria-selected="false" data-tab="phase4">Phase 4</button>
</div>

<div id="phase1" class="phase-panel active" role="tabpanel" markdown="1">

{% include readiness.html title="Phase 1 Progress" phases=site.data.readiness.phase_details.phase1.items %}

## Phase 1: MVP Architecture

### Focus: Reliability & Data Capture

The MVP architecture prioritizes offline-first capabilities, robust photo storage, and structured data capture without the complexity of AI integration.

---

## MVP Tech Stack

### Mobile App
- **Framework:** React Native (Expo)
- **State:** TanStack Query (Offline)
- **Storage:** MMKV (Local Persistence)
- **UI:** NativeWind (Tailwind)

### Backend API
- **Runtime:** Node.js (Express)
- **Database:** PostgreSQL (Supabase)
- **ORM:** Drizzle
- **Auth:** Supabase Auth

### Data Services
- **VIN Data:** NHTSA API (Basic)
- **Storage:** AWS S3 (Photos)
- **Export:** PDF Generation Lib
- **Analytics:** PostHog

---

## Key Platform Decisions

### Offline-First Sync
Inspections often happen in dead zones. The app functions 100% offline, syncing data when connectivity is restored using TanStack Query's persistence adapters.

### Local-First Validation
Zod schemas are shared between client and server. We validate all inputs on the device before they ever hit the network, ensuring instant feedback.

---

## Cost to Serve (MVP)

| Metric | Value |
|--------|-------|
| Monthly Infrastructure | $50 - $100 |
| Cost Per Inspection | $0.05 |
| Break-Even Point | 20 Users |

Fixed costs for Supabase Pro ($25), Vercel Pro ($20), and basic S3 storage. Supports up to 5,000 MAU.

---

## Billing Infrastructure (MVP)

### In-App Purchases
Direct integration with Apple App Store & Google Play Store via RevenueCat.

- Single SKU: "Pro Upgrade" ($9.99)
- Restores purchases across devices
- Syncs `is_pro` status to Supabase User table

### Web Payments
Simple Stripe Checkout for web-based upgrades.

- Stripe Webhook to Supabase Edge Function
- Updates user role to 'pro'
- No recurring billing logic needed yet

---

## Eliminated Platform Approaches

### Blockchain Vehicle History
Rejected due to lack of adoption by major DMVs and manufacturers. Centralized databases (CarFax) remain the source of truth.

### Peer-to-Peer Payments
Rejected handling direct vehicle payments to avoid money transmitter licensing requirements. We facilitate the deal, not the funds.

</div>

<div id="phase2" class="phase-panel" role="tabpanel" markdown="1">

{% include readiness.html title="Phase 2 Progress" phases=site.data.readiness.phase_details.phase2.items %}

## Phase 2: Backend Foundation

### Strategic Transition Plan

To enable the AI Agent milestone, you must first establish a robust User Identity (Auth) and Billing foundation. Your current Replit-based backend is a bottleneck. Moving to a Supabase-centric architecture is the recommended path for <1000 users, offering the lowest friction and cost.

### Supabase Auth + Database
Use Supabase for both Authentication and PostgreSQL. It replaces your custom Express auth logic with a secure, managed service.

- **Zero-Config Auth:** Email/Password, Google, Apple login out of the box.
- **Row Level Security (RLS):** Secure user data at the database level.
- **Free Tier:** Generous limits (500MB db, 50k MAU) perfect for <1000 users.

### RevenueCat (iOS IAP)
Mandatory for iOS App Store compliance. Abstracts Apple's complex StoreKit APIs.

- **Source of Truth:** RevenueCat manages subscription status, syncing to Supabase.
- **Webhooks:** Sync entitlement updates to your Vercel backend.

---

## Phase 2A Tech Stack (Backend)

### Backend Runtime
- **Runtime:** Node.js 20 (Vercel Serverless)
- **Framework:** Express (Wrapped)
- **Language:** TypeScript (Strict)
- **Build:** esbuild (Custom script)

### Database & ORM
- **Provider:** Supabase (PostgreSQL)
- **Integration:** Vercel Integration (Env Vars)
- **ORM:** Drizzle (Type-safe)
- **Connection:** Transaction Mode (Port 6543)

### Observability
- **Platform:** Sentry.io
- **Integration:** Vercel Connector (Auto-Setup)
- **Features:** Release Tracking + Source Maps
- **Scope:** Full Stack (Node.js + React)

---

## Phase 2B Tech Stack (Authentication)

### Shipped: Email/Password Auth
- **Provider:** Supabase Auth
- **Client:** `@supabase/supabase-js`
- **State:** Zustand store with persist middleware
- **UI:** Login (4 modes), Profile management, Sign Out

### Pending: Apple Sign-In (#49)
- **Provider:** Supabase Auth (Apple OAuth)
- **iOS:** Native Sign in with Apple (ASAuthorizationController)
- **Status:** In development

### Security
- **PKCE:** Enabled
- **Session:** JWT (Supabase-managed)
- **Logout:** Revoke tokens + clear local storage

---

## Key Architecture Decisions

### Managed Integration Strategy
We deliberately chose Vercel's native integrations for Supabase and Sentry over manual configuration. This ensures environment variables are automatically synced and deployments are atomically linked to database migrations and error tracking releases.

### Phased Rollout (2A → 2B → 2C)
Instead of a "big bang" release, we split the backend foundation into three distinct sub-phases: Infrastructure (Complete), Auth (Current), and Billing (Deferred). Google Sign-In was moved to Phase 4 to prioritize Apple Sign-In first (iOS App Store requirement). This isolates risk: we confirm the API works before adding user complexity, and confirm users work before adding payment complexity.

</div>

<div id="phase3" class="phase-panel" role="tabpanel" markdown="1">

{% include readiness.html title="Phase 3 Progress" phases=site.data.readiness.phase_details.phase3.items %}

## Phase 3: AI Integration

### AI Tech Stack Additions

#### LLM Services
- **Model:** OpenAI GPT-4-turbo
- **Mode:** JSON Mode (Strict)
- **Context:** VIN + Market Data
- **Caching:** OpenAI Caching Proxy (Mandatory)

#### Enriched Data
- **Market Data:** MarketCheck API
- **History:** CarFax/AutoCheck API
- **Recall:** NHTSA Recall API
- **Vector DB:** pgvector (Issues)

#### Performance
- **Queue:** BullMQ (Async Jobs)
- **Streaming:** Server-Sent Events
- **Rate Limit:** Upstash Redis
- **Monitoring:** Helicone / LangSmith

### Cost to Serve (Phase 3)

| Metric | Value |
|--------|-------|
| Monthly Infrastructure | $150 - $300 |
| Cost Per Inspection | $0.45 |
| Gross Margin | 96% |

Even with AI costs, the $14.99 price point yields exceptional margins due to high caching hit rates.

---

## Eliminated AI Approaches

### On-Device LLM (Llama Stack)
Rejected due to hallucination risk and battery drain. Centralized API allows better guardrails and caching.

### Generative UI (Google A2UI)
Rejected to maintain strict liability control. UI must be deterministic, not generated on the fly.

### Agentic Frameworks (AutoGen)
Rejected as overkill. The inspection flow is linear and structured, not requiring autonomous agent negotiation.

---

## Key AI Decisions

### Field-Only LLM Constraint
We strictly limit the LLM to structured JSON output based on specific fields. It never generates free-form advice without citing the specific inspection field it relates to. This prevents hallucination and liability.

### Contextual Caching
We cache generated checklists by Year/Make/Model. If a user inspects a "2015 Honda Civic", we check if we've already generated a checklist for that car. This reduces LLM costs by 80%.

</div>

<div id="phase4" class="phase-panel" role="tabpanel" markdown="1">

{% include readiness.html title="Phase 4 Progress" phases=site.data.readiness.phase_details.phase4.items %}

## Phase 4: Platform Scale

### Video Infrastructure
- **Provider:** Daily.co / Twilio Video
- **Recording:** Cloud Composition
- **WebRTC:** Peer-to-Peer Fallback
- **Chat:** Stream / Sendbird

### Enterprise API
- **Gateway:** Kong / Apollo GraphQL
- **Auth:** SSO / SAML / OIDC
- **Tenancy:** Row-Level Security
- **Webhooks:** Event Dispatcher

### Advanced AI
- **Vision:** Custom YOLO Model (Damage)
- **OCR:** Google Vision / AWS Textract
- **Voice:** Whisper (Dictation)
- **Analysis:** Fine-tuned Llama 3

### Cost to Serve (Phase 4)

| Metric | Value |
|--------|-------|
| Monthly Infrastructure | $2,500+ |
| Cost Per Session | $1.20 |
| Marketplace Take Rate | 20% |

On a $50 session, we net $10. Minus $1.20 cost = $8.80 profit per session.

---

## Advanced Intelligence (RAG)

### Deep Diagnostics Pipeline
Retrieval-Augmented Generation for enterprise-grade accuracy.

- **Sources:** OEM Service Manuals, TSBs, Forum Archives
- **Vector Store:** Pinecone / Milvus (High Scale)
- **Retrieval:** Hybrid Search (Keyword + Semantic)
- **Output:** Step-by-step repair procedures with citations

### Predictive Maintenance
Forecasting component failure based on fleet data.

- **Data:** Historical repair logs + Telemetry
- **Model:** Time-series forecasting (Prophet / LSTM)
- **Action:** Proactive alerts for "high risk" components

</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
  const tabs = document.querySelectorAll('.phase-tab');
  const panels = document.querySelectorAll('.phase-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      const targetId = this.getAttribute('data-tab');

      // Update tabs
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      this.classList.add('active');
      this.setAttribute('aria-selected', 'true');

      // Update panels
      panels.forEach(p => p.classList.remove('active'));
      document.getElementById(targetId).classList.add('active');
    });
  });
});
</script>
