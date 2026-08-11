# Fix: Invite error messaging in Authorized Users

The backend is behaving correctly — a duplicate pending invite returns 409. The defect is that the frontend collapses every non-2xx response into one generic red toast, so the owner sees "we couldn't send the invitation" instead of "this one is already pending, use Resend."

Scope: frontend error handling only, in `src/components/AuthorizedUsersTab.tsx`.

## What changes

1. **Read the Edge Function error body safely.** When `supabase.functions.invoke('send-invite')` returns an error, inspect it as a `FunctionsHttpError` and read `err.context.status` plus the JSON body (wrapped in try/catch — a body that isn't JSON must not throw).

2. **Map only known statuses to safe copy:**
   - `409` → "An invitation is already pending for this email. Use Resend under Pending Invitations if you'd like to send it again."
   - `403` → surface the `error` string returned by `send-invite` (owner / eligibility message), falling back to the generic message if absent.
   - `429` → "Too many invitation attempts. Please wait a moment and try again."
   - anything else (5xx, network, no status, unparseable body) → keep the existing generic "We couldn't send the invitation. Please try again in a moment."

   No arbitrary backend string is displayed outside the 403 case; unknown errors always become the generic message. Raw errors keep going to `console.error` only.

3. **409 presentation.** Show it as guidance rather than a failure: inline message plus a non-destructive toast titled "Invitation already pending" so the row already visible under Pending Invitations reads as the next action.

4. **Pre-flight duplicate check (optional enhancement, included).** Before invoking the function, compare the trimmed lowercase email against the already-loaded `pendingInvites`. On match, show the same 409 guidance immediately and skip the call. The server-side 409 stays as the real enforcement.

## Not touched

`send-invite`, the unique partial index, owner/eligibility RPCs, rate limiting, token hashing, delivery-status tracking, and the Resend flow all stay exactly as they are.

## Verification

- New valid invite → sends and appears in Pending Invitations.
- Duplicate pending invite → 409 guidance (and the pre-flight path) shows the Resend instruction.
- Resend on that pending invite → still works.
- Non-owner attempt → the safe 403 message from the function.
- Rate-limited attempt → friendly 429 message.
- Forced unexpected failure → generic fallback retained.
- Typecheck clean.
