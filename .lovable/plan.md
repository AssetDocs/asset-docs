# Fix + harden: Support Access Reviews logging

## Audit result (confirmed)

- `src/components/admin/AdminUsers.tsx` → `logSupportAccessReview()` inserts into `support_access_reviews`.
- A schema query confirms there is **no** `support_access_reviews` table in `public`. Every insert fails, which is the alert. Not an RLS or validation issue.
- The Support Access tab read in `loadData()` ignores its error, so the tab shows an empty state instead of the real failure.
- Columns the UI expects: `id, admin_user_id, target_user_id, target_email, target_account_number, reason, access_scope, status, expires_at, completed_at, created_at`.
- **Status vocabulary correction:** the UI treats `'logged'` as the open state (`review.status === 'logged'` gates the Complete button and the badge). So the allowed values are `'logged'` and `'completed'` — not `'active'`.

## Migration: `public.support_access_reviews` as an audit-log table

Structure:
- `id uuid pk default gen_random_uuid()`
- `admin_user_id uuid not null`, `target_user_id uuid not null`
- `target_email text`, `target_account_number text`
- `reason text not null` with `CHECK (char_length(btrim(reason)) >= 10)` (mirrors the client rule)
- `access_scope text not null default 'read_only_support_context'` with `CHECK (access_scope IN ('read_only_support_context'))` — single supported value today, extensible later
- `status text not null default 'logged'` with `CHECK (status IN ('logged','completed'))`
- `expires_at timestamptz not null default now() + interval '24 hours'`
- `completed_at timestamptz`, `created_at timestamptz not null default now()`
- index on `created_at desc`; index on `target_user_id`

Foreign keys — recommendation: **no FKs to `auth.users`.** The project already has both patterns (`audit_logs.user_id` and `account_export_audit.user_id` reference `auth.users`, while the newer forensic table `content_audit_events` deliberately has none so evidence survives account deletion). Support-access evidence is exactly the case where the record must outlive a deleted account, so it follows the `content_audit_events` precedent. If you prefer referential integrity instead, the alternative is `REFERENCES auth.users(id) ON DELETE SET NULL` on both columns — but that silently erases who was reviewed, so it is not recommended.

Grants + RLS, in the required order (create → grant → enable RLS → policies):
- `GRANT SELECT, INSERT, UPDATE ON public.support_access_reviews TO authenticated;` and `GRANT ALL ... TO service_role;` — no `anon` grant, no `DELETE` grant.
- Policies scoped to the existing admin authority only, via `public.has_owner_workspace_access()`:
  - SELECT: admin/owner workspace.
  - INSERT: admin/owner workspace **and** `admin_user_id = auth.uid()` (an operator cannot log under someone else's name).
  - UPDATE: admin/owner workspace (needed to mark complete).
  - **No DELETE policy** and no delete grant.

Immutability guard (`BEFORE UPDATE ... FOR EACH ROW`):
- Reject the update unless the only changed columns are `status` and `completed_at`. `admin_user_id`, `target_user_id`, `target_email`, `target_account_number`, `reason`, `access_scope`, `expires_at`, `created_at`, and `id` are permanently frozen.
- Allow only the `logged -> completed` transition. `completed -> logged` (reopening) and `completed -> completed` re-writes are rejected.
- When status becomes `completed`, set `completed_at = now()` if the caller did not supply it; `completed_at` cannot be cleared or changed afterward.
- Service role is held to the same transition rules — this is evidence, not operational state.

## `expires_at` semantics — decide explicitly

Today nothing expires anything: the column would be a timestamp the table renders in an "Expires" column, and no code or job reads it. That is a misleading UI if left as is. Two options:

- **Option A (recommended, simplest):** treat `expires_at` as the declared review window and make the UI honest — label it "Review window ends" and render an "Expired" indicator when `expires_at < now()` and status is still `logged`. No status mutation, no cron. The record stays a pure log of a declared window.
- **Option B:** add a real mechanism — a scheduled sweep that transitions stale `logged` rows to `completed` (or a third `expired` status, which would mean widening the status CHECK and the UI badge/gate). This adds a cron job and a service-role transition path to maintain.

I will implement Option A unless you choose B, since the record is a log rather than an access grant — nothing is actually unlocked that expiry would need to revoke.

## Canonical record vs. duplication into `audit_logs`

Recommendation: **`support_access_reviews` is the canonical forensic record for this event; do not duplicate the row.** It carries fields (`reason`, `target_account_number`, `access_scope`, review window, completion) that `audit_logs`' generic shape would flatten into `metadata`, and duplication creates two sources that can diverge. What I will add instead is a single cross-reference entry in `audit_logs` (action `support_access_review_logged`, resource type `support_access_reviews`, resource id = the review id, no reason text copied) so an operator scanning the central admin audit trail sees that the event happened and where the detail lives. That keeps one authoritative copy plus discoverability. Say the word if you'd rather have no `audit_logs` entry at all.

## Frontend changes (narrow)

- `console.error` the full backend error object (for diagnostics), but keep the visible `window.alert` generic — no Postgres/RLS text in the UI.
- Check and log the error on the Support Access read in `loadData()` so a backend failure stops masquerading as an empty list.
- Update the `SupportAccessReview` status handling/labels to match `logged` / `completed`, and (Option A) the expiry column wording plus an expired indicator.

## Verification

- Log a review from Users → Support, confirm the row appears and Complete transitions it.
- Negative tests via SQL: attempt to edit `reason`, attempt `completed -> logged`, attempt a delete, attempt insert with a mismatched `admin_user_id` — each must be rejected.
- Run the Supabase linter, `tsgo`, and a production build.

Nothing about encryption, vault access, or existing RLS elsewhere changes.
