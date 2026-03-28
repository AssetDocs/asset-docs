

## Fix: Authorized User Redirected to Email Verification After Account Creation

### Problem

After the authorized user fills out the CreatePassword form (name, password, terms), `supabase.auth.updateUser({ password })` disrupts the current session. Even though `refreshSession()` is called afterward, the session state is unreliable — `email_confirmed_at` may still be null in the client-side JWT, and the `ProtectedRoute` redirects to `/welcome` (the email verification gate).

The previous fix (refreshSession + refreshContributor + metadata bypass) is not sufficient because `updateUser()` can trigger internal Supabase auth events that race with the session refresh.

### Root Cause

`updateUser({ password })` causes Supabase to emit auth state change events internally. The refreshed session may still lack `email_confirmed_at` depending on timing. The belt-and-suspenders `user_metadata.invited_as_contributor` check in ProtectedRoute also fails if the JWT hasn't refreshed with the metadata yet.

### The Fix — Re-authenticate After Password Set

The reliable pattern (per Supabase best practices) is: after `updateUser({ password })`, immediately call `signInWithPassword({ email, password })`. This establishes a **fresh, clean session** with all fields populated — no race conditions.

### File Changes

**1. `src/pages/CreatePassword.tsx` — `handleFinish()`**

After `updateUser({ password })` succeeds, add:
```typescript
// Get the user's email before signing in
const email = user?.email;
if (!email) throw new Error('No email found');

// Sign in with the new password to get a clean session
await supabase.auth.signInWithPassword({ email, password });
```

This replaces the `refreshSession()` call. The full sequence becomes:
1. `updateUser({ password })` — sets the password
2. `accept-contributor-invitation` — marks contributor as accepted
3. Update profile (password_set, onboarding_complete, name)
4. `signInWithPassword({ email, password })` — establishes fresh session with `email_confirmed_at` populated
5. `refreshContributor()` — ensures context knows user is a contributor
6. `refreshProfile()` — syncs profile state
7. `navigate('/account')` — clean redirect

**2. No other file changes needed** — the ProtectedRoute bypass and ContributorContext changes from the previous fix remain as defense-in-depth.

### Expected Result

```
User submits CreatePassword form
  → updateUser({ password })            ✓
  → accept-contributor-invitation        ✓
  → profile update                       ✓
  → signInWithPassword(email, password)  ← NEW: clean session with email_confirmed_at
  → refreshContributor()                 ✓
  → refreshProfile()                     ✓
  → navigate('/account')                 ✓
  → ProtectedRoute sees email_confirmed_at + isContributor → allows access
  → NO second email prompt
```

