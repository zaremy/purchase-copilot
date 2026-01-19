# Phase 2B: Authentication

**Status:** Planned (after Phase 2A)

## Outcome

Users can create accounts and sign in. Vehicle data is associated with user identity. Multi-device sync enabled.

## Non-Goals

- Billing/subscription logic (Phase 2C)
- AI features (Phase 3)
- Social features
- Vehicle sharing between users

## User Stories

1. As a user, I can sign up with email/password
2. As a user, I can sign in with Google
3. As a user, I can sign in with Apple (required for App Store)
4. As a user, my vehicles sync across devices
5. As a user, I can sign out
6. As a user, I can delete my account

## Technical Approach

### Supabase Auth

Use Supabase Auth for identity management:
- Email/password
- Google OAuth
- Apple OAuth

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

1. Existing local data stays in localStorage
2. On first sign-in, prompt to migrate local data to cloud
3. User chooses: migrate or start fresh

## Acceptance Tests

- [ ] Email signup creates account
- [ ] Email login works
- [ ] Google OAuth works
- [ ] Apple OAuth works (TestFlight required)
- [ ] Vehicles sync across devices
- [ ] RLS prevents accessing other users' data
- [ ] Sign out clears session
- [ ] Delete account removes all user data

## Security Considerations

- Use Supabase service role key only on server
- Client uses anon key only
- RLS policies prevent unauthorized access
- No PII logged (email, phone)

## Files Changed

- New: `client/src/lib/supabase.ts`
- New: `client/src/pages/Login.tsx`
- New: `client/src/pages/Profile.tsx`
- Modified: `shared/schema.ts` (add user_id)
- Modified: `server/routes.ts` (auth middleware)
- Modified: `ios/App/App/Info.plist` (deep links)
