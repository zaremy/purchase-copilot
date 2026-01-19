# ADR 0001: Supabase + Vercel for Phase 2

**Status:** Accepted

## Context

Replit has reliability issues (data loss reports, silent DB changes). Need stable infrastructure before adding user accounts.

Current state:
- Express API running on Replit
- PostgreSQL provisioned by Replit
- Local-first client with optional server sync

Requirements for Phase 2:
- User authentication
- Reliable database with backups
- Scalable hosting
- Low operational overhead for solo developer

## Decision

Migrate to Supabase (PostgreSQL + Auth) and Vercel (Node.js serverless).

**Supabase provides:**
- Managed PostgreSQL with daily backups
- Built-in Auth (no custom Passport.js)
- Row Level Security for data isolation
- Generous free tier

**Vercel provides:**
- Serverless Node.js hosting
- Auto-scaling
- Preview deployments per PR
- Zero-config from GitHub

## Consequences

### Positive

- Stable managed database with daily backups (vs Replit data loss risk)
- Auth built-in with social providers, magic links, and JWT
- Serverless scales automatically without capacity planning
- Free tier sufficient for <1000 users
- Both services have excellent developer experience

### Negative

- Migration effort required (one-time)
- Two services to monitor instead of one
- Supabase free tier has DB pause after 7 days inactivity (acceptable for pre-launch)

### Migration Path

1. Create Supabase project
2. Run Drizzle migrations against Supabase
3. Create Vercel project connected to GitHub
4. Update environment variables
5. Validate with `/api/health` endpoint
6. Cut over DNS/client config
