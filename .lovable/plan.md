# Fix: "Could not log support access review."

## Audit result

The error is not a permissions or validation problem — the table the feature writes to does not exist.

- `src/components/admin/AdminUsers.tsx` → `logSupportAccessReview()` inserts into `support_access_reviews`.
- A schema query confirms there is **no** `support_access_reviews` table in the `public` schema, so every insert fails and the alert fires.
- The same tab's read (`loadData()`, fetch of `support_access_reviews`) fails silently because its error is never checked, so the Support Access tab just renders "No support access reviews logged" instead of surfacing the real cause.
- The UI expects these columns: `id, admin_user_id, target_user_id, target_email, target_account_number, reason, access_scope, status, expires_at, completed_at, created_at`.

## Plan

### 1. Create the missing table (migration)
`public.support_access_reviews` with the columns the UI already expects:
- `id uuid pk default gen_random_uuid()`
- `admin_user_id uuid not null`, `target_user_id uuid not null`
- `target_email text`, `target_account_number text`
- `reason text not null`
- `access_scope text not null default 'read_only_support_context'`
- `status text not null default 'active'`
- `expires_at timestamptz not null default now() + interval '24 hours'`
- `completed_at timestamptz`, `created_at timestamptz not null default now()`
- index on `created_at desc`

Grants + RLS in the required order (create → grant → enable RLS → policies):
- `GRANT SELECT, INSERT, UPDATE ON ... TO authenticated;` and `GRANT ALL ... TO service_role;` (no `anon` grant)
- Policies restricted to the admin/owner workspace via the existing `has_owner_workspace_access()` helper: select, insert (also requiring `admin_user_id = auth.uid()`), and update (to mark reviews completed).
- Immutability guard: no delete policy, so entries are append-only and can only be transitioned to completed.

### 2. Frontend hardening (small, no behavior change)
- Check and log the error on the Support Access read in `loadData()` so a backend failure is visible instead of showing an empty state.
- Include the returned error message in the alert text so future failures are self-diagnosing.

### 3. Verify
- Re-run the flow: enter a support reason from Users → Support → Log, confirm the row appears in the Support Access tab, and confirm "Complete" transitions the row to completed.
- Run the Supabase linter and a production build.

Nothing about encryption, vault access, or existing RLS elsewhere changes.
