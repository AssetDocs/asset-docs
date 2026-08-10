# Turnstile / CAPTCHA Rollback Plan (audit-first)

Phase A regression testing is paused. The AU invitation `email_mismatch` failure is **not** touched by this plan.

Objective: restore the exact pre-Turnstile user behavior. Nothing else changes. All Turnstile code stays in Git history and can be reinstated later.

## Critical sequencing (must be respected)

Supabase Auth CAPTCHA is currently **enabled** in the dashboard. Auth enforcement is server-side, so if the frontend stops sending `captchaToken` while enforcement is still on, every sign-in/signup/reset immediately fails with `captcha protection: request disallowed`.

Order of operations:

1. **First (yours, in the dashboard):** Supabase → Authentication → Bot and Abuse Protection → disable CAPTCHA.
2. **Prove the toggle took effect on the currently deployed frontend**, before any code ships:
   - `/auth` with correct credentials → signs in normally
   - `/auth` with wrong credentials → ordinary "invalid login credentials" behavior, with **no** CAPTCHA-related error text
   Only proceed once both are observed. A visually flipped toggle is not proof.
3. **Then:** deploy the frontend rollback below.
4. **Then:** redeploy the five affected Edge Functions without Siteverify enforcement.
5. **Then:** run the seven-flow regression set and stop.

This ordering means there is no window where Auth is broken.

## Audit: everything introduced specifically for Turnstile

### Database migrations

**None.** `supabase/migrations/` contains zero references to `turnstile` or `captcha`. Nothing to revert, nothing to report. No database work in this rollback.

### Files left in place (made unused, deleted later)

Per your safeguard, the rollback commit does **not** delete anything. These become dead but stay on disk so the rollback is trivially reversible:

- `src/components/security/Turnstile.tsx` — widget component, `TurnstileHandle`, `getTurnstileUserMessage`, Cloudflare script loader
- `supabase/functions/_shared/turnstile.ts` — `verifyTurnstileToken`, `turnstileErrorResponse`, `getClientIp`
- `src/pages/Login.tsx` — unreachable (live `/login` redirects to `/auth`); **left untouched** unless its Turnstile imports break build/typecheck. If they do, the import and plumbing are removed there too and it is called out in the report.

Physical deletion of these three, plus the unused env/secret references, is deferred to a separate cleanup commit after production stability is confirmed.

### Frontend: remove import, ref, token acquisition, reset/error branch, and `<Turnstile />` mount

Auth-path files (also drop the `captchaToken` argument at the call site):

| File | What comes out |
|---|---|
| `src/pages/AuthLegacy.tsx` | both refs (`turnstileRef`, `contributorTurnstileRef`), both widget mounts, token acquisition for password sign-in and contributor sign-in, Turnstile error branches |
| `src/pages/SignupLegacy.tsx` | ref, mount, token before `signUp`, `turnstile_` error branch |
| `src/pages/ForgotPassword.tsx` | ref, mount, tokens on reset-email and magic-link paths |
| `src/pages/CreatePassword.tsx` | ref, mount, token on magic-link resend |
| `src/pages/Welcome.tsx` | ref, mount, token on signup-confirmation resend |
| `src/pages/EmailVerification.tsx` | ref, mount, token on verification resend |
| `src/pages/SubscriptionCheckout.tsx` | ref, mount, token on checkout signup |
| `src/components/account/DeleteAccountDialog.tsx` | ref, mount, token on password re-auth (step-up remains the control, unchanged) |
| `src/pages/Login.tsx` | **no change** — unreachable dead route, left as-is unless it breaks typecheck |

`src/contexts/AuthContext.tsx`:
- `signIn(email, password, captchaToken?)` → drop the third parameter and `options: { captchaToken }`
- `signUp(..., captchaToken?)` → drop the parameter and the `captchaToken` field passed to `supabase.auth.signUp`
- update the matching signatures on the context type

Custom-form files (drop `turnstileToken` from the request body):
- `src/pages/Contact.tsx`
- `src/pages/Feedback.tsx`
- `src/pages/AccountAssistance.tsx`
- `src/components/LeadCaptureModal.tsx`

Each of these keeps its existing validation, rate limiting, toasts, and success/error handling; only the Turnstile acquisition/reset/error branch and the widget are removed.

### Edge Functions: remove server-side Siteverify enforcement

Remove the `_shared/turnstile.ts` import and the two-line verify/short-circuit at the top of each handler, then redeploy:

- `supabase/functions/send-contact-email/index.ts`
- `supabase/functions/send-feedback-email/index.ts`
- `supabase/functions/submit-account-assistance/index.ts`
- `supabase/functions/submit-lead/index.ts` (also drop `turnstileToken?` from its request interface)
- `supabase/functions/lead-capture/index.ts`

Everything else in these functions is preserved: Zod schemas, HTML escaping, per-IP in-memory rate limits, submission cataloging, Resend delivery, error IDs.

### Environment / config dependencies

- `.env`: `VITE_TURNSTILE_SITE_KEY` becomes unused. Recommend leaving the line in place (harmless, and it makes reinstatement trivial) — the code no longer reads it.
- Supabase secret `TURNSTILE_SECRET_KEY`: becomes unused. **Do not delete.** Keeping it costs nothing and avoids re-provisioning later.
- Cloudflare Turnstile widget + hostname allowlist: leave as-is. No action.
- Supabase dashboard: CAPTCHA protection turned **off** (step 1 above). This is the only configuration change.

### Explicitly not touched

Auth flows themselves, RLS, MFA/step-up, backup codes, Authorized User invite creation/acceptance/RPCs, gift flows, billing/Stripe, account deletion logic beyond the removed widget, input validation, per-IP and `rate-limit-check` rate limiting, and the `20260808000100` column-guard triggers all remain exactly as they are. No dead-code cleanup, no rate-limit redesign, no gift hardening, no refactors.

## Post-rollback regression set

Run after the dashboard toggle and the deploy:

1. Password sign-in on `/auth` — success and wrong-password paths
2. Signup on `/signup` — confirmation email sent
3. Forgot password — reset email sent; reset link completes and signs in
4. AU invitation acceptance — open the pending invite for the invited address, membership created, redirect to `/account` (the separate `email_mismatch` UX issue remains open and unaddressed)
5. Subscription checkout signup — reaches Stripe checkout
6. Account deletion re-auth — password re-auth succeeds, step-up still enforced
7. Contact form — submits, Edge Function returns 200, email delivered

Any failure that is not caused by a leftover Turnstile reference gets reported, not patched, in this pass.
