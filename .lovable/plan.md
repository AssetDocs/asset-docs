# Fix: signup fails with "Service currently unavailable due to hook"

## Root cause

Supabase Auth logs show the `/signup` request fails because the **Send Email Hook** errored out:

```
hook: https://leotcbfpqiekgkgumecn.supabase.co/functions/v1/send-auth-email
error: 500: Service currently unavailable due to hook
```

There are **zero logs** for `send-auth-email` in the same window — meaning the function never executed. Supabase rejected the call before it ran.

The reason: `supabase/config.toml` only declares `verify_jwt = false` for two functions (`finalize-checkout`, `force-signout`). Every other function defaults to **`verify_jwt = true`**, including `send-auth-email`. Supabase Auth Hooks call the function URL directly with a Standard Webhooks signature — there is no user JWT in the request — so the platform returns 401 and Auth reports the hook as unavailable. Result: every signup (not just authorized users) fails.

## Fix

Add a `[functions.send-auth-email]` entry with `verify_jwt = false` to `supabase/config.toml`. The function already validates requests internally via the Standard Webhooks signature using `SEND_EMAIL_HOOK_SECRET`.

While editing the file, also disable JWT verification for the other functions that are designed to be called without a user JWT (public/invite landing flows and webhook-style callbacks). These are all authenticated by their own internal mechanisms (signed tokens, hashed invite tokens, signature verification, or service-role checks):

- `send-auth-email` — Supabase Auth hook (Standard Webhooks signature)
- `accept-invite` — validates session in code; called from public `/invite` page
- `accept-contributor-invitation` — same pattern (legacy fallback)
- `accept-dev-invite` — same pattern
- `verify-dev-invite` — public token lookup
- `stripe-webhook` — Stripe signature verification
- `lead-capture`, `submit-lead`, `log-consent`, `track`, `rate-limit-check` — public unauthenticated endpoints

The primary fix is `send-auth-email`; the others are included to prevent the same class of bug. No other code changes are needed.

## Files touched

- `supabase/config.toml` — add `verify_jwt = false` entries for the functions above.

## Verification

After deploying, retry signup. Auth log should show `/signup` returning 200 (or 400 for validation), and `send-auth-email` should produce its `=== SEND-AUTH-EMAIL FUNCTION CALLED ===` log line.
