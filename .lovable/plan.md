# Phase A — Repair Live Auth CAPTCHA Gaps (Items 1–3 only)

Scope is limited to what is breaking live authentication right now. Items 4–7 from the audit are deferred and recorded at the bottom as separate future passes. Smallest possible changes; full Auth regression test before anything else is touched.

## A1. Give each Turnstile widget its own ref (`src/pages/AuthLegacy.tsx`)

One `turnstileRef` (line 46) is passed to two rendered widgets — line 479 (contributor/invited form) and line 632 (sign-in form). Change: add a second ref (`signInTurnstileRef`, `contributorTurnstileRef`), point each `<Turnstile>` and each `getToken()` call at its own instance. No behavior change beyond correct targeting.

## A2. Stop contributor sign-in when CAPTCHA acquisition fails (`src/pages/AuthLegacy.tsx`)

Line 330 currently does `getToken().catch(() => undefined)` and calls `signIn` regardless, surfacing a raw Supabase captcha error. Change: wrap in try/catch, abort before `signIn`, show `getTurnstileUserMessage(err)`, reset the widget — identical to the `onSignIn` path.

## A3. Audit each remaining Auth call individually

Six call sites hit Supabase Auth with no `captchaToken`. Each is handled on its own merits, not by blanket-adding a widget.

| Call site | Call | Decision |
| --- | --- | --- |
| `src/pages/CreatePassword.tsx:148` | post-reset `signInWithPassword` | Internal transition, no user-facing form. Prefer **not** to plumb a widget: attempt sign-in, and if Supabase rejects for captcha, fall through to the existing sign-in page with a clear message instead of stranding the user. Confirm whether automatic re-login is still the wanted UX before adding plumbing. |
| `src/pages/CreatePassword.tsx:81` | `signInWithOtp` (resend magic link) | User-initiated form with an email input → add a widget + token. |
| `src/components/account/DeleteAccountDialog.tsx:75` | re-auth `signInWithPassword` | Security purpose here is **step-up auth, not bot protection**. First check whether the existing step-up/MFA mechanism (`useMfaStepUp` / `mfa-step-up`) can replace the raw password re-auth. If the password call stays, supply a token only because Supabase requires it — documented as a compatibility shim, not a new control. |
| `src/pages/Welcome.tsx:123` | `auth.resend({type:'signup'})` | User-clicked resend on a public-ish page → add a widget + token. |
| `src/pages/EmailVerification.tsx:19` | `auth.resend({type:'signup'})` | Same → add a widget + token. |
| `src/pages/DevInviteAccept.tsx:90` | `signInWithPassword` after invite activation | Internal transition on an already token-verified page. Same treatment as CreatePassword:148 — graceful fallback preferred over new plumbing. |

Every added token follows the existing pattern exactly: `getToken()` → on failure abort with `getTurnstileUserMessage`, reset widget, never call Auth without a token.

## B. Auth regression test, then stop

After A1–A3 and before any other work:

- Typecheck (`tsconfig.app.json`).
- Manual browser pass on the live host: sign-in, sign-up, forgot password → reset → post-reset landing, magic-link resend, signup-verification resend, contributor/invited sign-in, subscription-checkout signup, account-deletion re-auth.
- One custom public form (Contact) end to end to confirm nothing regressed.
- Report results here. **No cleanup or additional security scope until those results are reviewed.**

## Deferred — not in this pass

- **C. Dead-code cleanup (audit items 4–5).** No deletion yet. Produce proof of no callers for `src/pages/Login.tsx` (router, lazy imports, tests, old redirect paths, email links, docs, magic-link/recovery callbacks) and for the `lead-capture` function (frontend, cron/scheduled jobs, external forms, webhooks/Zapier, marketing integrations, historical clients). Removal happens in its own commit.
- **D. Centralized durable rate limiting (audit item 7).** Its own project. Current per-instance in-memory limits in `send-contact-email` / `send-feedback-email` are not durable across Edge Function instances and should not be treated as sufficient. Inventory every public and email-triggering endpoint, then pick one shared mechanism.
- **E. Phase 2 Gift Abuse Protection Audit (audit item 6).** Gift flow stays out of Phase 1. For `validate-lifetime-code`, `start-gift-email-verification`, `verify-gift-email-code`, `redeem-gift`, evaluate in this order: attempt limits, per-gift / per-email / per-IP throttling, expiration, one-time-use, lockout/cooldown, generic failure messages. Turnstile only where it demonstrably adds value — not on every redemption because the endpoint is public.
