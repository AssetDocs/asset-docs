# Phase A Staging Regression Gate — Approved Decision

Decision: run Track 1 with Cloudflare's official dummy Turnstile credentials (no new real widget), staging/preview only, then run Track 2 manually in a real browser. Production keys and configuration stay untouched. No code changes to accommodate headless testing; the production Managed widget challenging automated browsers is expected and correct.

## One constraint that shapes execution

The frontend side is clean: `VITE_TURNSTILE_SITE_KEY` is a build-time Vite value, so the sandbox dev host can load the dummy always-pass sitekey without affecting the published build or production.

The server side is not cleanly separable. This project uses an external Supabase instance with a single `TURNSTILE_SECRET_KEY` secret shared by the deployed Edge Functions. Overwriting it with the dummy always-pass secret would apply to production traffic too, and the dummy always-fail secret would break every live public form for the duration of the test. So the Contact-form siteverify matrix runs as a direct request-level test against Cloudflare's siteverify endpoint plus the deployed function, using dummy tokens, rather than by repointing the shared secret:

- Dummy token + current production secret → expect `bot_check_failed` (403) from the deployed function. Confirms fail-closed and the friendly message.
- Dummy token + dummy always-pass secret, called against Cloudflare siteverify directly → expect `success: true`. Confirms the token format and the verification contract the shared helper relies on.
- Dummy already-spent secret → expect `timeout-or-duplicate`, which the helper maps to `bot_check_expired`.

The shared production `TURNSTILE_SECRET_KEY` is not altered for testing under any circumstance. No maintenance-window secret swap. The genuine token → deployed Edge Function → production Siteverify path is proven later by the controlled real-browser staging and production smoke tests, not by automation.

Backlog note (not Phase A work): the absence of an isolated backend staging environment — separate Edge Functions and secrets — is what forces this split. Worth fixing for future Stripe, Resend, auth, gift, and security testing.

## Track 1 — automated (dummy sitekey on the sandbox dev host)

Playwright, headless, against `http://localhost:8080` with the dummy always-pass sitekey injected:

- Normal `/auth` sign-in.
- Sign-in retry: wrong password → correct password. Asserts the retry calls `getToken()` again, performs the expected widget reset/re-execution, and sends a newly acquired token rather than one cached in application state. Does **not** assert that dummy token strings differ — Cloudflare's testing sitekey returns a fixed dummy token, so string uniqueness is not a valid signal.
- Signup.
- Forgot-password request.
- Create Password magic-link resend.
- Welcome signup-verification resend.
- Email Verification resend.
- Subscription-checkout signup.
- **Contact client/server enforcement + Siteverify contract test** (not a successful deployed end-to-end Siteverify test): the form submit reaches the Edge Function carrying a token, the function enforces verification, and the Siteverify contract is exercised via the matrix above.
- Dummy always-fail sitekey: each of the above surfaces the friendly security-check message and makes no Supabase Auth call.

Test accounts: dedicated throwaway addresses, created and reused within the run, never real customer records.

## Track 2 — manual, real browser on staging

Flows automation cannot safely represent:

- Contributor/invited sign-in succeeds.
- Contributor sign-in with `challenges.cloudflare.com` blocked: friendly retry message, and no Supabase Auth request in the network tab.
- Password reset completes and lands correctly; forced post-reset auto-sign-in failure lands on `/auth` with the contextual message, underlying reason in the safe diagnostic log only.
- Delete Account re-auth: correct password succeeds with CAPTCHA; wrong password → retry → fresh token → correct password succeeds. Dedicated test account.
- DevInviteAccept succeeds where expected; forced auto-sign-in failure falls back to `/auth` cleanly.

## Reporting

One consolidated table: flow, test performed, expected result, actual result, pass/fail, safe diagnostic. Stop after the report. Any failure needing more than a narrow Phase A/Turnstile fix is reported, not fixed. No dead-code cleanup, no centralized rate limiting, no gift hardening. Limited production smoke test only after the full staging gate passes.
