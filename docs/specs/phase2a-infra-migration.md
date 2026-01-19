# Phase 2A: Infrastructure Migration

**Status:** Next

## Outcome

Migrate from Replit to Supabase + Vercel. App continues to work identically, but on stable, scalable infrastructure.

## Non-Goals

- Auth changes (Phase 2B)
- Billing integration (Phase 2C)
- New features
- Schema changes beyond what's needed for migration

## Why

Replit has reliability issues:
- Silent database changes reported
- Data loss incidents reported
- Not recommended for production

See [ADR 0001: Supabase + Vercel](../decisions/0001-supabase-vercel.md).

## Steps

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) → New Project
2. Region: Choose closest to target users
3. Save database password securely
4. Note: Project URL and API keys

### 2. Migrate Database Schema

```bash
# Generate migration from current Drizzle schema
npx drizzle-kit generate

# Connect to Supabase
export DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-us-west-1.pooler.supabase.com:6543/postgres"

# Push schema
npx drizzle-kit push
```

### 3. Migrate Data (If Any)

```bash
# Export from Replit PostgreSQL
pg_dump $OLD_DATABASE_URL > backup.sql

# Import to Supabase
psql $NEW_DATABASE_URL < backup.sql
```

### 4. Deploy to Vercel

1. Connect GitHub repo to Vercel
2. Set environment variables:
   - `DATABASE_URL` → Supabase connection string
   - `NODE_ENV` → `production`
3. Deploy

### 5. Update iOS App

1. Update API base URL in client config
2. Build new TestFlight version
3. Test all CRUD operations
4. Submit to App Store

### 6. Decommission Replit

1. Verify all traffic on Vercel
2. Export any remaining data
3. Archive Replit project

## Acceptance Tests

- [ ] Supabase project created
- [ ] Schema migrated successfully
- [ ] `/api/health` returns 200 on Vercel
- [ ] All vehicle CRUD operations work
- [ ] iOS app connects to new API
- [ ] Replit project archived

## Rollback

If migration fails:
1. Keep Replit running until Vercel is verified
2. Point iOS app back to Replit URL
3. Investigate and retry migration

## Files Changed

- `.env.example` (new Supabase vars)
- `server/config.ts` (if needed)
- Client API base URL
- `ios/App/` (if URL changes)
