# Asset Safe Content Audit Trail Runbook

Status: launch security operations runbook
Owner: Security Lead / Platform
Production project: `leotcbfpqiekgkgumecn`
Companion docs:
- `docs/AssetSafe_Audit_Log_Retention_Runbook.md`
- `docs/AssetSafe_Data_Lifecycle_Retention_Operations.md`
- `docs/AssetSafe_Retention_Deletion_Policy_Matrix.md`

## Architecture

Four separate layers, deliberately not conflated:

| Layer | Where | Purpose |
|---|---|---|
| Content record timestamps | `created_at` / `updated_at` on every content table | Operational "when was this last touched" |
| Forensic audit trail | `public.content_audit_events` | Complete, append-only, database-generated evidence of every insert/update/delete |
| Readable activity history | `public.user_activity_logs` | Curated human-readable feed for Access & Activity |
| Admin/system audit | `public.audit_logs` | Pre-existing role, billing, and gift evidence (unchanged) |

Account scope (`account_id` / `owner_user_id`) = whose data changed.
Actor (`actor_user_id` + `actor_type`) = who performed it. These are never the same field.

## `content_audit_events`

| Column | Meaning |
|---|---|
| `account_id`, `owner_user_id` | Whose Asset Safe data was modified (resolved from the row, including on delete) |
| `actor_user_id` | Authenticated user who acted; `NULL` for service-role, cron, and direct SQL |
| `actor_type` | Enum: `owner`, `authorized_user`, `admin`, `service_role`, `system`, `cron` |
| `event_source` | Enum: `browser`, `edge_function`, `service_role`, `database_trigger`, `admin`, `system` |
| `table_name`, `record_id` | What was touched |
| `operation` | `INSERT`, `UPDATE`, `DELETE` |
| `changed_fields` | Column **names** only; `created_at`/`updated_at` excluded |
| `record_label` | Human-readable identifier, allow-listed per table only |
| `metadata` | Small non-sensitive descriptors, allow-listed per table only |
| `request_id` | Correlation id grouping every row from one user action |
| `occurred_at` | `clock_timestamp()`, so ordering inside a request is exact |
| `anonymized_at` | Set when the account was deleted and labels were stripped |

No foreign key to `auth.users`: evidence survives account deletion.

## Sensitive-data policy — allow-list, not deny-list

`public.content_audit_field_policy` lists, per table, the only columns permitted to
appear as `record_label` or `metadata`. The default for any table not listed, and for
any newly added column, is to capture **nothing**. Adding a new sensitive column can
therefore never leak it into the audit trail by omission.

Values are never copied for updates — only the names of changed columns. Password,
encryption, token, financial, trust, medication, tax, and document-content tables are
deliberately seeded with empty label/metadata arrays.

To expose a new label, add or update the row in `content_audit_field_policy` — no
trigger changes required.

## Failure behavior — fail closed

The audit trigger is `AFTER ... FOR EACH ROW` and its insert is not exception-wrapped.
If the audit row cannot be written, the underlying content mutation fails. Helper
lookups (account resolution, role checks) degrade gracefully to `NULL`/`system`, so a
missing helper cannot break writes — but a genuinely unwritable audit trail stops the
protected mutation rather than creating a silent gap.

Touch-only updates where no non-timestamp column changed are skipped, so `updated_at`
churn does not generate noise.

## Immutability

- No `INSERT`/`UPDATE`/`DELETE` grants to `authenticated` or `anon`.
- `guard_content_audit_events_immutable` rejects any update or delete unless the caller
  is a trusted internal writer or the service role.
- Read access is limited to admin / dev workspace via RLS.
- Retention deletion happens only through the controlled service-role sweep.

## Account deletion

`delete-account` purges content tables (each purge generates DELETE evidence), then
calls `anonymize_content_audit_events(_owner_user_id)` which clears `record_label` and
`metadata` and stamps `anonymized_at`. The forensic skeleton — operation, table,
record id, actor, timestamp, correlation id — is retained.

## Verified behaviors

Exercised against production with throwaway records (since removed):

| Scenario | Result |
|---|---|
| Owner browser insert/update | `owner` / `browser`, changed field names only |
| Authorized User update + delete in owner's workspace | `authorized_user` / `browser`, filed under the owner's account |
| Service-role (edge function) write | `service_role` / `service_role`, `actor_user_id` NULL |
| Direct SQL / cron | `system` / `database_trigger`, `actor_user_id` NULL |
| Folder cascade delete | One row per affected record, all sharing one `request_id` |
| Touch-only update | Skipped |
| Delete | Account scope resolved from the OLD row |
| Tamper attempt as authenticated user | Rejected |
| Sensitive table label capture | Empty, per allow-list |

## Retention

Forensic audit follows the long administrative window (7 years unless legal hold);
`user_activity_logs` keeps its shorter user-visible window (2 years). The sweep filters
on `content_audit_events.occurred_at` only and never depends on the referenced content
row or user still existing.

## Evidence queries

Everything that happened in one account, most recent first:

```sql
select occurred_at, actor_type, event_source, table_name, operation,
       changed_fields, record_label, request_id
from public.content_audit_events
where account_id = '<account-id>'
order by occurred_at desc
limit 200;
```

Everything one actor did:

```sql
select occurred_at, account_id, table_name, operation, changed_fields, record_label
from public.content_audit_events
where actor_user_id = '<user-id>'
order by occurred_at desc
limit 200;
```

Reconstruct a single user action (e.g. a folder delete that cascaded):

```sql
select occurred_at, table_name, operation, record_id, record_label
from public.content_audit_events
where request_id = '<request-id>'
order by occurred_at asc;
```

What was deleted from an account:

```sql
select occurred_at, actor_type, actor_user_id, table_name, record_id, record_label
from public.content_audit_events
where account_id = '<account-id>' and operation = 'DELETE'
order by occurred_at desc;
```

## Post-launch follow-ups

- Extend `user_activity_logs` coverage module by module so the readable feed matches the
  forensic trail (uploads, vault, folders, and AU actions are the priority).
- Add the retention sweep for `content_audit_events` to the scheduled cron set.
- Consider hash chaining and external immutable export, per the audit-log retention runbook.
