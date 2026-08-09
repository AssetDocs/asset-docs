# Review: Codex column-guard migration vs. the planned security fix

Both approaches target the same two findings (`contributors_self_role_escalation`, `gift_subscriptions_claim_field_tampering`) with the same correct pattern: keep the existing UPDATE policies, add `BEFORE UPDATE` trigger guards that freeze every non-action column for user-initiated updates.

## Where Codex is better than the Lovable plan

- **Column coverage.** The Lovable draft froze only a subset of `gift_subscriptions` columns (plan, amount, expiry, status, Stripe ids). Codex freezes all 66 columns except the claim/redeem action columns, and adds `term`, `currency`, `claimed_*`, verification, reminder, and anonymization fields. Verified against the live column list — no gaps.
- **Service-role detection.** The Lovable draft used `auth.uid() IS NULL` as a proxy for "internal write", which is weak. Codex's `public.is_service_role() OR current_setting('role', true) = 'service_role'` is the correct, repo-consistent check.
- **Contributors semantics.** Codex additionally pins the status transition to `pending -> accepted|declined`, auto-stamps `accepted_at`, and rejects `accepted_at` on decline. The draft did not handle `accepted_at`.

## Discrepancies that need action

1. **Blocking issue: internal DB-side writers are not exempt.** `is_service_role()` reads the JWT role, and `current_setting('role')` is not `service_role` for pg_cron / direct-DB execution. These existing `SECURITY DEFINER` functions write `gift_subscriptions` with no JWT present and would now fail with `42501`:
   `expire_gift_entitlements`, `claim_due_gift_expiration_notices`, `cleanup_abandoned_gift_checkouts`, `anonymize_user_data`, `process_deleted_account_retention`.
   Fix: extend the service bypass in the gift guard (and the contributors guard, which `anonymize_user_data`/retention also touch) to include the repo's existing `public.is_trusted_db_writer()` helper, so `session_user IN ('postgres','supabase_auth_admin')` with no HTTP JWT is treated as internal.

2. **Admin bypass removed.** The Lovable plan exempted `has_app_role(auth.uid(),'admin')`. Codex does not. This is acceptable and stricter — admins hold only SELECT policies on both tables and all admin write paths (`backfill-gift-session`, refund/dispute review, contributor tooling) go through edge functions using the service role. No change needed; noting it as an intentional divergence.

3. **Contributors owner check uses `OLD.account_owner_id` only.** Effectively equivalent, since the contributor branch freezes `account_owner_id`. No change needed.

4. **Delivery mechanism.** The uploaded file must be applied through the database migration tool rather than dropped into `supabase/migrations/` by hand, so it is recorded and executed the same way as the rest of the history.

5. **Your separate observation is correct.** Pre-existing `gift_subscriptions` service-role UPDATE policies that reference `OLD`/`NEW` are invalid as policy expressions and belong in triggers. Out of scope for these two findings; worth a follow-up cleanup pass.

## Verified compatibility (no change required)

- `claim_gift_subscription` (the RPC the UI actually calls) sets only `redeemed`, `redeemed_at`, `redeemed_by_user_id`, `recipient_user_id`, `updated_at` and leaves `status = 'paid'` — passes the guard unchanged.
- Existing `BEFORE UPDATE` triggers on both tables are `update_*_updated_at` and `audit_*`; trigger name ordering puts the new guards first, and `updated_at` is not frozen, so no conflict.

## Proposed implementation

1. Apply the uploaded migration via the migration tool, with one amendment: both guard functions compute
   `v_is_service := public.is_service_role() OR current_setting('role', true) = 'service_role' OR public.is_trusted_db_writer()`.
2. Re-check the two guards against the live column lists after apply (no unfrozen non-action columns).
3. Mark only `contributors_self_role_escalation` and `gift_subscriptions_claim_field_tampering` as fixed; leave every other finding untouched.
