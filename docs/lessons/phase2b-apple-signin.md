---
layout: default
title: "Lessons Learned: Phase 2B Apple Sign-In"
---

# Lessons Learned: Phase 2B Apple Sign-In

**Date:** 2026-01-24

## Context

Added Sign in with Apple to existing Supabase Auth setup for App Store compliance. Required configuration across Apple Developer Portal, Supabase Dashboard, and Xcode.

## What Worked Well

### Apple Developer Portal
- **Services ID separation**: Using `com.purchasecopilot.app.web` (Services ID) as the OAuth client ID, separate from App ID
- **Key download**: .p8 file is only available once - immediately moved to secure location outside repo

### JWT Client Secret Generation
- **jose library**: Clean ES256 signing with Node.js built-in crypto
- **Script reusability**: `scripts/generate-apple-secret.mjs` can regenerate the secret every 6 months

### Capacitor Deep Link Handler
- **PKCE flow**: `exchangeCodeForSession(url)` is required - the URL contains the auth code that needs to be exchanged
- **Async listener pattern**: `CapApp.addListener` returns a promise, so cleanup requires storing the handle

## Gotchas / Surprises

### Apple Developer Portal
- **App Store Connect ≠ Developer Portal**: User initially went to App Store Connect (distribution) instead of Developer Portal (certificates/identifiers/keys)
- **Services ID requires explicit domain/return URL config**: Must click "Configure" on the Services ID and add Supabase domain + callback URL
- **Key names can't have spaces**: `Pre-Purchase Pal Sign In` was rejected, used `PrePurchasePalAppleSignIn`

### Supabase Configuration
- **Client ID is Services ID, not App ID**: Common mistake - Supabase "Client ID" field wants the Services ID (`com.purchasecopilot.app.web`)
- **Secret is JWT, not Key ID**: User initially pasted Key ID instead of the full JWT token

### iOS Testing
- **Simulator can't complete Apple Sign-In**: Shows the auth form but can't authenticate - requires real device
- **Developer Mode required**: iOS 16+ requires Developer Mode enabled on device for direct Xcode installs
- **`invalid_client` error**: Means Services ID domain/return URL mismatch or wrong Client ID in Supabase

### PKCE Flow
- **`getSession()` won't work alone**: After OAuth redirect, must call `exchangeCodeForSession(url)` to exchange the code for a session

## Configuration Checklist (for future reference)

### Apple Developer Portal
1. **App ID** (`com.purchasecopilot.app`): Enable Sign In with Apple capability
2. **Services ID** (`com.purchasecopilot.app.web`):
   - Enable Sign In with Apple
   - Configure: Domain = `<project>.supabase.co`, Return URL = `https://<project>.supabase.co/auth/v1/callback`
3. **Key**: Create with Sign In with Apple, download .p8, record Key ID

### Supabase Dashboard
1. **Auth → Providers → Apple**: Enable, set Client ID = Services ID, Secret = JWT
2. **Auth → URL Configuration**: Add `prepurchasepal://auth-callback`

### Xcode
1. **Signing & Capabilities**: Add "Sign in with Apple" capability

### Code
1. **Deep link listener** in App.tsx using `@capacitor/app`
2. **Use `exchangeCodeForSession(url)`** not just `getSession()`

## Reusable Patterns

### Apple Client Secret Generator
```javascript
// scripts/generate-apple-secret.mjs
const jwt = await new SignJWT({})
  .setProtectedHeader({ alg: 'ES256', kid: KEY_ID })
  .setIssuer(TEAM_ID)
  .setIssuedAt(now)
  .setExpirationTime(now + sixMonths)
  .setAudience('https://appleid.apple.com')
  .setSubject(CLIENT_ID) // Services ID
  .sign(privateKey);
```

### Deep Link Handler (Capacitor)
```typescript
useEffect(() => {
  if (!Capacitor.isNativePlatform()) return;

  let handle: { remove: () => void } | null = null;

  CapApp.addListener('appUrlOpen', async ({ url }) => {
    if (!url.includes('auth-callback')) return;

    const { data, error } = await supabase.auth.exchangeCodeForSession(url);
    if (!error && data?.session) {
      setSession(data.session);
    }
  }).then((h) => { handle = h; });

  return () => { handle?.remove(); };
}, []);
```

## Sign Out Implementation (Issue #46)

### State Clearing on Sign Out
- **Problem**: Without clearing local state, User B could see User A's cached data after sign out
- **Solution**: `resetStore()` in Zustand clears user-scoped state (vehicles, candidates, userProfile)

### Pattern: User-Scoped State Reset
```typescript
// client/src/lib/store.ts
const USER_SCOPED_INITIAL = {
  vehicles: [] as LocalVehicle[],
  candidates: [] as Candidate[],
  userProfile: null as UserProfile | null,
};

// In store actions:
resetStore: () => set(USER_SCOPED_INITIAL),
```

### Sign Out Handler
```typescript
// client/src/pages/Profile.tsx
const handleSignOut = async () => {
  try {
    await signOut();
  } finally {
    resetStore(); // Always clear local state, even if signOut fails
  }
  // App.tsx auth gate auto-redirects to Login when session becomes null
};
```

### Key Decisions
- **No confirmation dialog**: Sign out is non-destructive (data persists in Supabase)
- **`finally` block**: Ensures local state clears even if Supabase signOut fails
- **Feature flag**: Sign Out button only shows when `features.auth` is true

## iOS Safe Area Layout Patterns

### Headers (Pages)
Use `pt-safe` utility class from `index.css`:
- Applies `padding-top: calc(1rem + env(safe-area-inset-top))`
- Includes 1rem baseline padding + safe area inset
- Used by: MobileLayout, Toast, page headers

**Important:** Don't combine `pt-safe` with `py-4` - use `pb-4` only and let `pt-safe` handle top padding.

Example:
```tsx
<div className="bg-neutral-900 text-white px-4 pb-4 pt-safe flex items-center">
```

### Sheets (Overlays)
Use inline style to position below notch:
```tsx
style={{ top: 'calc(env(safe-area-inset-top) + 20px)' }}
```

### When NOT to use pt-safe
- Full-screen pages without headers (content centered, like Login welcome screen)
- Sheet overlays (use inline top positioning instead)

## Native Apple Sign-In (Issue #49)

### OAuth vs Native Flow
- **OAuth+PKCE failed**: iOS terminates WebView when Safari opens, losing PKCE `code_verifier` from localStorage
- **Solution**: Use `@capgo/capacitor-social-login` for native Apple Sign-In + Supabase `signInWithIdToken()`
- **No nonce needed**: Removed nonce from both `SocialLogin.login()` and `signInWithIdToken()` to fix mismatch error

### Profile Hydration
When using Apple Sign-In, profile data must be hydrated from `session.user.user_metadata`:
```typescript
// In App.tsx when session is established
const meta = session.user.user_metadata;
setUserProfile({
  firstName: meta?.full_name || meta?.given_name || meta?.first_name || '',
  email: session.user.email || '',
  phone: meta?.phone || '',
  zipCode: meta?.zip_code || '',
});
```

### Interactive Sign-In Redirect (Improved Pattern)
When Login is rendered directly (not via Router), wouter's `location` is `/` not `/login`. The `prevSessionRef` pattern has a flaw: it triggers on cold start when a session already exists.

**Better approach**: Track the SIGNED_IN event itself with a ref, only redirect after interactive sign-in:
```typescript
const didInteractiveSignInRef = useRef(false);

// In auth state subscription:
onAuthStateChange((event, s) => {
  setSession(s);
  if (event === 'SIGNED_IN') {
    didInteractiveSignInRef.current = true;
  }
  if (event === 'SIGNED_OUT') {
    didInteractiveSignInRef.current = false;  // Clear to avoid stale redirect
  }
});

// Redirect effect:
useEffect(() => {
  if (didInteractiveSignInRef.current && session && !authLoading) {
    didInteractiveSignInRef.current = false;
    if (location !== '/') {  // Prevent redundant route writes
      setLocation('/');
    }
  }
}, [session, authLoading, location, setLocation]);
```

### Hide My Email (Apple Privacy Relay)
When users choose "Hide My Email" in Sign in with Apple, they get a `@privaterelay.appleid.com` address. Apple guideline: "honor the user's choice."

Display a friendly label instead of the relay address:
```typescript
const isApplePrivateRelay = (email?: string) =>
  email?.endsWith('@privaterelay.appleid.com');

// In Profile display:
{isApplePrivateRelay(email) ? 'Hidden via Apple' : email || 'Not provided'}
```

### fullName Field for Profile Display
Apple Sign-In provides `full_name` in user metadata. Add a `fullName` field to `UserProfile` for proper display:
```typescript
// store.ts
export interface UserProfile {
  firstName: string;
  fullName: string;  // New field
  email: string;
  phone: string;
  zipCode: string;
}

// App.tsx hydration
const fullName = meta?.full_name || meta?.name || '';
const firstName = fullName.split(' ')[0] || '';
setUserProfile({ firstName, fullName, ... });

// Profile.tsx display
{userProfile?.fullName || userProfile?.firstName || 'User'}
```

## Native App Version Display (Issue #58)

### Problem
Settings footer showed hardcoded "Pre-Purchase Copilot v1.0.0" instead of dynamic version from iOS.

### Solution
Use `@capacitor/app` to get native version at runtime, fall back to package.json on web:
```typescript
// Settings.tsx
const [appVersion, setAppVersion] = useState(__APP_VERSION__);

useEffect(() => {
  if (Capacitor.isNativePlatform()) {
    App.getInfo()
      .then((info) => setAppVersion(info.version))
      .catch(() => {});
  }
}, []);

// Footer: Pre-Purchase Pal v{appVersion}
```

### Key Points
- `__APP_VERSION__` injected at build time via Vite `define` (from package.json)
- `App.getInfo().version` returns CFBundleShortVersionString from Info.plist
- Always add `.catch()` to prevent unhandled promise noise

## Maintenance Notes

- **6-month secret rotation**: Apple client secrets expire after 6 months. Run `node scripts/generate-apple-secret.mjs` before 2026-07-23
- **.p8 file location**: `../secrets/AuthKey_ZH8G74AMF8.p8` (outside repo)
- **Credentials**: Team ID `7Z8N956AQ2`, Key ID `ZH8G74AMF8`, Services ID `com.purchasecopilot.app.web`
