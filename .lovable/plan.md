
## Root Cause: What Happens After `CreatePassword` Submits

### Exact failure chain

1. User arrives via invite link → `/auth/callback` → routed to `/welcome/create-password` ✓  
2. User fills name/password/terms on `CreatePassword.tsx` → clicks "Go to Dashboard"  
3. `handleFinish()` calls `supabase.auth.updateUser({ password })` — this succeeds  
4. **`updateUser()` triggers a `USER_UPDATED` event in Supabase**, which causes Supabase to internally issue a new session/refresh. The Supabase client fires `SIGNED_IN` again with the refreshed token.  
5. `AuthContext.tsx` line 97 catches this `SIGNED_IN` event → sets `lastSignedInTokenRef.current` to the new token  
6. `refreshProfile()` runs → profile now has `password_set: true`, `onboarding_complete: true` — so `navigate('/account')` fires from `CreatePassword`  
7. **BUT** — `ProtectedRoute` in `App.tsx` also re-evaluates. Because `USER_UPDATED` causes `loading` to briefly reset and the new `SIGNED_IN` runs the `check-subscription` side-effect, `ProtectedRoute` re-runs `checkingSubscription`. The contributor check (`isContributor`) depends on `ContributorContext`.  
8. **The real problem**: `supabase.auth.updateUser({ password })` causes Supabase to send a **`USER_UPDATED` / email change confirmation flow** which, for invited users who were created via `generate_link` fallback (not native invite), Supabase internally fires its auth hook again with `email_action_type = "signup"` or `"email_change"` — this is what generates the second auth email prompt.

### Why the `/auth?mode=contributor` screen appears

After `updateUser()`, the `SIGNED_IN` event fires. `AuthContext` receives a fresh token. `App.tsx` `ProtectedRoute` re-evaluates with `checkingSubscription = true`. During the re-evaluation window, `isContributor` comes from `ContributorContext` which hasn't yet fetched the newly `accepted` contributor row (since `accept-contributor-invitation` is called in `CreatePassword` but the contributor context hasn't refetched). With `isContributor = false` and `!hasSubscription`, `ProtectedRoute` redirects to `/pricing` — but `user.email_confirmed_at` may still be null in the client-side JWT because the JWT hasn't been refreshed with the new `email_confirmed_at` value yet.

The `fallbackLink` in `invite-contributor/index.ts` (line 107) is:
```
https://www.getassetsafe.com/auth?mode=contributor&email=...
```
This fallback URL is embedded in the email that was sent. The user is **not** landing there via redirect — they are landing there because `ProtectedRoute` sees `!user.email_confirmed_at && !isContributor` and redirects to `/welcome` (line 318 of App.tsx), and the `/welcome` page or the auth guard eventually routes to `/auth?mode=contributor`.

The real trigger: **`isContributor` is `false` at the moment `ProtectedRoute` checks it**, because `ContributorContext` hasn't refreshed after `accept-contributor-invitation` was just called.

---

## The Fix — 3 targeted changes

### Change 1 — `src/pages/CreatePassword.tsx`

After `accept-contributor-invitation` succeeds and before `navigate('/account')`, call `refreshProfile()` AND force-refresh the Supabase session (so `email_confirmed_at` is populated in the JWT). Then navigate.

**Also**: add a small session-refresh call so the new JWT has the `email_confirmed_at` set:
```typescript
// After updateUser + accept-contributor-invitation:
await supabase.auth.refreshSession(); // ensures email_confirmed_at is in new JWT
await refreshProfile();
navigate('/account', { replace: true });
```

The `refreshSession()` is the key fix — it fetches a fresh JWT from Supabase that includes `email_confirmed_at` (which Supabase sets on all invite-flow users at creation). Without it, `user.email_confirmed_at` is null in the stale JWT, and `ProtectedRoute` line 317 blocks access.

### Change 2 — `src/contexts/ContributorContext.tsx`

Expose a `refreshContributor()` function. Call it from `CreatePassword` after `accept-contributor-invitation` succeeds. This ensures `isContributor = true` before the navigate fires and `ProtectedRoute` re-evaluates.

### Change 3 — `src/App.tsx` — ProtectedRoute email gate

The current check on line 317:
```typescript
if (!skipSubscriptionCheck && user && !user.email_confirmed_at && !isContributor)
```
This is correct in theory but **timing-dependent**. Add a grace: if `user.user_metadata?.invited_as_contributor === true`, also treat as bypassed (same as `isContributor`). This is a belt-and-suspenders fix for the JWT-refresh race:
```typescript
const isInvitedContributor = !!user?.user_metadata?.invited_as_contributor;
if (!skipSubscriptionCheck && user && !user.email_confirmed_at && !isContributor && !isInvitedContributor)
```

---

## Files to Change

| File | Change |
|------|--------|
| `src/pages/CreatePassword.tsx` | Add `supabase.auth.refreshSession()` before `refreshProfile()` + navigate |
| `src/contexts/ContributorContext.tsx` | Expose `refreshContributor()` and call it from CreatePassword after invite acceptance |
| `src/App.tsx` | Add `isInvitedContributor` metadata check to email gate in ProtectedRoute |

---

## Expected Result After Fix

```
User submits CreatePassword form
  → updateUser({ password })       [Supabase marks invite lifecycle complete]
  → accept-contributor-invitation  [contributors row → accepted]
  → refreshSession()               [new JWT has email_confirmed_at populated]
  → refreshContributor()           [ContributorContext: isContributor = true]
  → refreshProfile()               [profile: password_set=true, onboarding_complete=true]
  → navigate('/account')
  → ProtectedRoute:
      isContributor = true          ✓ (skips email gate + subscription gate)
      profile.password_set = true   ✓ (skips create-password redirect)
      → renders /account            ✓
  → NO second email prompt
  → NO redirect to /auth
```

No terms/checkbox changes needed — `CreatePassword.tsx` already has the terms checkbox implemented (lines 306-323).
