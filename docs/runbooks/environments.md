# Environment Configuration

## Overview

Pre-Purchase Pal uses environment variables for configuration. All required variables must be set before the application starts - the server will fail fast if any are missing.

## Environments

| Environment | Purpose | Infrastructure |
|-------------|---------|----------------|
| `development` | Local development | Local Node.js + Postgres (or Replit) |
| `preview` | PR previews | Vercel Preview + Supabase (Phase 2A+) |
| `production` | Live App Store build | Vercel Production + Supabase (Phase 2A+) |

## Configuration Files

| File | Purpose |
|------|---------|
| `.env.example` | Template with all variables (committed) |
| `.env` | Local secrets (gitignored) |
| `server/config.ts` | Server-side validation |
| `client/src/lib/config.ts` | Client-side config |

## Required Variables

### Database (Always Required)

```bash
DATABASE_URL=postgresql://user:password@host:port/database
```

**Sources:**
- Local: PostgreSQL running locally
- Replit: Automatically provisioned
- Supabase: Dashboard → Settings → Database → Connection string (Transaction pooler)

### Server Settings (Optional)

```bash
PORT=5000                    # Default: 5000
NODE_ENV=development         # development | production
```

## Phase 2 Variables (Not Yet Required)

### Supabase Auth (Phase 2B)

```bash
SUPABASE_URL=https://[project-ref].supabase.co
SUPABASE_ANON_KEY=eyJ...     # Public key - safe for client
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # Server only - NEVER expose
```

**Where to find:** Supabase Dashboard → Settings → API

### Client Variables (Vite)

Client-side variables must be prefixed with `VITE_`:

```bash
VITE_SUPABASE_URL=https://[project-ref].supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### Billing (Phase 2C - Deferred)

```bash
REVENUECAT_API_KEY=...
REVENUECAT_WEBHOOK_SECRET=...
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Observability

```bash
SENTRY_DSN=https://[key]@[org].ingest.sentry.io/[project]
```

## Secret Management

### Local Development

Store secrets in `.env` file (gitignored). Never commit actual values.

### CI/CD (GitHub Actions)

Store secrets in: Settings → Secrets and variables → Actions

### Vercel

Store secrets in: Project Settings → Environment Variables

Set per-environment (Preview vs Production) as needed.

## Validation

The server validates configuration at startup:

```typescript
// server/config.ts
const result = serverConfigSchema.safeParse(process.env);
if (!result.success) {
  throw new Error(`Server configuration error:\n${errors}`);
}
```

If a required variable is missing, the server will not start.

## Security Rules

1. **Never commit secrets** - Use `.env.example` as template only
2. **Client gets public keys only** - Anon key is safe; service role key is not
3. **Rotate on exposure** - If a key is leaked, rotate immediately
4. **Least privilege** - Use the minimum permissions needed
