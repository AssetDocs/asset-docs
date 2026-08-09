# Land the Turnstile Diff via GitHub, Then Validate

## Confirmed state of this project's source

Re-checked just now: `src/components/security/` does not exist, `supabase/functions/_shared/` contains no `turnstile.ts`, and a case-insensitive search for "turnstile" across `src/` and `supabase/` returns zero hits. The only Turnstile artifacts here are `VITE_TURNSTILE_SITE_KEY` in `.env` and the `TURNSTILE_SECRET_KEY` project secret.

So this is a source-sync gap, exactly as you described. Your local diff is the authoritative version; nothing should be rewritten here.

## Urgent sequencing note

Turnstile is already enabled in Supabase Auth > CAPTCHA, but the deployed frontend has no `captchaToken` wiring. That means native signup, password reset, and magic-link calls are being rejected by Supabase right now. Two options:

- **Preferred:** push the diff and deploy immediately, closing the window in minutes.
- **If the push will take a while:** temporarily disable Auth CAPTCHA in the dashboard, then re-enable it right after the frontend deploy lands.

## Steps

1. **You push from Codex.** Commit the Turnstile changes and push to the connected repo's default branch. Lovable's two-way GitHub sync pulls them into this project automatically.
2. **I confirm the sync.** Re-run the searches and verify the expected files are present: `src/components/security/Turnstile.tsx`, `supabase/functions/_shared/turnstile.ts`, `captchaToken` in the auth call sites, and `siteverify` in the five public functions.
3. **I deploy the Edge Functions** from the synced state: `send-contact-email`, `send-feedback-email`, `submit-account-assistance`, `submit-lead`, `lead-capture`.
4. **You publish the frontend** so the widget and `captchaToken` wiring go live.
5. **I run staging validation** (below).

Your two deviations from my earlier draft are accepted as-is and I will not change them: the helper reads `TURNSTILE_SECRET_KEY`, and it **fails closed** when the secret is missing. Fail-closed is the right call now that the secret is configured — I'll note in validation that a future secret rotation gap would hard-fail these forms, which is the intended tradeoff.

## Validation I'll run after the deploy

- Typecheck against `tsconfig.app.json`.
- Curl each of the five functions with no `captchaToken` and confirm a clean 400-class rejection with a generic message (no raw provider or Postgres detail leaking — `lead-capture` was the previous offender).
- Curl with a bogus token and confirm the same rejection path.
- Browser pass in the preview: submit Contact, Feedback, Account Assistance, and the Lead Capture modal with the real widget and confirm each succeeds end to end (row written, email sent).
- Browser pass on the auth flows now that Auth CAPTCHA is live: signup, forgot password, and magic link each complete without a captcha error.
- Security scan for any new critical findings.

## Notes

I cannot read your Codex workspace, so I will not write, package, or reconstruct any of the Turnstile code. If a file arrives partially synced or a conflict appears during sync, I'll report exactly what's missing rather than filling the gap myself.
