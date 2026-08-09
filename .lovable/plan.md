# Turnstile Enforcement: Current State and Remaining Work

## Verified current state

A search of `src/` and `supabase/functions/` found **zero references to Turnstile anywhere in the code**. There is no `Turnstile.tsx` component, no widget in any form, and no `siteverify` call in any Edge Function. The only Turnstile artifacts that exist are:

- `VITE_TURNSTILE_SITE_KEY` in `.env`
- `TURNSTILE_SECRET_KEY` stored as a project secret

So this is not a branch/deploy mismatch — the component and form wiring were never written. Redeploying the current code state would change nothing. Turnstile is enforced only where Supabase Auth enforces it natively (and only once enabled in the dashboard).

## What to build

### 1. Frontend widget component
New `src/components/Turnstile.tsx`:
- Loads the Cloudflare challenge script once (idempotent, no duplicate script tags).
- Renders an invisible/managed widget, reads the site key from `import.meta.env.VITE_TURNSTILE_SITE_KEY`.
- Exposes `onToken(token)` plus a `reset()` handle so the token can be refreshed after a failed submit (tokens are single-use).
- If the site key is absent, renders nothing and reports "unconfigured" so local dev never blocks.

### 2. Wire the public forms
Each form gates submit until a token exists and sends `captchaToken` in the function payload:
- `src/pages/Contact.tsx` → `send-contact-email`
- `src/pages/Feedback.tsx` → `send-feedback-email`
- `src/pages/AccountAssistance.tsx` → `submit-account-assistance`
- `src/components/LeadCaptureModal.tsx` → `submit-lead`

`lead-capture` has no frontend caller in this codebase; it will get server-side verification too, so any external caller must supply a token.

### 3. Server-side verification
New `supabase/functions/_shared/turnstile.ts`:
- `verifyTurnstile(token, ip)` POSTs to `https://challenges.cloudflare.com/turnstile/v0/siteverify` with `TURNSTILE_SECRET_KEY`.
- Returns a clean pass/fail; on failure the caller returns HTTP 400 with a generic "Captcha verification failed" message (no raw provider detail).
- Fails **closed** when the secret is present. If `TURNSTILE_SECRET_KEY` is missing, log a warning and allow through, so a secret rotation gap doesn't take down the contact form.

Then add the check as the first step (after CORS, before existing validation and before any DB write or email send) in: `send-contact-email`, `send-feedback-email`, `submit-account-assistance`, `submit-lead`, `lead-capture`. Existing IP rate limiting stays in place as a second layer.

### 4. Deploy and validate
- Deploy the five Edge Functions.
- Validation: typecheck; call each function with no token and confirm a 400 captcha rejection; call with an invalid token and confirm the same; then submit each form in the preview and confirm a real submission still succeeds end to end.

## Still yours to do in the Supabase dashboard

Auth CAPTCHA for native flows (signup, password reset, magic link) cannot be toggled from code. In Supabase → Authentication → Settings → CAPTCHA, select Turnstile, paste site key `0x4AAAAAAELSA62CLlzmSg_l` and the rotated secret, and enable it. Note that once enabled, the app's own auth calls (`signUp`, `resetPasswordForEmail`, magic link) must pass `options.captchaToken` or they will start failing — say the word and I'll wire the widget into the login/signup/forgot-password screens in the same pass.
