
## Problem Analysis

The `passwordJustSet` fix in `CreatePassword.tsx` is logically correct but has a critical gap: it depends on `profileLoading` becoming `false` after the `USER_UPDATED` event fires. Looking at `AuthContext.tsx` closely:

```ts
// Line 88-89 in AuthContext.tsx
setProfileLoading(true);
setTimeout(async () => {
  // fetches profile...
  // sets profileLoading(false) in finally
}, 0);
```

The `setTimeout(..., 0)` is **deferred**. But `setLoading(false)` fires **synchronously** at line 158 (outside the setTimeout). This means the sequence is:

1. `USER_UPDATED` fires → `setProfileLoading(true)` queued in timeout → `setLoading(false)` fires immediately
2. `CreatePassword`'s `useEffect` fires with `passwordJustSet=true`, `loading=false`, `profileLoading=false` (still false, timeout hasn't run yet)
3. But `profile?.password_set` is still the **old stale value** (false) → navigate condition never triggers
4. Eventually setTimeout runs, profile re-fetches, `profile.password_set` = true → but `passwordJustSet` condition now works... **or does it?**

Actually there's an even deeper problem: `USER_UPDATED` triggers the `setTimeout` but inside AuthContext at line 102, there's also `accept-contributor-invitation` being called which adds latency. And the profile DB write in `handleSubmit` (line 97-100 of CreatePassword) may not be committed before the `USER_UPDATED` event fires the re-fetch in the timeout.

**The real root issue**: `supabase.auth.updateUser({ password })` fires `USER_UPDATED` which triggers a profile re-fetch — but the profile re-fetch reads `password_set` from DB, which was just set moments earlier in the same function. There's a tiny window where the DB write hasn't replicated yet when the re-fetch runs.

## The User's Suggestion is Actually the Right Answer

The user is asking: **should we consolidate everything into one page?** — yes, this is the clean architectural fix.

Instead of the `create-password → /onboarding` two-page flow with its fragile inter-page navigation dependency, we consolidate into **a single "Welcome & Setup" page** at `/welcome/create-password` that handles all onboarding steps in sequence:

- Step 1: Set password (password + confirm)
- Step 2: Your name (first + last)
- Step 3: Phone (optional)
- Step 4: Add first property (optional)

**All on one page, in-memory state, single final DB write at the end.** No inter-page navigation until everything is done. This eliminates the race condition entirely because we never navigate mid-flow — we only navigate once at the very end when all data has been saved.

## Plan

### What changes

**1. Consolidate `CreatePassword.tsx` into a 4-step setup wizard**

Replace the current single-purpose password form with a full setup wizard. Steps:
- Step 0: "Secure your account" — password + confirm (same UI as now)
- Step 1: "What's your name?" — first + last name (pre-filled from profile metadata)
- Step 2: "Phone number (optional)"
- Step 3: "Add your first property (optional)" — address with Google Places

The wizard only calls Supabase **once at the very end**:
1. `supabase.auth.updateUser({ password })` — sets the password
2. `supabase.from('profiles').update({ password_set: true, first_name, last_name, onboarding_complete: true })`
3. If address provided: `supabase.from('properties').insert(...)`
4. Then `navigate('/account', { replace: true })` — direct, no guard dependency

**2. Retire `Onboarding.tsx`**

The `/onboarding` route will redirect to `/account` for anyone who has `onboarding_complete: true`, or to `/welcome/create-password` for anyone who doesn't. The separate onboarding page is no longer needed as an active destination for new users.

**3. Simplify `AuthCallback.tsx`** 

The hash session flow (lines 57-63) already routes to `/welcome/create-password` for `!password_set` users. No change needed there — it lands users on the new consolidated wizard correctly.

**4. Keep `Onboarding.tsx` as a stub redirect**

Leave the route in `App.tsx` but redirect straight to `/account` (or `/welcome/create-password` depending on state). This prevents broken links for any users mid-flow.

### Files to change

| File | Change |
|---|---|
| `src/pages/CreatePassword.tsx` | Replace with 4-step all-in-one setup wizard |
| `src/pages/Onboarding.tsx` | Convert to redirect stub (no longer an active onboarding destination) |

### Why this definitively fixes the problem

- No inter-page navigation mid-flow = no race condition
- Profile is only written once (final step) = no partial state
- `navigate('/account')` fires after confirmed DB writes = no stale data issue
- Single page = simpler mental model, fewer moving parts, no `passwordJustSet` flag needed

### Visual flow after fix

```text
Magic link → /auth/callback → /welcome/create-password

[Step 1: Password]  →  [Step 2: Name]  →  [Step 3: Phone]  →  [Step 4: Property]
                                                                       ↓
                                                              Single DB write
                                                                       ↓
                                                              navigate('/account')
```
