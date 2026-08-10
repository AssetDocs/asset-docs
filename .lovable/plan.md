# Fix: Authorized User invite acceptance error

## What actually happened

Confirmed from the live database and Edge Function logs:

- An invite was created today at 13:13:43 UTC for `michaeljlewis2@gmail.com` (account `dbf24c5f…`, role Full Access). It is still `status = pending` — acceptance never completed.
- One minute later, `accept-invite` logged: `RPC error: { code: "P0001", message: "email_mismatch" }`.
- The signed-in session at that moment belonged to `support@assetsafe.net` (the owner), per the `check-subscription` / `accept-contributor-invitation` logs from the same seconds.

So the backend behaved correctly: `accept_invite_atomic` refuses to attach an invite to a user whose email differs from the invited address. The invite link was opened in a browser already signed in as a different user.

Two real defects remain:

1. **The user sees a raw platform error.** `accept-invite` returns a friendly, mapped message ("This invitation was sent to a different email address…") with a 403 status. But `supabase.functions.invoke` throws a `FunctionsHttpError` on any non-2xx, and `src/pages/InviteLanding.tsx` does `if (error) throw error`, discarding the JSON body. The user only sees "Edge Function returned a non-2xx status code". Every mapped error (expired, already used, account unavailable, rate limited) is currently hidden the same way.

2. **No identity guard before accepting.** The page auto-accepts using whatever session exists. If the wrong account is signed in, the only outcome is a failure — with no explanation, no indication of which email the invite was for, and no way to switch accounts.

## Changes

### 1. Surface the real message (`src/pages/InviteLanding.tsx`)

When `invoke` returns an error, read the response body before falling back:

- Use `error.context` (a `Response`) when present, parse JSON, and use its `error` field as the message.
- Keep the existing generic fallback if the body can't be read.
- Log the raw error to the console for diagnostics; show only the friendly message in the UI.

### 2. Pre-flight identity check

Add a lightweight lookup so the page can compare the invited email against the signed-in email *before* calling `accept-invite`:

- Reuse the existing invite-preview path if one exists; otherwise add a `verify-invite` style read that returns only `{ email_masked, role, status }` for a token hash — no membership mutation, no PII beyond a masked address.
- If the signed-in email doesn't match, skip the accept call and show a dedicated state:
  - "This invitation was sent to a different email address."
  - Shows the masked invited address and the currently signed-in address.
  - Buttons: **Sign out and continue** (signs out, returns to `/invite?token=…` so they can sign in or create the correct account) and **Go to dashboard**.

If adding a preview endpoint is undesirable, the same UX can be driven purely off the 403 `email_mismatch` response from `accept-invite` — the mismatch state renders after the failed call instead of before it. This is the smaller change and is the fallback if you prefer no new endpoint.

### 3. Distinct copy for the other mapped failures

Map the returned messages to their own presentation in the error state (expired → offer "request a new invite" text; already used → suggest signing in and going to the dashboard). No new backend logic; only wording and available buttons.

## Out of scope

- No change to `accept_invite_atomic`. The email check is a correct security control and stays as-is.
- No change to invite creation, token hashing, expiry, or rate limits.
- The existing pending invite for `michaeljlewis2@gmail.com` stays valid until 2026-08-17 and will accept normally once opened while signed in as that address.

## Verification

- Open the invite link while signed in as the owner: expect the mismatch state with both addresses and a sign-out action, not a platform error string.
- Open the same link while signed in as the invited address: expect success, membership row created, redirect to `/account`.
- Force an expired/canceled token: expect the specific mapped message, not "non-2xx status code".
