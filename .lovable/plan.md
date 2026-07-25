Apply migration `supabase/migrations/20260724230000_guard_gift_subscriber_upsert.sql`.

## What it does
Replaces `public.redeem_gift(text, text, text, uuid)` so the final `INSERT ... ON CONFLICT (email)` on `public.subscribers` no longer hijacks a row that belongs to a different user. New guard:

- On email conflict, only update when `subscribers.user_id IS NULL` or already equals the redeemer.
- Preserves the existing `user_id` via `COALESCE(public.subscribers.user_id, EXCLUDED.user_id)`.
- All other redemption logic (accounts, memberships, entitlements, profiles, gift_email_verifications consumption) is unchanged.
- Re-applies `REVOKE ... FROM PUBLIC, anon, authenticated` and `GRANT EXECUTE ... TO service_role`, then `NOTIFY pgrst, 'reload schema'`.

## Steps
1. Run the migration SQL as authored in the file.
2. No code, edge function, or frontend changes required — signature is unchanged.

Switch to build mode to apply.