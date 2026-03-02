
# Fix: "Invalid Callback Parameters" — Magic Link Hash Fragment Not Being Handled

## Root Cause (Precise)

When `finalize-checkout` calls `supabase.auth.admin.generateLink({ type: "magiclink" })`, it gets back a **Supabase-hosted verification URL** (e.g. `https://leotcbfpqiekgkgumecn.supabase.co/auth/v1/verify?token=...&redirect_to=.../auth/callback`).

When the user clicks the "Sign In to Asset Safe" button, Supabase's auth server verifies the token server-side and performs a **browser redirect** to:

```
https://getassetsafe.com/auth/callback#access_token=eyJ...&refresh_token=...&type=magiclink
```

The session arrives as a **URL hash fragment** (`#`), not as query parameters (`?`).

`AuthCallback.tsx` currently only reads `searchParams` (query params). It finds no `token_hash` and no `type` query param, immediately throws `'Invalid callback parameters'`, and redirects the user to `/auth` — which shows the "Authentication Error" toast.

The Supabase JS client is built to auto-detect and process hash fragments automatically, but only when it initialises and `onAuthStateChange` fires. `AuthCallback` bypasses this entirely.

## The Two Callback Flows in This App

```text
Flow A — generateLink (from finalize-checkout email):
  Supabase server verifies OTP → redirects to /auth/callback#access_token=...&type=magiclink
  Session is SET by Supabase client auto-parsing the hash
  AuthCallback just needs to WAIT for onAuthStateChange, then route

Flow B — Custom OTP emails (signup verification, etc.):
  Redirects to /auth/callback?token_hash=...&type=signup
  AuthCallback manually calls verifyOtp() — this is working correctly
```

Currently `AuthCallback` only handles Flow B and crashes on Flow A.

## The Fix — Two Changes

### Change 1: `src/pages/AuthCallback.tsx`

Add a **second detection path** for the hash fragment flow:

- On mount, check `window.location.hash` for `access_token`
- If found, do NOT call `verifyOtp` (the client has already processed the hash and the session is established or being established)
- Instead, listen for the session via `supabase.auth.getSession()` (it should already be set since Supabase processes the hash synchronously on import)
- Then apply the same routing logic: if `password_set` is false → `/welcome/create-password`, if `onboarding_complete` is false → `/onboarding`, else → `/account`
- Keep the existing `token_hash` query param flow (Flow B) untouched

The updated logic structure:

```typescript
useEffect(() => {
  const hash = window.location.hash;
  const hasHashSession = hash.includes('access_token=');

  if (hasHashSession) {
    // Flow A: session already set by Supabase client from hash fragment
    // Clear hash from URL immediately
    window.history.replaceState(null, '', window.location.pathname);
    handleHashSessionFlow();
  } else {
    // Flow B: token_hash query param — existing logic unchanged
    handleAuthCallback();
  }
}, []);
```

`handleHashSessionFlow` calls `supabase.auth.getSession()`, then checks `password_set` / `onboarding_complete` and routes accordingly — identical to the existing magiclink routing inside `handleAuthCallback`.

### Change 2: `src/pages/CreatePassword.tsx` (minor)

No changes needed here — the expired link recovery added in the previous session is already correct and handles the edge case of the link expiring.

## Files to Change

| File | Change |
|---|---|
| `src/pages/AuthCallback.tsx` | Add hash fragment (`#access_token`) detection branch; route based on profile state without calling verifyOtp |

## Why This Is Safe

- Flow B (query param `token_hash`) is completely untouched
- The Supabase client automatically parses `#access_token=...` on page load and sets the session — we just need to read it, not re-verify it
- Clearing the hash from the URL immediately after processing prevents tokens leaking in browser history
- The routing logic (`password_set` → create-password, `onboarding_complete` → onboarding, else → account) is identical to the working magiclink branch already in the file
