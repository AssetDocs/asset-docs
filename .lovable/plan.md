

# Fix: Magic Link Expired + "Auth session missing!" on Create Password Page

## Root Cause

There are **two compounding issues**:

1. **The magic link expires before the user clicks it.** The `finalize-checkout` function uses `generateLink({ type: "magiclink" })` and sends the raw `action_link` via Resend. Auth logs confirm the OTP expires in ~71 seconds (well before the 1-hour claim in the email). This is likely caused by how Supabase's `generateLink` admin API handles short-lived server-side tokens, or by Supabase's configured OTP expiry being very low.

2. **The `CreatePassword` page has no error handling.** When the expired link redirects to `/welcome/create-password#error=access_denied&error_code=otp_expired...`, the page ignores the error hash, finds no authenticated user, and crashes with "Auth session missing!" when the form is submitted.

## The Fix (Two Parts)

### Part 1: Route the magic link through `/auth/callback` instead of directly to `/welcome/create-password`

**File: `supabase/functions/finalize-checkout/index.ts`**

Change the `redirectTo` in the `generateLink` call from:
```
redirectTo: `${origin}/welcome/create-password`
```
to:
```
redirectTo: `${origin}/auth/callback`
```

The `AuthCallback` page already handles `magiclink` type tokens correctly -- it verifies the OTP via `supabase.auth.verifyOtp()`, establishes the session, checks `password_set`, and routes to `/welcome/create-password` with an active session. This is more reliable than relying on the Supabase client auto-detecting tokens from the URL hash on a page that wasn't designed for it.

### Part 2: Add expired-link error handling to `CreatePassword`

**File: `src/pages/CreatePassword.tsx`**

- On mount, parse the URL hash for `error_code=otp_expired`
- If detected, show a friendly "Your sign-in link has expired" message with:
  - An email input field (pre-filled if available)
  - A "Resend Sign-In Link" button
- The resend button calls `supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin + '/auth/callback' } })` -- this sends a fresh magic link through Supabase's built-in email system with the proper configured expiry
- This gives the user a self-service recovery path instead of a dead-end error

### Part 3: Also handle the error in `SubscriptionSuccess`

**File: `src/pages/SubscriptionSuccess.tsx`**

No changes needed here -- the success page works correctly. The issue is downstream when clicking the email link.

## Files to Change

| File | Change |
|---|---|
| `supabase/functions/finalize-checkout/index.ts` | Change `redirectTo` from `/welcome/create-password` to `/auth/callback` |
| `src/pages/CreatePassword.tsx` | Add URL hash error detection and "Resend Link" fallback UI |

## Why This Works

- Routing through `/auth/callback` uses the existing, battle-tested OTP verification logic that properly establishes a session before redirecting
- The resend fallback uses `signInWithOtp` which goes through Supabase's standard email flow with proper OTP expiry configuration
- Users who encounter an expired link get a clear, actionable path forward instead of a cryptic error
- No backend infrastructure changes needed for the resend -- it's a client-side Supabase auth call

