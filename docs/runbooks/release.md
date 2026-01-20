# Release & Rollback

## Branch Protection

**Ruleset:** `protect-main` (configured 2026-01-20)

**Target:** `main` branch

**Rules enabled:**
- Require pull request before merging
- Require status checks to pass (`ci` job)
- Restrict deletions
- Block force pushes

**Location:** https://github.com/zaremy/purchase-copilot/settings/rules

## Versioning

### API/Server

No formal versioning yet. Deployments are tied to commits.

### iOS App

Uses standard App Store versioning:

| Field | Format | Example | When to Bump |
|-------|--------|---------|--------------|
| Version | `MAJOR.MINOR.PATCH` | `1.2.3` | User-visible changes |
| Build | Integer | `42` | Every submission |

**Rules:**
- Bump `PATCH` for bug fixes
- Bump `MINOR` for new features
- Bump `MAJOR` for breaking changes
- Always increment build number for App Store submissions

**Location:** `ios/App/App.xcodeproj/project.pbxproj`

## Release Process

### API/Server (Current: Replit)

1. Merge PR to `main`
2. Replit auto-deploys from `main`
3. Verify `/api/health` returns 200

### API/Server (Phase 2A: Vercel)

1. Merge PR to `main`
2. Vercel auto-deploys
3. Verify health endpoint
4. Check Sentry for new errors

### iOS App

1. Bump version/build in Xcode
2. Archive and upload to App Store Connect
3. Submit for review
4. Wait for approval (1-3 days typical)

## Rollback

### API Rollback (Vercel)

**Via Dashboard (Recommended - Instant Rollback):**

1. Go to https://vercel.com/dashboard
2. Select the project (e.g., "purchase-copilot")
3. Click "Deployments" tab
4. Find the deployment to rollback TO (the previous working version)
5. Click "..." menu on that row
6. Click "Instant Rollback"
7. Confirm in the dialog
8. Verify `/api/health` returns 200

**Via CLI:**
```bash
# List recent deployments
vercel ls

# Promote previous deployment
vercel rollback [deployment-url]
```

**Drill completed:** 2026-01-20 - Rollback and roll-forward verified, health endpoint green.

**Replit (Legacy):**
- Use git to revert commit on `main`
- Replit will auto-deploy reverted state

### iOS Rollback

**Reality: You can't roll back a live App Store build.**

Options:
1. **Hotfix:** Submit new build with fix (fastest: expedited review ~24h)
2. **Halt rollout:** If using phased release, pause at current percentage
3. **Remove from sale:** Last resort, removes app from store

### Database Rollback

**Drizzle migrations:**
```bash
# View migration history
npx drizzle-kit status

# Generate migration
npx drizzle-kit generate

# Push to database
npx drizzle-kit push
```

**Supabase backups (Pro tier):**

Daily scheduled backups + Point-in-Time Recovery (PITR) enabled.

**Restore from scheduled backup:**
1. Go to Supabase Dashboard → Database → Backups
2. Find the backup to restore from (listed by date/time)
3. Click "Restore" button
4. Confirm in dialog (this overwrites current data)
5. Wait for restore to complete
6. Verify `/api/health` returns 200

**Point-in-Time Recovery:**
1. Go to Supabase Dashboard → Database → Backups → "Point in time" tab
2. Select exact timestamp to restore to
3. Confirm restore
4. Verify health endpoint

**Download backup (for local analysis):**
1. Click "Download" on any backup
2. File is a PostgreSQL dump (.sql)

**Backup drill completed:** 2026-01-20 - Verified daily backup exists, restore UI accessible.

**RPO (Recovery Point Objective):** 24 hours for scheduled backups, near-zero with PITR.

## Hotfix Protocol

### Severity Levels

| Level | Definition | Response Time |
|-------|------------|---------------|
| P0 | App crashes on launch | Immediate |
| P1 | Core feature broken | Same day |
| P2 | Non-critical bug | Next sprint |

### P0/P1 Hotfix Steps

1. **Identify:** Confirm issue in Sentry/logs
2. **Branch:** Create `hotfix/[issue]` from `main`
3. **Fix:** Minimal change only
4. **Test:** Verify fix locally
5. **PR:** Create PR with `[HOTFIX]` prefix
6. **Deploy:** Merge immediately after CI passes
7. **Verify:** Check health endpoint + Sentry
8. **iOS:** If mobile-only, expedite App Store review

### Requesting Expedited App Store Review

1. Go to App Store Connect → App → App Review
2. Click "Contact Us"
3. Select "Request Expedited Review"
4. Explain the critical bug
5. Typical response: 24 hours

## Feature Flags

For high-risk changes, use feature flags in `client/src/lib/config.ts`:

```typescript
export const features = {
  auth: false,      // Phase 2B
  billing: false,   // Phase 2C
  aiGuidance: false // Phase 3
} as const;
```

**Usage:**
```typescript
import { features } from '@/lib/config';

if (features.auth) {
  // New auth flow
} else {
  // Legacy flow
}
```

Enable gradually:
1. Internal testing
2. Beta users (TestFlight)
3. Phased App Store rollout
4. 100% rollout

## Health Monitoring

### Health Endpoint

```bash
curl https://your-domain.com/api/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2026-01-18T12:00:00Z",
  "environment": "production",
  "checks": {
    "database": { "status": "ok", "latencyMs": 12 }
  }
}
```

### Monitoring Checklist

After each release:
- [ ] `/api/health` returns 200
- [ ] No new errors in Sentry
- [ ] Database latency normal
- [ ] App Store reviews (for iOS releases)
