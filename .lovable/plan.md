
## Root Cause (Final Diagnosis)

After reading the full code and live DB state, there are **two separate problems**:

### Problem A — Session stuck / can't force sign-out
The Supabase client instance holds the session **in memory** even after localStorage is cleared. `supabase.auth.signOut({ scope: 'local' })` only clears local storage — it does NOT reset the JS client's in-memory auth state if it throws silently. The auth logs show a recent `token_revoked` event, meaning the session token has been revoked server-side but the client still has the old token in memory and keeps using it until the page is hard-refreshed.

**Force sign-out options for user `e71b4d2e`:**
1. **Supabase Dashboard** → Auth → Users → find `support@assetsafe.net` → "Send password reset" to invalidate all tokens (nuclear but works)
2. **Admin edge function** → Call `supabase.auth.admin.signOut(userId, 'global')` which revokes ALL sessions for that user server-side (most reliable)
3. **Browser localStorage clear** → Open DevTools → Application → Local Storage → clear everything under `sb-*` keys then hard reload

### Problem B — `profileLoading` deadlock after sign-in
The `onAuthStateChange` callback `await`s `supabase.from('profiles').select(...)` while the Supabase auth client lock is still held. This is a known deadlock pattern — the profiles query goes through the same Supabase JS client which may be waiting for the auth lock to release. Result: `profileLoading` stays `true` forever, the spinner never clears, and the dashboard is never shown.

The fix is to defer the profile fetch out of the `onAuthStateChange` synchronous path using `setTimeout(..., 0)` or moving it to a separate `useEffect` that watches `user`.

### Problem C — Admin bypass for ProtectedRoute
The admin user (`entitlement_source: 'admin'`, `plan: 'premium'`, `status: 'active'`) should return `subscribed: true` from `check-subscription` — and it does. But the admin account should **never** be blocked by the subscription gate at all. The cleanest solution is to check the admin role early in `ProtectedRoute` and short-circuit the subscription check entirely.

---

## Implementation Plan

### 1. Create `force-signout` edge function
A server-side function callable by the admin that calls `supabase.auth.admin.signOut(userId, 'global')`. This immediately revokes all tokens for a user across all devices.

```text
POST /force-signout
Body: { userId: "e71b4d2e-..." }
Auth: requires admin JWT
```

This gives you a permanent tool to force sign-out any user from the admin workspace.

### 2. Fix profileLoading deadlock in `AuthContext.tsx`
Move the `profiles` query out of `onAuthStateChange` into a dedicated `useEffect` that watches `user`:

```text
onAuthStateChange:
  - setUser(session?.user ?? null)   ← synchronous only
  - setLoading(false)                ← no awaits at all

Separate useEffect([user]):
  - if user: setProfileLoading(true) → fetch profile → setProfileLoading(false)
```

This eliminates the auth-lock deadlock entirely.

### 3. Short-circuit ProtectedRoute for admin role
Add an admin check via `useAdminRole()` inside `ProtectedRoute`. If the user has `hasDevAccess`, skip the subscription check entirely and grant access immediately:

```text
ProtectedRoute:
  if (adminRole.hasDevAccess) → skip checkSubscription, grant access
  else → run existing subscription check
```

### 4. Add "Force Sign-Out" button to AdminShell
In the Owner workspace, add a utility to call the `force-signout` edge function for any user ID. This gives you a management tool going forward.

---

## Files to Change

| File | Change |
|---|---|
| `src/contexts/AuthContext.tsx` | Split profile fetch into separate `useEffect([user])` to unblock auth lock |
| `src/App.tsx` | Add `useAdminRole()` to `ProtectedRoute`; short-circuit subscription check for admin users |
| `supabase/functions/force-signout/index.ts` | New edge function — calls `auth.admin.signOut(userId, 'global')` |
| `src/components/admin/AdminShell.tsx` | Add "Force Sign-Out User" utility button in owner workspace header |

### Immediate manual workaround (while plan is reviewed)
To force sign-out right now without code changes: open the **Supabase Dashboard → Auth → Users** page, find `support@assetsafe.net`, and click **"Send magic link"** or use the SQL editor to run:
```sql
DELETE FROM auth.sessions WHERE user_id = 'e71b4d2e-60d7-45f4-91e6-1480e65fb0f9';
```
This revokes all active sessions immediately.
