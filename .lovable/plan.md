## Problem

After an Authorized User completes the signup form at `/signup?mode=invite&...`, they get bounced back to `/invite?token=...` and see the "Create Account / Sign In" card again instead of being accepted into the account and routed to `/account`.

## Root Cause

A race condition between Supabase's auth hydration and React Router navigation:

1. `SignupLegacy.tsx` calls `signUp()` → `confirm-invite-email` → `signIn()` → `navigate(redirectParam)`.
2. `signIn()` resolves before `AuthContext`'s `onAuthStateChange` SIGNED_IN event finishes propagating user/session into React state.
3. `InviteLanding.tsx` mounts, reads `authLoading=false` and `user=null`, and falls through to `setStatus('ready')` — re-showing the signup/login card.
4. By the time the session does land, the component has already rendered the wrong state and never retries.

The `accept-invite` edge function and downstream gating (profile flags, ProtectedRoute member bypass) are already correct — the bug is purely the client-side hydration race.

## Fix

### 1. `src/pages/InviteLanding.tsx` — eliminate the race

- Replace the single `useEffect` check with a short polling window that calls `supabase.auth.getSession()` directly (up to ~5s, every 500ms) before falling back to the "ready" state.
- If a session shows up during the poll, call `accept-invite` immediately using that session's `access_token` rather than waiting for `isAuthenticated` to flip in context.
- Keep current behavior when the user truly is unauthenticated (no session after polling) → show signup/login card as today.

### 2. `src/pages/SignupLegacy.tsx` — make the invite handoff deterministic

- After `confirm-invite-email` + `signIn`, await `supabase.auth.getSession()` and confirm a session exists before navigating.
- If a session is present, navigate to `/invite?token=...` with `replace: true` and pass the `accessToken` via `navigate(..., { state: { accessToken } })` so `InviteLanding` can use it on first render with zero wait.
- If `signIn` fails (rare), still navigate to the invite landing — the polling loop will recover.

### 3. `InviteLanding.tsx` — consume the optional `location.state.accessToken`

- If present, skip polling entirely and call `accept-invite` immediately with that token.

## Files Changed

- `src/pages/InviteLanding.tsx` — add session polling + optional `location.state.accessToken` fast-path.
- `src/pages/SignupLegacy.tsx` — pass session token via navigation state after invite signup.

No changes to edge functions, DB, or routing config.

## Expected Result

AU clicks email link → fills signup form → lands on `/invite` briefly (spinner, "Accepting invitation…") → `/account` dashboard. The "Create Account / Sign In" card is never re-shown after a successful signup.