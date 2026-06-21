# Asset Safe Closure & Deletion Table Matrix

Status: launch operations decision record
Owner: Asset Safe operator / project owner

## Decision

Do not merge the closure/deletion tables before launch. They represent three different operational workflows and should remain distinct, with `deleted_accounts` as the shared tombstone after irreversible deletion.

## Table Roles

| Table | Canonical role | Written by | Read by | Terminal path |
|---|---|---|---|---|
| `account_closure_requests` | Owner self-service closure schedule | `request-account-closure`, `reverse-account-closure`, `process-account-closures`, `delete-account` | owner UI, admin cancellation view, closure sweeper | `delete-account` anonymizes row and links `deleted_account_id` |
| `account_deletion_requests` | Authorized-user/admin-reviewed deletion request evidence | `submit-deletion-request`, `respond-deletion-request`, `delete-account` | account owner/admin review surfaces | `delete-account` anonymizes row and links `deleted_account_id` |
| `closure_requests` | Continuity/preservation closure workflow | continuity admin RPCs such as `approve_closure_request`, `complete_closure`, `cancel_closure` | continuity admin surfaces only | continuity completion records; not swept by self-service account deletion cron |
| `deleted_accounts` | Permanent tombstone reference | `delete-account`, `anonymize_user_data` | service/admin lookups and signup guard RPC | retained/minimized per retention policy |

## Workflow Boundaries

`account_closure_requests` is the owner-facing scheduled closure path. It tracks the user who requested closure, the scheduled deletion date, reversal state, billing-period alignment, and the final tombstone link. The hourly `process-account-closures` sweeper uses this table to call `delete-account` after the scheduled date.

`account_deletion_requests` is not a duplicate of owner self-service closure. It is the review/evidence queue for deletion requests submitted through the account management/recovery surface, including authorized-user or admin-mediated workflows. It preserves who requested the action and how the owner/admin responded.

`closure_requests` belongs to Legacy Continuity and Preservation. It is tied to `account_continuity_requests`, waiting periods, snapshots, and admin continuity decisions. It should not be used by the standard account closure sweeper.

`deleted_accounts` is not a workflow queue. It is the tombstone anchor used after deletion to retain minimal legal/security evidence, connect anonymized retained rows, and block re-signup through `is_deleted_account_email`.

## Current Launch Policy

- Keep all three workflow tables.
- Treat `account_closure_requests` as the only table swept by `process-account-closures`.
- Treat `account_deletion_requests` as review/evidence only unless an approved flow explicitly invokes `delete-account`.
- Treat `closure_requests` as continuity-only.
- Link retained closure/deletion rows to `deleted_accounts.id` through `deleted_account_id`.
- Do not expose plaintext tombstone email to non-admin users; use the signup guard RPC instead of direct table reads.

## Future Consolidation

Revisit consolidation only after launch if two conditions are true:

1. Admin review, owner self-service closure, and continuity closure share the same status model.
2. Existing audit/legal evidence can be migrated without changing retention meaning.

Until then, merging the tables would increase operational risk more than it reduces complexity.
