# Phase 2B: Authentication

**Status:** In Progress

## Outcome

Users can create accounts and sign in. Vehicle data is associated with user identity. Multi-device sync enabled.

## Non-Goals

- Billing/subscription logic (Phase 2C)
- AI features (Phase 3)
- Social features
- Vehicle sharing between users
- Guest mode (must sign in to use app)
- Google OAuth (MVP is Email + Apple only; Google added later)

## User Stories

1. As a user, I can sign up with email/password
2. As a user, I can sign in with Apple (required for App Store)
3. As a user, my vehicles sync across devices
4. As a user, I can sign out
5. As a user, I can delete my account (hard delete, no retention)

## Technical Approach

### Supabase Auth

Use Supabase Auth for identity management:
- Email/password
- Apple OAuth (Google added later)

### Database Changes

```sql
-- Add user_id to vehicles table
ALTER TABLE vehicles ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Create profiles table for additional user data
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  first_name TEXT,
  email TEXT,
  phone TEXT,
  zip_code TEXT,
  entitlements JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own vehicles"
  ON vehicles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vehicles"
  ON vehicles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vehicles"
  ON vehicles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own vehicles"
  ON vehicles FOR DELETE
  USING (auth.uid() = user_id);
```

### Client Integration

```typescript
// client/src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

### iOS Deep Links

For OAuth redirects on Capacitor:

```
// ios/App/App/Info.plist
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>prepurchasepal</string>
    </array>
  </dict>
</array>
```

Redirect URL: `prepurchasepal://auth-callback`

## UI Changes

### New Screens

1. **Login/Signup Screen** - Entry point for unauthenticated users
2. **Profile Screen** - View/edit profile, sign out, delete account

### Auth Flow

1. App launch → Check Supabase session
2. No session → Show login/signup
3. Has session → Load user vehicles from Supabase
4. Sign out → Clear local state, show login

### Migration for Existing Users

**Decision:** Start fresh. No local data migration.

New accounts start with empty vehicle list. Local data in localStorage remains until user clears it manually.

## Acceptance Tests

- [ ] Email signup creates account
- [ ] Email login works
- [ ] Apple OAuth works (TestFlight required)
- [ ] Vehicles sync across devices
- [ ] RLS prevents accessing other users' data (zero rows, not error)
- [ ] Sign out clears session
- [ ] Delete account removes all user data (with receipt)

## Security Considerations

- Use Supabase service role key only on server
- Client uses anon key only
- RLS policies prevent unauthorized access
- No PII logged (email, phone)
- `user_id` on INSERT set by database default (`auth.uid()`), not client-supplied
- Account deletion returns audit receipt (counts, no PII)
- Capacitor auth storage explicitly configured (not default web storage)

## Files Changed

- New: `client/src/lib/supabase.ts`
- New: `client/src/pages/Login.tsx`
- New: `server/middleware/auth.ts`
- Modified: `client/src/pages/Profile.tsx` (wire to Supabase, add delete)
- Modified: `client/src/App.tsx` (auth check, routing)
- Modified: `client/src/lib/config.ts` (enable features.auth)
- Modified: `client/src/lib/store.ts` (clear on sign out)
- Modified: `shared/schema.ts` (add user_id, profiles table)
- Modified: `server/routes.ts` (DELETE /api/account)
- Modified: `ios/App/App/Info.plist` (deep links)
- Modified: `.env.example` (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)

## Sub-Issues

- #40 - 2B-1: Database schema (no RLS yet)
- #41 - 2B-2: Client auth + Login UI + Enable RLS
- #42 - 2B-3: Profile management + account deletion
