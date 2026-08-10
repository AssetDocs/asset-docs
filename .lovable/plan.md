# Phase A Staging Regression Gate

No code changes. This plan defines how the regression pass gets executed and reported, and flags two blockers that decide who runs which test.

## Blockers to resolve before the pass

1. **Headless browsers cannot clear the live widget.** Earlier live checks on `getassetsafe.com/contact` ended in `turnstile_timeout` because the managed challenge flags headless Chromium. That is correct fail-closed behavior, but it means any flow that must produce a real Turnstile token cannot be driven automatically against the current widget configuration.
2. **Cloudflare test credentials need a staging widget, not the production one.** Using the official always-pass / always-fail / already-spent test keys requires swapping the site key the staging build loads (`VITE_TURNSTILE_SITE_KEY`) and the secret the Edge Functions read (`TURNSTILE_SECRET_KEY`). That is an environment change on a deployed target, so it is a deliberate step, not something folded into the test run.

Given those, the pass splits into two tracks.

## Track 1 — automated, with Cloudflare test keys on staging

Prerequisite: staging/preview is configured with Cloudflare's test site key (always-pass) and matching test secret. Then headless runs can complete real submissions and the following are scripted:

- Normal `/auth` sign-in.
- Normal sign-in: wrong password, then correct password, asserting a second `getToken()` call and a fresh token on the retry request.
- Signup.
- Forgot-password request.
- Create Password magic-link resend.
- Welcome signup-verification resend.
- Email Verification resend.
- Subscription-checkout signup.
- Contact form end-to-end, asserting the Edge Function returns success (real siteverify path against the test secret).
- Always-fail secret: Contact form returns the friendly `bot_check_failed` message, HTTP 403, and no email is sent.
- Already-spent secret: Contact form returns `bot_check_expired` and the widget resets.

## Track 2 — manual on staging (state-changing or challenge-dependent)

Run by you in a real browser on the staging host:

- Contributor/invited sign-in succeeds.
- Contributor sign-in with CAPTCHA acquisition forced to fail (block `challenges.cloudflare.com`): friendly retry message shown, and **no** Supabase Auth request in the network tab.
- Password reset completes and lands correctly; if automatic post-reset sign-in fails, user arrives at `/auth` with the contextual message and the underlying reason appears in the safe diagnostic log, not on screen.
- Delete Account re-auth: correct password with CAPTCHA succeeds; wrong password → retry → fresh token → correct password succeeds. Uses a dedicated throwaway test account.
- DevInviteAccept succeeds where expected; forced auto-sign-in failure falls back to `/auth` cleanly.

## Reporting

Single table: flow, test performed, expected result, actual result, pass/fail, safe diagnostic. Any failure that needs more than a narrow Phase A/Turnstile fix stops the pass and gets reported instead of fixed. No dead-code cleanup, no rate limiting, no gift hardening.

## Decision needed

Whether to point staging at Cloudflare's test keys (unlocks Track 1 automation) or keep the production widget on staging (then all 14 flows become manual Track 2 work).
