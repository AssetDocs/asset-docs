# Account Audit Trail — Implementation Plan

Confirms the layered architecture: content rows keep reliable timestamps, a new database-level audit trail becomes the forensic record, and `user_activity_logs` stays the curated human-readable feed. Account scope and actor identity are never conflated.

## Verification of the existing `audit_logs` table

Checked before committing to it. Verdict: **not suitable as-is for broad content auditing.**

- It has `user_id`, `action`, `table_name`, `record_id`, `old_values`, `new_values`, `ip_address`, `user_agent`, `created_at`, plus deletion-anonymization columns.
- It has **no `account_id`** and no actor-type concept, so it cannot express "whose account" vs "who acted".
- Its trigger function copies **entire rows** via `to_jsonb(OLD)` / `to_jsonb(NEW)` — exactly the sensitive-data duplication to avoid across password, financial, trust, medication, and document tables.
- Its `user_id` has a foreign key to `auth.users`, so audit rows are coupled to the user record's continued existence.

Decision: leave `audit_logs` untouched for its current role (admin/role/billing evidence on `contributors`, `user_roles`, `gift_subscriptions`) and create a dedicated content-audit table designed for this purpose.

## Step 1 — Close the three `updated_at` gaps

Add `updated_at` plus a `BEFORE UPDATE` trigger to `property_files`, `legacy_locker_files`, and `account_memberships`, backfilled from `created_at`.

## Step 2 — Fix the Authorized-User scoping bug

The shared logging helper currently writes the signed-in user into both the account field and the actor field, so AU activity files under the AU instead of the account being modified.

- Resolve the active account from the existing account context and write it as the account scope.
- Write the acting authenticated user as the actor.
- Add an actor type so the feed can render "Owner" vs "Authorized User".
- Apply the same correction to the edge functions that insert activity rows (invite, cancel, accept, revoke, role change), which currently stamp the caller into both fields.
- Existing rows are left as they are; no rewriting of history.

## Step 3 — Database-level content audit trail

New append-only table capturing every insert, update, and delete on user-content tables:

- `account_id` — whose data changed
- `actor_user_id` — who performed it (no foreign key to `auth.users`, so evidence survives account deletion)
- `actor_type` — owner, authorized user, service role, or system/cron
- `table_name`, `record_id`
- `operation` — INSERT / UPDATE / DELETE
- `changed_fields` — array of column names only, for updates
- `record_label` — human-readable name/title when the table has one
- `metadata` — small non-sensitive descriptors only
- `occurred_at`

Sensitive-data policy, enforced inside the trigger:

- Updates record **which fields changed, never the values**.
- A central deny-list redacts password fields, encryption payloads, tokens, document contents/paths, financial identifiers, and similar columns — they never appear even as labels' contents.
- Deletes preserve only what is needed to identify what disappeared: record id, label where safe, account, actor, timestamp. No full row snapshot.

Behavior guarantees to build and verify:

- Fires for browser writes, edge-function/service-role writes, and direct SQL alike.
- Cascaded deletes and bulk operations produce one row per affected record.
- Account deletion and anonymization do not orphan or cascade-remove audit rows; the account-deletion path anonymizes identifiers instead of deleting evidence.
- Audit rows are readable only by admin/dev workspace roles; no insert/update/delete from client roles.

## Step 4 — Keep `user_activity_logs` curated

Triggers do **not** write into `user_activity_logs`. It remains the readable account history for Access & Activity, written intentionally at meaningful moments, so low-level updates never flood the feed. Coverage can be extended module by module later as a separate pass.

## Step 5 — Deferred

`created_by` / `updated_by` columns only if attribution needs to appear directly beside records in the UI.

## Retention

Forensic content audit follows the long administrative window; `user_activity_logs` keeps its shorter user-visible window. The retention sweep operates on the audit rows' own timestamps and never depends on the referenced content row or user still existing.

## Post-implementation verification

Explicitly exercised before this is called done: service-role writes, edge-function writes, Authorized-User writes, owner writes, hard deletes, cascaded deletes, bulk deletes, account deletion/anonymization, and confirmation that no redacted field's value appears anywhere in the audit table.

## Out of scope

No UI changes, no soft-delete/tombstone columns, no changes to auth, billing, or module behavior.
