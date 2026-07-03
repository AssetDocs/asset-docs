# Apply `subscription_email_events.idempotency_key` migration

## Status check (production `leotcbfpqiekgkgumecn`)

- Migration file `supabase/migrations/20260703120000_add_subscription_email_event_idempotency_key.sql` exists in the repo but **has NOT been applied to production**.
- Verified via `information_schema.columns` — `subscription_email_events` currently has only: `id, account_id, user_id, event_type, recipient_email, sent_at, status, resend_message_id, created_at`. No `idempotency_key` column.
- Verified via `pg_indexes` — only `subscription_email_events_pkey` and `uniq_subscription_email_events_dedup` exist. No `uniq_subscription_email_events_idempotency_key`.

## Problem with the existing migration file

The current file uses `ADD COLUMN IF NOT EXISTS` and `CREATE UNIQUE INDEX IF NOT EXISTS` but does NOT set an explicit `search_path` or wrap in a transaction block, and (more importantly per project rules) it does not re-assert GRANTs. The table already exists so no new `CREATE TABLE` GRANT block is required — existing grants on `subscription_email_events` carry over to the new column. RLS/policies on the table are unchanged and unaffected by adding a nullable column.

## Plan

Create and run a new corrected migration that:

1. Adds `idempotency_key text` (nullable) to `public.subscription_email_events` (idempotent).
2. Creates partial unique index `uniq_subscription_email_events_idempotency_key` on `(idempotency_key) WHERE idempotency_key IS NOT NULL` (idempotent).
3. Adds a short `COMMENT ON COLUMN` documenting purpose (dedupe key for `send-payment-receipt-internal`).
4. No table create, so no new GRANTs required. RLS/policies unchanged.

## Verification SQL (run after apply)

```sql
-- 1. Column exists and is nullable text
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema='public'
  AND table_name='subscription_email_events'
  AND column_name='idempotency_key';

-- 2. Partial unique index exists
SELECT indexname, indexdef
FROM pg_indexes
WHERE schemaname='public'
  AND tablename='subscription_email_events'
  AND indexname='uniq_subscription_email_events_idempotency_key';

-- 3. Grants unchanged (sanity)
SELECT grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_schema='public' AND table_name='subscription_email_events'
ORDER BY grantee, privilege_type;

-- 4. RLS still enabled
SELECT relname, relrowsecurity
FROM pg_class WHERE relname='subscription_email_events';

-- 5. Functional dedupe test (should insert one row, second insert should error 23505)
INSERT INTO public.subscription_email_events
  (event_type, recipient_email, sent_at, idempotency_key)
VALUES ('receipt.test','verify@example.com', now(), 'verify-idem-key-001');

INSERT INTO public.subscription_email_events
  (event_type, recipient_email, sent_at, idempotency_key)
VALUES ('receipt.test','verify@example.com', now(), 'verify-idem-key-001');
-- expect: duplicate key value violates unique constraint "uniq_subscription_email_events_idempotency_key"

DELETE FROM public.subscription_email_events WHERE idempotency_key='verify-idem-key-001';
```

## Approval

Approve this plan and I will call the migration tool with the corrected SQL, then hand you the verification queries above.
