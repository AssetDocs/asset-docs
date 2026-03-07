
## Root Cause Identified

The problem is **not** in `CreatePassword.tsx` — `handleFinish` already calls `navigate('/account', { replace: true })` at line 169. The redirect fires correctly. But it gets **immediately bounced back** to `/welcome/create-password` by `ProtectedRoute` in `App.tsx`.

Here's the exact sequence:

1. User clicks "Go to Dashboard" → `handleFinish` runs
2. `supabase.auth.updateUser({ password })` is called → this fires a `USER_UPDATED` event in `AuthContext`
3. `AuthContext.onAuthStateChange` handles `USER_UPDATED` → it calls `setProfileLoading(true)` **inside a `setTimeout(..., 0)`** (line 89 of AuthContext) — meaning it's deferred to the next tick
4. `handleFinish` also does `supabase.from('profiles').update({ onboarding_complete: true })` — a DB write
5. `navigate('/account', { replace: true })` fires immediately after the DB write succeeds
6. `ProtectedRoute` mounts and evaluates the profile from `AuthContext` — but the profile in context is **stale** (the setTimeout hasn't run yet, so `onboarding_complete` is still `false` in memory)
7. **Line 239 of App.tsx fires**: `if (profile && profile.password_set === true && profile.onboarding_complete === false)` → `return <Navigate to="/onboarding" replace />`
8. User is bounced back

When the user switches tabs and returns, the browser re-checks the session, `onAuthStateChange` re-fires, the profile re-fetches from DB with the updated values, and the redirect works correctly.

## The Fix

Two targeted changes:

### 1. `src/contexts/AuthContext.tsx` — Remove the `setTimeout` wrapper

The `setTimeout(..., 0)` deferral is the core of the timing problem. It means `profileLoading` is never `true` at the moment `ProtectedRoute` first evaluates. Setting `profileLoading = true` synchronously before starting the async fetch means the guard in `ProtectedRoute` will wait for the real profile data instead of reading stale context.

**Change**: Remove `setTimeout` wrapper around the profile fetch block. Set `setProfileLoading(true)` synchronously, then `await` the async operations directly inside the `onAuthStateChange` handler.

```ts
// BEFORE (broken):
setProfileLoading(true);
setTimeout(async () => {
  // ... fetch profile
  setProfileLoading(false);
}, 0);

// AFTER (fixed):
setProfileLoading(true);
try {
  // ... fetch profile (same code, no setTimeout)
} finally {
  setProfileLoading(false);
}
```

### 2. `src/App.tsx` — Gate `ProtectedRoute` on `profileLoading`

Currently `ProtectedRoute` only checks `loading` before evaluating the profile guards (line 221). `profileLoading` is exposed on `AuthContext` but never used in `ProtectedRoute`. This means the route evaluates with stale profile data while the fetch is in-flight.

**Change**: Add `profileLoading` to the `ProtectedRoute` check so it shows a spinner while the profile is being fetched after auth state changes.

```ts
// BEFORE:
const { isAuthenticated, loading, user, profile } = useAuth();
// ...
if (loading || checkingSubscription) { return <spinner /> }

// AFTER:
const { isAuthenticated, loading, profileLoading, user, profile } = useAuth();
// ...
if (loading || profileLoading || checkingSubscription) { return <spinner /> }
```

### Why this works

With both changes:
- When `USER_UPDATED` fires after `handleFinish`, `profileLoading` immediately becomes `true`
- `ProtectedRoute` sees `profileLoading = true` → shows spinner, does NOT evaluate the stale profile guards
- The profile fetch completes, `profileLoading` becomes `false`, profile now has `onboarding_complete: true`
- `ProtectedRoute` re-evaluates → all guards pass → renders `/account` dashboard

### Files to change

| File | Change |
|---|---|
| `src/contexts/AuthContext.tsx` | Remove `setTimeout` wrapper; make profile fetch synchronous within the handler |
| `src/App.tsx` | Add `profileLoading` to the `ProtectedRoute` loading guard |
