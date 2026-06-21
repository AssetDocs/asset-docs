# Asset Safe — Data Lifecycle & Retention Operations

**Status:** Developer review draft
**Scope:** Backup/restore, account closure & deletion, storage object deletion, exports, retention windows, storage-usage lifecycle, and the cron sweepers + admin surfaces that bind them together.
**Companion docs:** `AssetSafe_Billing_Revenue_Operations.md` (entitlement & subscription lifecycle).

---

## 1. System of Record & Guiding Principles

| Domain | System of Record | Canonical Local View | UI/Access Gate |
|---|---|---|---|
| Auth identity | `auth.users` (Supabase) | `public.profiles` (1:1 by `user_id`) | `profiles.account_status` |
| Account workspace | `public.accounts` | `account_memberships` | `account_id` scoping (RLS) |
| Files / media | Supabase Storage buckets | `property_files`, `*_attachments`, `legacy_locker_files`, etc. | Signed URLs + RLS |
| Closure / deletion intent | `account_closure_requests`, `account_deletion_requests` | `deleted_accounts` (tombstone) | `profiles.account_status` + RLS |
| Storage accounting | `storage_usage` (rollup) | per-bucket sum on demand | RLS + admin bypass |

**Principles**
1. **Soft-delete first, hard-delete on a clock.** Every destructive user action stages a request; an automated sweeper performs the irreversible step after a defined grace.
2. **Storage objects mirror DB rows.** A row delete must enqueue the matching object delete in the same transaction (or via outbox); never rely on the client.
3. **Tombstones outlive content.** `deleted_accounts` is retained even after `auth.users` is purged so we can answer "did this email ever exist?" for re-signup & support.
4. **Audit > Data.** Audit/consent/legal rows survive content deletion until their own retention clock expires.
5. **Exports are ephemeral.** Generated ZIP/PDF bundles use short-lived signed URLs and a hard download cap.

---

## 2. Backup & Restore

### 2.1 Supabase-managed
- **PITR (Point-In-Time Recovery):** required on production project `leotcbfpqiekgkgumecn`. Confirm plan tier supports 7-day PITR minimum (target: 14 days pre-launch, 28 days post-launch).
- **Daily logical backups:** Supabase automatic; retained per tier.
- **Storage:** S3-backed; relies on Supabase replication. No Lovable-managed second copy today — **gap**.

### 2.2 Targets
| Metric | Target | Notes |
|---|---|---|
| RPO (DB) | ≤ 5 min | PITR WAL window |
| RPO (Storage) | ≤ 24 h | Provider-level; no app-level snapshot |
| RTO (DB) | ≤ 4 h | Restore-to-new-project drill |
| RTO (Full app) | ≤ 8 h | Includes edge redeploy + DNS |

### 2.3 Restore drill (quarterly)
1. Restore PITR snapshot into a scratch project.
2. Run `supabase/migrations/` against scratch to confirm parity.
3. Smoke test: login, list properties, open a signed URL, run `check-subscription`.
4. Sign off in `restore_drill_runs`.

### 2.4 Approvals
- **Approver for production restore:** Owner only (single named human).
- **Pre-restore checklist:** activate `system_maintenance_windows` via `activate_maintenance_mode`, notify users via the global banner, snapshot current state to a separate project, then restore.

### 2.5 Launch gaps
- Restore runbook exists at `docs/AssetSafe_Backup_Restore_Runbook.md`.
- No automated drill cadence.
- No secondary storage copy / cross-region object replication.
- Freeze-writes maintenance flag exists via `system_maintenance_windows`; admin UI controls are still pending.

---

## 3. Account Closure & Deletion State Machine

Three distinct user-initiated flows converge on the same tombstone:

```text
                  ┌──────────────────────────────┐
USER ──"close"──▶ │ request-account-closure       │──┐
                  └──────────────────────────────┘  │
                                                    ▼
                  ┌──────────────────────────────┐  closure_requests
USER ──"delete"─▶ │ submit-deletion-request       │  account_closure_requests
                  └──────────────────────────────┘  account_deletion_requests
                                                    │
              ┌─────────────────────────────────────┘
              ▼
  profiles.account_status = 'closure_pending' | 'deletion_pending'
              │
              │  (grace window — see §3.2)
              │
              ├── reverse-account-closure ──▶ status='active'
              │
              ▼
        delete-account (edge or sweeper)
              │
              ├── purge content rows (scoped by account_id)
              ├── delete storage objects
              ├── revoke auth.users
              └── INSERT deleted_accounts (tombstone)
```

### 3.1 States (`profiles.account_status`)
| State | Meaning | Writes allowed? | UI |
|---|---|---|---|
| `active` | Normal | Yes | Full app |
| `expired_read_only` | Billing grace expired (see Billing doc) | No (core) | Read-only banner |
| `closure_pending` | User requested closure; in grace | Limited (export only) | Closure banner + reverse CTA |
| `deletion_pending` | Hard delete queued | None | Goodbye screen |
| `cancelled_billing_active` | Sub cancelled, period still paid | Yes | Renewal-off banner |

### 3.2 Grace windows (current vs proposed)
| Action | Current | Proposed | Reversible by |
|---|---|---|---|
| Closure (subscription end) | undocumented | **30 days** | `reverse-account-closure` |
| Deletion (user-initiated wipe) | undocumented | **14 days** | Owner only, via support |
| Continuity-triggered freeze | per `continuity_account_freezes` | keep | Legacy Admin dispute |

### 3.3 Backing tables
- `account_closure_requests` — soft-close intent, 14 cols.
- `account_deletion_requests` — hard-delete intent, 11 cols.
- `closure_requests` — duplicate/legacy? **Audit needed.**
- `deleted_accounts` — tombstone (5 cols).
- `memorialized_accounts` — continuity end-state.

### 3.4 Edge functions
- `request-account-closure`, `reverse-account-closure`
- `submit-deletion-request`, `respond-deletion-request`
- `delete-account` — orchestrator (must run with service role)
- `send-deletion-confirmation`

### 3.5 Launch gaps
- Three overlapping tables (`closure_requests`, `account_closure_requests`, `account_deletion_requests`) need consolidation or a documented decision matrix.
- No cron sweeper that flips `closure_pending` → `delete-account` after grace.
- No re-signup conflict handling beyond the memory note (`deleted-accounts-table-conflict`) — should be codified as an edge guard.

---

## 4. Storage Object Deletion

### 4.1 Per-object flows
| Surface | Edge | Pattern |
|---|---|---|
| Single file in any media bucket | `secure-delete-file` | RLS check → storage.remove → DB row delete → activity log |
| Property + cascade | `secure-delete-property` | Enumerate `property_files` → batch storage remove → cascade DB |
| VIP contact (FK RESTRICT) | `secure-delete-contact` | Detach attachments → storage remove → row delete (per memory) |

### 4.2 Pending deletion queues
- `list-pending-file-deletions` and `list-pending-property-deletions` already surface items awaiting confirmation.
- **Missing:** a write-side counterpart that *enqueues* (currently most deletes are immediate). Decide: immediate vs queued+sweeper.

### 4.3 Orphan detection (proposed)
Nightly job `reconcile-storage-orphans`:
1. List bucket objects (paged).
2. Left-join against owning table (`property_files.storage_path`, etc.).
3. Objects with no row → move to `_orphans/` prefix with TTL, alert admin.
4. Rows with no object → mark `missing_object=true`, surface in admin.

### 4.4 Launch gaps
- No orphan reconciler.
- No bucket-level lifecycle rule (e.g., auto-delete `_orphans/` after 30 days).
- No per-bucket size cap independent of `storage_usage` accounting.

---

## 5. Exports

### 5.1 Surfaces
- **User-initiated account export** — Comprehensive Export (per memory `features/export/comprehensive-export-system-v2`): PDF + ZIP of media.
- **Continuity export** — Legacy Admin/delegate downloads via `continuity_export_authorizations`; forensic trail in `continuity_export_forensics`.
- **Per-area PDFs** — Infrastructure, Legal, Inventory checklist (client-side jspdf hooks).

### 5.2 Lifecycle
| Stage | Rule (proposed) |
|---|---|
| Generation | Async; bundle written to `exports/` bucket under `{account_id}/{request_id}/` |
| Signed URL TTL | **15 minutes** for download links; new link via re-auth |
| Bundle retention | **7 days** then hard delete |
| Download cap | **5 downloads** per authorization; re-issue requires admin |
| Audit | Row in `continuity_export_forensics` (continuity) or new `account_export_audit` (user) |

### 5.3 Launch gaps
- No central `account_export_audit` table for non-continuity exports.
- TTL/download-cap not enforced consistently across PDF vs ZIP paths.
- No sweeper deleting expired bundles from the `exports/` bucket.

---

## 6. Retention Policy Matrix

| Data class | Live window | Post-deletion retention | Basis | Notes |
|---|---|---|---|---|
| User content (files, items, properties) | Account active | Purged on hard delete | Product | Subject to closure grace |
| `deleted_accounts` tombstone | n/a | **Indefinite** (≥ 7 yr) | Re-signup conflict guard | Email + deleted_at only |
| `audit_logs`, `continuity_audit_logs`, `continuity_email_audit_log` | n/a | **7 years** | SOC 2-aligned | Immutable per memory |
| `user_activity_logs` | n/a | **2 years** | Product/security | Per `audit-and-activity-integrity` |
| Billing records (`payment_events`, `subscribers`, `stripe_events`) | n/a | **7 years** | Tax/finance | Stripe is also a copy |
| `legal_agreement_signatures`, `user_consents` | n/a | **Lifetime + 7 years** | Legal | Required for TOS proof |
| Support / `dev_support_issues` | n/a | **3 years** | Internal | Scrub PII after close |
| Storage bundles (exports) | n/a | **7 days** | §5.2 | Sweeper required |
| Backup snapshots | per tier | 14–28 days | §2.1 | |
| Legal hold override | Indefinite | Indefinite | Flag in `audit_logs.hold=true` | **Not implemented** |

### 6.1 Launch gaps
- No `legal_hold` flag or admin tool to apply one.
- No automated PII scrub job for closed support tickets.
- No documented retention schedule surfaced to users in Privacy Policy.

---

## 7. Storage Usage Lifecycle (`storage_usage`)

### 7.1 Today
- `storage_usage` (8 cols, 4 policies) holds a rollup keyed by account.
- Increments/decrements rely on the writing path doing the right thing.
- `send-storage-warning` reads from this table.

### 7.2 Drift risks
- Failed `secure-delete-file` between storage remove and row delete → undercounts.
- Direct admin storage removals → no rollup update.
- Cascade deletes (`secure-delete-property`) — confirm rollup is debited per file.

### 7.3 Proposed sweeper: `recompute-storage-usage`
Hourly per account in a queue (or nightly full-scan):
1. Sum `property_files.size` + memory safe + voice notes + delegate vault + exports.
2. Compare to `storage_usage.bytes_used`.
3. If drift > 5% or > 50 MB → write corrected value + emit `storage_usage_drift` to `audit_logs`.

### 7.4 Launch gaps
- No reconciliation job today.
- No metric/alert on drift rate.
- Add-on storage blocks (25 GB) — confirm rollup considers entitlement when alerting.

---

## 8. Cron & Sweeper Inventory (current + proposed)

| Job | Status | Cadence | Purpose |
|---|---|---|---|
| `check-payment-failures` | exists | hourly | Dunning (billing doc) |
| `check-grace-period-expiry` | exists | hourly | Billing grace flip |
| `check-gift-reminders` | exists | daily | Gift expiry nudges |
| `notify-manual-review-backlog` | exists | daily | Ops alert |
| `sweep-closure-pending` | **missing** | daily | Flip to deletion after 30 d |
| `sweep-deletion-pending` | **missing** | hourly | Execute `delete-account` after 14 d |
| `process-expired-exports` | function + runbook | hourly | Expire continuity export grants + purge stale `exports/` bucket bundles |
| `reconcile-storage-orphans` | **missing** | nightly | Storage-vs-DB diff |
| `recompute-storage-usage` | **missing** | hourly batches | Drift correction |
| `scrub-old-support-pii` | **missing** | weekly | Retention compliance |
| `quarterly-restore-drill-reminder` | **missing** | quarterly | Ops reminder |

Wire all via `pg_cron` + `pg_net` per project convention.

---

## 9. Admin Surfaces

| Surface | Today | Gap |
|---|---|---|
| Pending file/property deletions | `list-pending-file-deletions`, `list-pending-property-deletions` | Pair with bulk approve/deny |
| Closure / deletion requests | Partially in Admin | Unified queue with grace clock |
| Export audit | continuity only | Add user-export audit view |
| Storage drift | none | New panel; surfaces `storage_usage_drift` events |
| Legal hold | none | Toggle on account; blocks all sweepers |
| Restore drill log | none | Read from `dev_releases` type=`restore_drill` |

---

## 10. Prioritized Launch Gaps

**P0 (blocking launch)**
1. Sweepers: `sweep-closure-pending`, `sweep-deletion-pending`, `sweep-expired-exports`.
2. Consolidate the three closure/deletion tables or document the matrix.
3. Restore runbook + one rehearsed drill, logged.
4. Re-signup conflict guard codified in `request-account-closure` and signup.

**P1 (first 30 days post-launch)**
5. `reconcile-storage-orphans` + `recompute-storage-usage`.
6. `account_export_audit` table + TTL/download-cap enforcement.
7. Legal hold flag + admin UI.
8. Surface retention schedule in Privacy Policy.

**P2 (quarter 1)**
9. Cross-region storage replication or scheduled object snapshots.
10. Admin UI controls for maintenance/freeze-writes mode.
11. Automated quarterly restore-drill reminder + sign-off workflow.
12. PII scrub for closed support tickets.

---

## 11. Open Questions for Developer Review
1. Are `closure_requests` and `account_closure_requests` truly distinct, or is one deprecated?
2. Does `delete-account` today purge storage objects, or only DB rows?
3. Where is the canonical list of buckets and their per-bucket lifecycle rules (if any)?
4. Confirm `deleted_accounts` retention satisfies CCPA/CPRA "right to delete" — tombstone fields must be minimized (email hash vs plaintext).
5. Should continuity-triggered freezes block the closure/deletion sweepers? (Recommendation: yes, hard block.)
