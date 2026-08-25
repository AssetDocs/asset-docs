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

## Consistency CHECK on completion

Table-level: `CHECK ((status = 'logged' AND completed_at IS NULL) OR (status = 'completed' AND completed_at IS NOT NULL))` — a logged row can never carry a completion timestamp, and a completed row can never lack one.

## `expires_at` semantics — decided

`expires_at` is metadata only: the declared review window. No cron, no automatic status mutation.
- Label the column "Review window ends" in the Support Access tab.
- Show an "Expired" indicator when `expires_at < now()` and status is still `logged`.
- A review closes only when an operator clicks Complete.

## Canonical record — decided

`support_access_reviews` is the canonical forensic record. On insert, add **one minimal cross-reference row** in `audit_logs` (existing shape: `user_id`, `action`, `table_name`, `record_id`):
- `action = 'support_access_review_logged'`, `table_name = 'support_access_reviews'`, `record_id = <review id>`, `user_id = auth.uid()`.
- No reason, scope, or target details copied into `old_values` / `new_values`.

## Frontend changes (narrow)

- `console.error` the full backend error object for diagnostics; keep the visible `window.alert` generic — no Postgres/RLS text in the UI.
- Check and log the error on the Support Access read in `loadData()` so a backend failure stops masquerading as an empty list.
- Align status handling/labels to `logged` / `completed`, rename the Expires column to "Review window ends", and render the Expired indicator.

## Verification

- Log a review from Users → Support; confirm the row appears and Complete transitions it with a completion timestamp.
- Negative SQL tests, each must be rejected: edit `reason`; `completed -> logged`; delete a row; insert with mismatched `admin_user_id`; insert `logged` with a `completed_at`; set `completed` without `completed_at`.
- Supabase linter, `tsgo` typecheck, production build.

No changes to vault, encryption, or any RLS outside this new table.
