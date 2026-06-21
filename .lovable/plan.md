## Goal

Apply the locked Retention/Deletion Policy Matrix to the database and the `delete-account` edge function, then run a seeded smoke test that proves each retain/anonymize/purge rule fires correctly.

## Locked policy decisions (from this turn)

- Tombstone `deleted_accounts` gains `email_hash` (sha256 lower-email).
- `audit_logs` / `continuity_audit_logs`: **retain `user_id` forever**.
- `account_closure_requests` / `account_deletion_requests`: anonymize, purge after **7 years**.
- `legal_agreement_signatures`: **keep plaintext email** after deletion.

## Step 1 — Migration (single file, awaiting your approval)

Schema changes:

1. `deleted_accounts`
   - Add `email_hash text` (nullable), index `(email_hash)`.
   - Keep existing `email`, `original_user_id`, `deleted_by`, `deleted_at`.
2. Add `deleted_account_id uuid references public.deleted_accounts(id) on delete set null` to every **anonymize** table:
   - `payment_events`, `subscribers`, `user_activity_logs`, `checkout_fulfillments`, `checkout_session_audit`, `subscription_cancellations`, `account_closure_requests`, `account_deletion_requests`, `gift_subscriptions`.
3. Make `user_id` / `email` / `owner_user_id` columns **nullable** on those same tables where they are currently `NOT NULL` (required so anonymization can null them). Specifically: `account_closure_requests.owner_user_id`, `account_deletion_requests.account_owner_id` + `requester_user_id`, `subscribers.user_id`, `subscribers.email`.
4. Helper SQL function `public.anonymize_user_data(p_user_id uuid, p_email text, p_deleted_by text) returns uuid` (SECURITY DEFINER, runs in a single transaction):
   - Inserts the `deleted_accounts` tombstone with `email_hash = encode(digest(lower(p_email),'sha256'),'hex')`.
   - For each anonymize table: `UPDATE … SET user_id = NULL, email = NULL, deleted_account_id = <tombstone>` scoped to that user (with the split logic for `gift_subscriptions` purchaser vs recipient vs redeemer).
   - `DELETE FROM entitlements WHERE user_id = p_user_id`.
   - Leaves `audit_logs`, `continuity_audit_logs`, `stripe_events`, `legal_agreement_signatures`, `user_consents` untouched.
   - Returns the new `deleted_accounts.id`.
   - Requires `pgcrypto` (already enabled in this project; verified).
5. GRANT execute on the function to `service_role` only.

## Step 2 — Rewrite `delete-account` edge function

Today the function hard-deletes from `payment_events`, `subscribers`, `audit_logs`, `gift_subscriptions`, `account_deletion_requests`, etc. — that violates the locked matrix.

New flow (after the existing auth + step-up + admin-deletion guards, unchanged):

1. Fetch the user's email from `auth.admin.getUserById`.
2. Call `supabaseAdmin.rpc('anonymize_user_data', { p_user_id, p_email, p_deleted_by })`. Capture returned tombstone id.
3. Purge the **user-content** tables only (the existing `tablesWithUserId` array minus the retain/anonymize ones): keep `properties`, `items`, `property_files`, `damage_reports`, `insurance_policies`, `legacy_locker*`, `vip_contacts*`, `contacts`, `profiles`, `user_roles`, `notification_preferences`, `account_verification`, `paint_codes`, `financial_accounts`, `source_websites`, `*_folders`, `trust_information`, `password_catalog`, `storage_usage`, `events`, `receipts`, `voice_note_attachments`, `recovery_requests`.
4. **Remove** `payment_events`, `subscribers`, `audit_logs`, `gift_subscriptions`, `entitlements`, `account_deletion_requests` from the purge loop (RPC handles them).
5. Cancel Stripe subscriptions (unchanged).
6. `auth.admin.deleteUser(targetAccountId)` (unchanged).

## Step 3 — Deploy + smoke test

After you approve the migration:

1. Auto-deploy `delete-account`.
2. Run `supabase/functions/delete-account/index.test.ts` (new) — Deno test that:
   - Creates a throwaway auth user via the admin API.
   - Seeds one row into each of: `payment_events`, `subscribers`, `user_activity_logs`, `checkout_fulfillments`, `subscription_cancellations`, `gift_subscriptions` (as purchaser AND as recipient, separate rows), `account_deletion_requests`, `entitlements`, `audit_logs`, `legal_agreement_signatures`.
   - Calls `anonymize_user_data` RPC directly (no JWT/MFA gates needed for the smoke).
   - Asserts:
     - Tombstone row exists with non-null `email_hash`.
     - All anonymize tables: row still exists, `user_id`/`email` are NULL, `deleted_account_id` matches tombstone.
     - `gift_subscriptions` purchaser row: purchaser fields nulled, recipient fields intact; recipient row inverse.
     - `entitlements`: row gone.
     - `audit_logs`, `legal_agreement_signatures`: row unchanged (user_id + email still present).
3. Report pass/fail row-by-row.

## Out of scope for this PR

- Sweeper cron jobs that enforce the 7-year / 2-year purge windows (next ticket).
- Storage orphan reconciliation and export TTL — your stated next two steps after this one.
- Privacy Policy copy update — flagged but separate doc PR.

## Technical notes

- Migration uses one transaction; if any `ALTER` fails the whole thing rolls back.
- The RPC is the only place that knows the matrix — the edge function becomes a thin orchestrator, which is what we want for auditability.
- Smoke test runs against the dev Supabase project; it never touches production.
