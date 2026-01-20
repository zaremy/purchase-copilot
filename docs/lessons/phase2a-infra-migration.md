# Lessons Learned: Phase 2A Infrastructure Migration

**Date:** 2026-01-20
**Phase:** 2A - Infrastructure Migration (Replit → Supabase/Vercel)

## Context

Migrated from Replit-hosted Express + Postgres to Vercel (serverless) + Supabase (managed Postgres). Added Sentry for observability. Performed rollback and backup fire drills.

## What Worked Well

### Vercel
- **Zero-config Express**: Export `app` as default, Vercel wraps automatically
- **Preview deployments**: Every PR gets a unique URL for testing
- **Instant Rollback**: Dashboard → Deployments → "..." → Instant Rollback (no CLI needed)
- **Environment variables**: Clean separation between Preview and Production

### Supabase
- **Connection pooler**: Use "Transaction" mode URL for serverless (avoids connection exhaustion)
- **Pro tier value**: $25/mo gets daily backups + PITR - worth it for any real project
- **Dashboard UX**: Backups UI is under Database → Backups (not Project Settings)

### Sentry (Serverless)
- **`waitUntil` pattern**: Critical for serverless - events won't send without it
  ```typescript
  import { waitUntil } from "@vercel/functions";

  app.use((_req, res, next) => {
    res.on("finish", () => {
      waitUntil(Sentry.flush(2000));
    });
    next();
  });
  ```
- **Separate DSNs**: Use `SENTRY_DSN` (server) and `VITE_SENTRY_DSN` (client) even if same value
- **Test with explicit capture**: `Sentry.captureException(new Error("test"))` is more reliable than throwing

### GitHub
- **Branch protection rulesets**: New UI is cleaner than classic protection rules
- **Issue templates**: `.github/ISSUE_TEMPLATE/` with frontmatter for auto-labels
- **"Closes #N" in commits**: Auto-closes issues on merge

## Gotchas / Surprises

### Vercel
- **No Playwright automation**: Dashboard requires OAuth, session tokens can't be persisted
- **Direct URL 404s**: `vercel.com/[user]/[project]/deployments` may 404 - navigate through dashboard instead

### Supabase
- **Free tier pauses**: DB pauses after 7 days inactivity - fine for dev, not for prod
- **Backup location**: Not in Project Settings - it's under Database → Backups (Platform section)
- **PITR requires Pro**: Point-in-time recovery only on paid plans

### Sentry
- **Serverless flush race**: Without `waitUntil`, function exits before events send
- **Source maps**: Need `SENTRY_AUTH_TOKEN` + release pipeline for readable stacks
- **Error handler order**: `Sentry.setupExpressErrorHandler(app)` must be AFTER routes, BEFORE custom error handler

### General
- **Branch protection blocks direct push**: Had to reset commits and create PRs twice
- **CI check names matter**: Must match exact job name (`ci`) in branch protection rules

## Actual vs Expected Effort

| Task | Expected | Actual | Notes |
|------|----------|--------|-------|
| Vercel initial deploy | 1h | 30min | Smoother than expected |
| Supabase setup | 1h | 45min | Connection string copy-paste |
| Sentry server | 2h | 4h | Serverless flush issues |
| Sentry client | 1h | 30min | Straightforward after server |
| Rollback drill | 30min | 1h | Playwright detour, then manual |
| Backup drill | 30min | 30min | Pro tier made it trivial |
| Documentation | 2h | 3h | More thorough than planned |

**Total:** ~10h (vs ~8h expected)

## Reusable Patterns

### Sentry Serverless Setup
```typescript
// src/sentry-serverless.ts
import * as Sentry from "@sentry/node";

let initialized = false;

export function initSentryServerless() {
  if (initialized || !process.env.SENTRY_DSN) return;

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || "production",
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  });

  initialized = true;
}

export async function flushSentry(timeout = 2000): Promise<void> {
  if (!initialized) return;
  await Sentry.flush(timeout);
}

export { Sentry };
```

### Health Endpoint Pattern
```typescript
app.get("/api/health", async (req, res) => {
  const checks: Record<string, { status: "ok" | "error"; latencyMs?: number }> = {};

  const dbStart = Date.now();
  try {
    await pool.query("SELECT 1");
    checks.database = { status: "ok", latencyMs: Date.now() - dbStart };
  } catch (error) {
    checks.database = { status: "error" };
  }

  const allHealthy = Object.values(checks).every(c => c.status === "ok");
  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    checks,
  });
});
```

### Branch Protection Ruleset (GitHub)
- Name: `protect-main`
- Target: Default branch
- Rules: Require PR, require `ci` status check, block force push, restrict deletions

## Documentation Gaps Found

| Service | Gap |
|---------|-----|
| Vercel | Instant Rollback not prominently documented (it's great!) |
| Supabase | Backup UI location unclear in docs |
| Sentry | Serverless flush pattern buried in advanced docs |

## Tools/Services Evaluated

| Service | Chose? | Why |
|---------|--------|-----|
| Vercel | Yes | Free tier sufficient, excellent DX, instant rollback |
| Supabase | Yes | Managed Postgres, auth built-in for Phase 2B |
| Sentry | Yes | Best error tracking, good free tier |
| Replit | No (migrated away) | Pausing issues, less control |

## Key Decisions Made

1. **Upgraded Supabase to Pro early** - $25/mo for peace of mind (backups, no pausing)
2. **Kept Vercel on Free** - No bandwidth issues yet, can upgrade later
3. **Sentry for both client and server** - Single dashboard for all errors
4. **Fire drills before shipping** - Rollback + backup drills caught issues early
