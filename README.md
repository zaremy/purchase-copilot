# Pre-Purchase Pal

Mobile-first vehicle inspection app for used car buyers. Helps you evaluate vehicles systematically before purchase.

**[View Product Playbook →](https://zaremy.github.io/purchase-copilot/playbook/)**

## Status

- **Phase 1** (Complete): Manual inspection MVP - in App Store
- **Phase 2** (Active): Accounts + billing + entitlements
- **Phase 3** (Planned): AI-powered inspection guidance

## Stack

- **Frontend**: React 19 + TypeScript, Capacitor (iOS)
- **Backend**: Express + Drizzle ORM
- **Database**: PostgreSQL
- **State**: Zustand (local-first)
- **Deploy**: Replit (current)

## Development

```bash
npm install
npm run dev          # Start backend + frontend
npm run typecheck    # TypeScript check
npm run build        # Production build
```

## Documentation

| Doc | Purpose |
|-----|---------|
| [CLAUDE.md](CLAUDE.md) | AI agent work contract |
| [replit.md](replit.md) | Detailed architecture |
| [docs/discovery/](docs/discovery/) | Research and planning |

## Contributing

All changes require PRs with passing CI. See [CLAUDE.md](CLAUDE.md) for code standards.
