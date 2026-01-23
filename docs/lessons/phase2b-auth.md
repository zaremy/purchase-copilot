# Lessons Learned: Phase 2B Authentication

**Date:** 2026-01-22
**Phase:** 2B - Authentication (Supabase Auth + RLS)

## Context

Implemented email/password authentication with Supabase Auth, Login UI with 4-mode state machine, and Row Level Security policies for user data isolation.

## What Worked Well

### Supabase Auth
- **Email confirmation flow**: `emailRedirectTo: window.location.origin` correctly returns users to initiating origin (preview or production)
- **User metadata storage**: `raw_user_meta_data` in auth.users is ideal for profile data collected at signup
- **RLS policies**: Simple `auth.uid() = user_id` predicates are easy to reason about
- **Default user_id**: `ALTER TABLE vehicles ALTER COLUMN user_id SET DEFAULT auth.uid()` prevents client from spoofing user_id

### Vercel Environment Variables
- **Per-environment config**: Production vs Preview checkboxes allow different Supabase projects per environment
- **VITE_ prefix**: Client-side env vars must be prefixed for Vite bundler exposure

### Testing
- **RLS drill pattern**: Create User A vehicle, switch to User B, verify empty list - simple and definitive

## Gotchas / Surprises

### Vercel
- **Env vars not inherited**: Adding env vars to Preview doesn't auto-apply to Production - must check both
- **Redeploy required**: After adding env vars, must manually redeploy (not automatic)

### Supabase Auth
- **Email confirm opens new context**: Confirmation link opens in browser without session - user lands on Sign In, not Home
- **This is expected behavior**: New browser context has no localStorage session, so auth gate shows Login

### Process
- **Blocking items bypassed**: PR was merged with items marked "Blocking Merge" still incomplete
- **Root cause**: Explicit merge command was followed without flagging contradiction with status table
- **Resolution**: Items completed post-merge during verification gates

## Actual vs Expected Effort

| Task | Expected | Actual | Notes |
|------|----------|--------|-------|
| Supabase Auth setup | 1h | 30min | Dashboard wizard is smooth |
| Login UI (4 modes) | 3h | 4h | Form validation edge cases |
| RLS policies | 1h | 30min | Already had migration script |
| Vercel env config | 15min | 1h | Debugging blank screen (missing env vars) |
| Post-merge verification | 1h | 2h | Manual testing + RLS drill |

**Total:** ~8h (vs ~6h expected)

## Key Decisions Made

1. **No confirmation dialog for sign out** - Sign out is non-destructive (data persists in Supabase)
2. **Email confirm lands on Sign In** - Accepted behavior since new browser context has no session
3. **Local state cleared on sign out** - Prevents data leakage between users on same device (Issue #46)

## Process Improvements

### Pre-Merge Checklist
When status tables show "Blocking Merge" items:
1. All blocking items must be marked complete before merge
2. If user requests merge with incomplete blockers, explicitly ask: "These items are marked blocking - confirm you want to merge anyway?"
3. If merging anyway, update status table to show items as "Post-merge" not "Blocking"

### Verification Gates Pattern
Post-merge verification should follow explicit gates:
1. **Gate 1**: Production build works (no blank screen, correct UI)
2. **Gate 2**: Core flow works (signup/signin end-to-end)
3. **Gate 3**: Security verified (RLS drill, data isolation)

## Reusable Patterns

### Supabase Auth Client Setup (Capacitor)
```typescript
const capacitorStorage = {
  getItem: (key: string) => localStorage.getItem(key),
  setItem: (key: string, value: string) => localStorage.setItem(key, value),
  removeItem: (key: string) => localStorage.removeItem(key),
};

export const supabase = createClient(url, anonKey, {
  auth: {
    storage: capacitorStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: !Capacitor.isNativePlatform(),
    flowType: 'pkce',
  },
});
```

### RLS Policy Pattern
```sql
-- Set default user_id on INSERT (prevents client spoofing)
ALTER TABLE vehicles ALTER COLUMN user_id SET DEFAULT auth.uid();

-- Standard CRUD policies
CREATE POLICY "Users can view own vehicles"
  ON vehicles FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vehicles"
  ON vehicles FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### Auth Feature Flag
```typescript
export const features = {
  auth: Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY),
};
```
