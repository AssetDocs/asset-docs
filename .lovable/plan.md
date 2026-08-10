# Turnstile / Supabase CAPTCHA Audit — Findings and Fix Plan

Audit of the current synced source (`src/`, `supabase/functions/`). Everything below was verified by reading the files, not inferred.

## What is correct today

- `src/components/security/Turnstile.tsx` — explicit render, `execute` mode, 30s timeout, friendly message mapper, cleanup on unmount.
- `supabase/functions/_shared/turnstile.ts` — siteverify with `remoteip`, fails closed on missing secret (503), distinguishes expired vs failed, never leaks provider detail.
- Server verification runs **before** parsing/DB work in all five functions: `send-contact-email`, `send-feedback-email`, `submit-account-assistance`, `submit-lead`, `lead-capture`.
- Client token wiring present on: Contact, Feedback, Account Assistance, Lead Capture modal, `/signup` (SignupLegacy), Forgot Password (both send paths), Subscription Checkout signup, `/auth` password sign-in.

## Gaps found

### 1. Two Turnstile widgets share one ref on `/auth` (real bug)
`AuthLegacy.tsx` declares a single `turnstileRef` (line 46) but renders `<Turnstile ref={turnstileRef} />` twice — line 479 (contributor/invited form) and line 632 (sign-in form). React assigns whichever mounts last, so the ref can point at the wrong widget when the page toggles `isContributorMode`. Fix: one ref per widget instance.

### 2. Contributor sign-in swallows captcha failures
Line 330: `getToken().catch(() => undefined)` then calls `signIn` regardless. That produces a raw Supabase "captcha protection: request disallowed" error instead of the friendly message used everywhere else. Fix: match the `onSignIn` pattern — abort with `getTurnstileUserMessage` and reset the widget.

### 3. Auth calls with no `captchaToken` — will be rejected while Auth CAPTCHA is enabled
These hit Supabase Auth directly and have no widget:
- `src/pages/Welcome.tsx:123` — `auth.resend({ type: 'signup' })`
- `src/pages/EmailVerification.tsx:19` — `auth.resend({ type: 'signup' })`
- `src/pages/CreatePassword.tsx:81` — `auth.signInWithOtp` (resend magic link)
- `src/pages/CreatePassword.tsx:148` — post-reset `signInWithPassword`
- `src/pages/DevInviteAccept.tsx:90` — `signInWithPassword`
- `src/components/account/DeleteAccountDialog.tsx:75` — re-auth `signInWithPassword`

Deletion re-auth and the post-reset auto sign-in are the highest impact: one blocks account deletion, the other can strand a user right after setting a password. Fix: add a widget + token to each, or route the two internal ones through an already-authenticated path that doesn't need a fresh password sign-in.

### 4. Dead file: `src/pages/Login.tsx`
Fully Turnstile-wired but unreachable — `/login` redirects to `/auth`. It's the file the earlier fix landed in. Keeping it invites the same mistake again. Fix: delete it (or route it and retire `AuthLegacy`) — pick one.

### 5. Dead protected function: `lead-capture`
No client in `src/` invokes it; only `submit-lead` is called (`LeadCaptureModal.tsx:84`). Both write leads. Fix: confirm whether an external caller exists; if not, delete `lead-capture` so there aren't two lead paths to keep in sync.

### 6. Unprotected public endpoints (`verify_jwt = false`, no captcha)
Reachable anonymously with no bot check and no per-IP limit visible: `validate-lifetime-code`, `validate-gift-signup-email`, `start-gift-email-verification`, `verify-gift-email-code`, `redeem-gift`, `submit-deletion-request`, `submit-recovery-request`, `log-consent`, `track`, `resend-magic-link`.

The gift ones are the concern — `validate-lifetime-code` and `verify-gift-email-code` are guessable-code oracles that can be brute-forced. Recommend adding Turnstile to `validate-lifetime-code`, `start-gift-email-verification`, `verify-gift-email-code`, and `redeem-gift` (client surface is `GiftClaim.tsx` / `Welcome.tsx`, both already form-based). `log-consent` and `track` are high-volume telemetry — leave them on rate limiting instead.

### 7. Inconsistent rate limiting
`send-contact-email` and `send-feedback-email` do in-memory per-IP limiting (5/hr, per warm instance only). `submit-lead`, `submit-account-assistance`, and `lead-capture` have none. Fix: standardize on the existing `rate-limit-check` function or a shared helper rather than per-instance maps.

## Proposed fix order

1. Items 1–2 (`AuthLegacy.tsx`) — actual bugs on the live sign-in page.
2. Item 3 — the six missing `captchaToken` sites, deletion re-auth and CreatePassword first.
3. Item 4/5 cleanup — delete the dead login page and dead lead function.
4. Item 6 — Turnstile on the four gift/code endpoints.
5. Item 7 — shared rate limiting.

Then: typecheck, curl each touched function with missing and bogus tokens, and a manual browser pass on sign-in + one custom form on `getassetsafe.com`.

## Note

Items 6 and 7 are hardening beyond the original Turnstile scope. Say if you want them cut and I'll limit the work to 1–5.
