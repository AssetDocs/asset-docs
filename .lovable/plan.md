# Complete Turnstile / Supabase CAPTCHA Rollback

## Confirmed diagnosis

- The active sign-in route is `/auth`, rendered by `AuthLegacy.tsx`; `/login` redirects to it.
- The current source no longer acquires a Turnstile token on `/auth`, and `AuthContext.signIn()` no longer sends `captchaToken` to Supabase.
- The production error shown — `captcha protection: request disallowed (no captcha_token found)` — is returned by Supabase Auth before password validation. This confirms Auth CAPTCHA enforcement is still enabled server-side while the rolled-back frontend intentionally sends no token.
- The current public-form callers and the five affected Edge Functions no longer enforce Turnstile.
- No migration contains Turnstile or CAPTCHA changes, so no database migration rollback is needed.
- The first rollback commit intentionally retained dead Turnstile artifacts. This pass will remove those artifacts to restore the codebase fully to its pre-Turnstile state.

## Rollback sequence

### 1. Disable the remaining server-side enforcement first

In Supabase Dashboard → Authentication → Bot and Abuse Protection, disable CAPTCHA/Turnstile for the project.

Immediately verify on the currently published `/auth` page:

1. Wrong password returns the normal invalid-credentials message, not a CAPTCHA error.
2. Correct credentials create a session and redirect to `/account`.

Do not make another frontend deployment before this check; the production frontend already sends no token and is the correct probe for the dashboard setting.

### 2. Remove every remaining Turnstile artifact

After Auth CAPTCHA is confirmed off:

- Delete the retained `src/components/security/Turnstile.tsx` widget.
- Delete the retained `supabase/functions/_shared/turnstile.ts` verifier.
- Restore the unreachable `src/pages/Login.tsx` to its pre-Turnstile implementation so no alternate/dead auth page contains CAPTCHA behavior.
- Remove the optional ignored `captchaToken` parameters and rollback comments from the `AuthContext` interface and `signIn`/`signUp` implementations.
- Remove `VITE_TURNSTILE_SITE_KEY` from the frontend environment file.
- Confirm there are no remaining source references to Turnstile, `captchaToken`, `turnstileToken`, Siteverify, or bot-check response codes.

The unused Supabase secret `TURNSTILE_SECRET_KEY` may remain stored because it cannot enforce anything without code or Auth CAPTCHA configuration. Cloudflare hostname configuration can also remain; neither affects the app after this rollback.

### 3. Preserve unrelated work

Use targeted reversal of Turnstile-only changes introduced by the Turnstile commits rather than reverting whole commits. Preserve all later changes to gifts, Authorized Users, redirects, deleted-account handling, validation, rate limiting, email delivery, MFA/step-up, billing, RLS, and UI.

No migrations, tables, policies, Auth email settings, or AU invitation logic will be changed.

### 4. Validate and publish

- Run a full Turnstile/CAPTCHA reference audit.
- Run the project typecheck/build validation.
- Publish only the frontend cleanup.
- Redeploy the five public-form functions only if their deployed revisions differ from the already rolled-back source:
  - `send-contact-email`
  - `send-feedback-email`
  - `submit-account-assistance`
  - `submit-lead`
  - `lead-capture`

## Focused regression suite

| Flow | Expected post-rollback result |
|---|---|
| `/auth` wrong password | Normal invalid-credentials response; no CAPTCHA text |
| `/auth` valid password | Session created; redirect to `/account` |
| Signup | Request accepted and confirmation email sent without CAPTCHA |
| Forgot/reset password | Reset email sent and password reset completes |
| AU invitation acceptance | Runs without CAPTCHA dependency; any remaining `email_mismatch`/invite failure is reported separately |
| Subscription checkout signup | Account creation proceeds to Stripe checkout |
| Account deletion re-auth | Password re-auth works; existing step-up controls remain |
| Contact form | Edge Function accepts the original payload and completes email delivery |

Stop after reporting this matrix. Do not repair unrelated defects found during regression testing.