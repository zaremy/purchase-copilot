---
layout: default
title: Technical Architecture
---

# Technical Architecture

**SYSTEM DESIGN**

A mobile-first vehicle inspection app backed by a scalable Node.js/PostgreSQL backend.

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

## MVP Tech Stack (Shipped)

### Mobile App
- **Framework:** React 19 + Vite
- **Native:** Capacitor 8 (iOS)
- **State:** Zustand (persist middleware)
- **UI:** Tailwind CSS

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

### Offline-First Design
Inspections often happen in dead zones. Local-first architecture with Zustand persist ensures data survives app restarts. Full offline sync deferred to Phase 3 tooling.

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

## Eliminated Platform Approaches

### React Native / Expo Stack
Originally planned: React Native (Expo), TanStack Query, MMKV, NativeWind.
Shipped instead: React 19 + Vite + Capacitor, Zustand, localStorage, Tailwind CSS.
Reason: Faster iteration, simpler toolchain. Capacitor provides native iOS access without React Native bridge complexity.

### TanStack Query Offline
Originally planned for offline-first sync. Replaced with Zustand for simpler state management. Full offline sync deferred to Phase 3 tooling.

### Blockchain Vehicle History
Rejected due to lack of adoption by major DMVs and manufacturers. Centralized databases (CarFax) remain the source of truth.

### Peer-to-Peer Payments
Rejected handling direct vehicle payments to avoid money transmitter licensing requirements. We facilitate the deal, not the funds.

</div>

<div id="phase2" class="phase-panel" role="tabpanel" markdown="1">

{% include readiness.html title="Phase 2 Progress" phases=site.data.readiness.phase_details.phase2.items %}

## Phase 2: Backend Foundation

### Supabase Auth + Database
Supabase provides both Authentication and PostgreSQL, replacing custom Express auth logic with a secure, managed service.

- **Zero-Config Auth:** Email/Password, Google, Apple login out of the box.
- **Row Level Security (RLS):** Secure user data at the database level.
- **Free Tier:** Generous limits (500MB db, 50k MAU) perfect for <1000 users.

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

## Phase 2B Tech Stack (Manual Auth)

### Shipped: Email/Password
- **Provider:** Supabase Auth
- **Client:** `@supabase/supabase-js`
- **State:** Zustand store with persist middleware
- **UI:** Login (4 modes), Profile management, Sign Out

### Security
- **PKCE:** Enabled
- **Session:** JWT (Supabase-managed)
- **Logout:** Revoke tokens + clear local storage

---

## Phase 2C Tech Stack (Apple Auth)

### Shipped: Sign in with Apple
- **Provider:** Supabase Auth (Apple OAuth)
- **Native:** `@capgo/capacitor-social-login`
- **Flow:** Native ASAuthorizationController → `signInWithIdToken()`

### Key Points
- Native flow required (PKCE WebView loses code_verifier)
- Profile hydration from `user_metadata`
- 6-month secret rotation via `scripts/generate-apple-secret.mjs`

---

## Key Architecture Decisions

### Managed Integration Strategy
We deliberately chose Vercel's native integrations for Supabase and Sentry over manual configuration. This ensures environment variables are automatically synced and deployments are atomically linked to database migrations and error tracking releases.

### Phased Rollout (2A → 2B → 2C)
Instead of a "big bang" release, we split the backend foundation into distinct sub-phases: Infrastructure (2A), Manual Auth (2B), Apple Auth (2C). Billing moved to Phase 3 as first tool. Google Sign-In moved to Phase 4 to prioritize Apple Sign-In first (iOS App Store requirement).

---

## Eliminated Platform Approaches

### Replit Backend
Originally deployed on Replit with custom Express auth logic. Migrated to Supabase-centric architecture for <1000 users — lower friction, managed auth, and generous free tier.

</div>

<div id="phase3" class="phase-panel" role="tabpanel" markdown="1">

{% include readiness.html title="Phase 3 Progress" phases=site.data.readiness.phase_details.phase3.items %}

## Phase 3: Pro Plan (Tooling + Monetization)

Everything ships as deterministic tools that an AI/agent can call. Build order: Billing → VIN/Media → Reports → Guidance Orchestrator.

---

## 3A: Billing Tools

Entitlement model first, paywall UI later.

### RevenueCat (iOS IAP)
Mandatory for iOS App Store compliance. Abstracts Apple's complex StoreKit APIs.

- **Source of Truth:** RevenueCat manages subscription status, syncing to Supabase.
- **Webhooks:** Sync entitlement updates to your Vercel backend.

### In-App Purchases (iOS)
Direct integration with Apple App Store via RevenueCat.

- Single SKU: "Pro Upgrade" ($9.99)
- Restores purchases across devices
- Syncs `is_pro` status to Supabase User table

### Web Payments
Simple Stripe Checkout for web-based upgrades.

- Stripe Webhook to Supabase Edge Function
- Updates user role to 'pro'
- No recurring billing logic needed yet

---

## 3B: VIN Tools

- **VIN Decode:** NHTSA API (Year/Make/Model/Engine)
- **VIN Scan:** Camera OCR (deferred)
- **VIN Lookup:** Market data enrichment (MarketCheck API)

---

## 3C: Media Tools

- **Photo Capture:** Camera integration via Capacitor
- **Photo Attach:** Link photos to inspection fields
- **Storage:** Supabase Storage or S3

---

## 3D: Reports Tool

Flagship paid output.

- **Generate:** Compile inspection data into formatted report
- **Share:** Export as PDF or shareable link
- **Branding:** User/pro badge, timestamp

---

## 3E: Guidance Orchestrator

AI calls tools; no business logic in prompts.

### Tool-First Approach
- **LLM:** JSON Mode (Strict) for structured output
- **Orchestration:** AI selects which tools to call based on context
- **Caching:** Cache guidance by Year/Make/Model (80% cost reduction)

### Key Constraints
- LLM limited to structured JSON output based on specific fields
- Never generates free-form advice without citing the inspection field
- Prevents hallucination and liability

---

## Eliminated AI Approaches

### Heavy AI-First Architecture
Originally planned: GPT-4-turbo with vector DB (pgvector), BullMQ queues, SSE streaming, Upstash Redis rate limiting, Helicone/LangSmith monitoring, MarketCheck/CarFax/NHTSA enrichment. Replaced with tool-first approach where AI orchestrates deterministic tools. Simpler, more testable, lower cost.

Original cost projection: $150-300/mo infrastructure, $0.45/inspection.

### On-Device LLM (Llama Stack)
Rejected due to hallucination risk and battery drain. Centralized API allows better guardrails and caching.

### Generative UI (Google A2UI)
Rejected to maintain strict liability control. UI must be deterministic, not generated on the fly.

### Agentic Frameworks (AutoGen)
Rejected as overkill. The inspection flow is linear and structured, not requiring autonomous agent negotiation.

</div>

<div id="phase4" class="phase-panel" role="tabpanel" markdown="1">

{% include readiness.html title="Phase 4 Progress" phases=site.data.readiness.phase_details.phase4.items %}

## Phase 4: Distribution + GTM

---

## Paywall + Subscriptions

RevenueCat SDK integration + native purchase UI. Connects payment collection to the entitlement model built in Phase 3A.

### RevenueCat SDK (iOS)
- **Package:** `purchases-capacitor`
- **Init:** Configure with app-specific API key on app start
- **Login:** `Purchases.logIn(supabaseUserId)` to link identities
- **Offerings:** Fetch configured products from RevenueCat dashboard

### Purchase Flow
- **Paywall UI:** Display offerings, handle purchase
- **Restore:** `Purchases.restorePurchases()` for device transfers
- **Webhooks:** Already configured in Phase 3A (syncs entitlements)

### App Store Connect
- **Product:** Single SKU "Pro Upgrade" (monthly or annual)
- **Sandbox:** Test with sandbox Apple ID
- **Review:** Submit for App Store review

### Web Fallback (Optional)
- **Stripe Checkout:** For web-based upgrades
- **Webhook:** Sync to Supabase via Edge Function

---

## Welcome Experience

### Sign-in Screen
- **Design Refresh**: Update after Pro Plan features ship
- **Apple Sign-In**: Primary auth method (shipped in Phase 2B)
- **Email/Password**: Secondary option

### First-time UX
- **Onboarding Flow**: Introduce core features to new users
- **Activation Funnels**: Guide users to first inspection

---

## Google Sign-In
- **Provider:** Supabase Auth (Google OAuth)
- **Platform:** Web + iOS (deferred from Phase 2B)
- **Goal:** Conversion friction reduction

---

## Marketing Site
- **Landing Page**: Product overview, feature highlights
- **App Store Links**: iOS download, future Android
- **SEO**: Optimized for "used car inspection" keywords

---

## Deferred: Enterprise Features

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

### Cost to Serve (Enterprise)

| Metric | Value |
|--------|-------|
| Monthly Infrastructure | $2,500+ |
| Cost Per Session | $1.20 |
| Marketplace Take Rate | 20% |

On a $50 session, we net $10. Minus $1.20 cost = $8.80 profit per session.

---

## Deferred: Advanced Intelligence (RAG)

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
