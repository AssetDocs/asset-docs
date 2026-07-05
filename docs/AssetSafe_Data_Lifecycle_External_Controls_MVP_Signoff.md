# Asset Safe Data Lifecycle External Controls - MVP Launch Sign-Off

Status: Operator decisions recorded; PITR accepted for MVP, restore drill scheduled for limited MVP
Date prepared: 2026-07-05
Production project: `leotcbfpqiekgkgumecn`
Companion runbook: `docs/AssetSafe_Data_Lifecycle_External_Controls_Runbook.md`

This document captures the four Data Lifecycle External Controls items required before MVP launch. Items marked **Operator action required** cannot be completed from the application codebase because they depend on Supabase dashboard settings, restore execution, or legal review.

---

## 1. PITR (Point-in-Time Recovery)

**Status:** Accepted MVP - 7-day PITR enabled; 14-day target deferred to P1.

PITR is a Supabase project-level setting configured in the dashboard. It is not visible through the Data API and cannot be confirmed programmatically from this repo.

**Operator decision (2026-07-05):**

- [x] PITR is enabled on production project `leotcbfpqiekgkgumecn`
- [x] Recovery window accepted for MVP: **7 days**
- [x] Original 14-day pre-launch target deferred to P1 / broader-launch upgrade
- [ ] Post-launch / broader-launch upgrade target to 14 days or greater should be revisited when usage, revenue, or risk level justifies the additional cost

**Evidence to capture:**

- Screenshot of Supabase Dashboard -> Project Settings -> Add-ons -> Point in Time Recovery, showing enabled state and retention window
- Store in launch evidence packet alongside `docs/AssetSafe_Launch_Evidence_Run_2026_07_01.md`

**Operator note (2026-07-05):** Operator approved 7-day PITR for MVP due to cost. The 14-day target doubles PITR add-on cost and PITR also requires the project to be at least Small compute. Seven-day PITR provides meaningful MVP protection against bad migrations, accidental deletion, operator error, and short-window data corruption. Daily backups and the manual export/restore runbook remain the MVP fallback. Treat 14-day PITR as a P1 / broader-launch upgrade.

**Recommended checklist wording:**

> PITR enabled on production Supabase project `leotcbfpqiekgkgumecn` with a 7-day recovery window accepted for MVP. The original 14-day target is deferred to P1 / broader-launch upgrade with owner approval due to cost. Daily backups and the manual export/restore runbook remain the MVP fallback.

---

## 2. PITR Restore Drill

**Status:** Accepted MVP - scheduled for limited MVP; completed drill preferred before broad launch.

Restore drill tables (`public.restore_drill_runs`), admin surfaces, and the `quarterly-restore-drill-reminder` cron are all implemented and healthy. The first PITR restore drill is scheduled for 2026-07-07 at 10:00 AM America/Chicago. No `restore_drill_runs` row with `status = 'passed'` exists yet, so the drill itself has not been executed.

**Active decision: scheduled is accepted for limited MVP; completed drill remains preferred before broad launch.**

Rationale:

- Asset Safe stores user-critical records (property, insurance, legal, financial documents) whose loss would be reputationally and legally severe.
- All supporting tooling is already in place; running one drill following `docs/AssetSafe_Backup_Restore_Runbook.md` is the last remaining step.
- Marketing and Terms language commits to durable custodianship of user records; launching without a proven restore path contradicts that commitment.
- The drill produces the only evidence that PITR, edge function redeploy, and secret rehydration actually work end-to-end.

**Completion path:** When the drill is run, record the `restore_drill_runs` row and owner sign-off as below. If the operator later elects to continue beyond limited MVP without completion evidence, the following mitigations must be in place and disclosed internally:

- Written owner acknowledgment that no restore has been proven
- Restore drill scheduled within 30 days of launch, tracked as P0 in the launch backlog
- Incident response runbook updated to reflect "restore path unverified" as an elevated risk factor

**Recommended checklist wording (scheduled limited-MVP path):**

> PITR restore drill scheduled for 2026-07-07 at 10:00 AM America/Chicago per `docs/AssetSafe_Backup_Restore_Runbook.md`. Limited MVP accepts scheduled drill; completed drill and `restore_drill_runs` sign-off evidence remain preferred before broad launch.

**Recommended checklist wording (completed path):**

> PITR restore drill completed on __________ per `docs/AssetSafe_Backup_Restore_Runbook.md`. `restore_drill_runs` row id __________ shows `status = 'passed'` with all five smoke checks (db, storage, auth, edge, signed_url) true. RPO __________ min, RTO __________ min. Owner sign-off recorded via `sign_off_restore_drill_run`. Findings and follow-ups reviewed.

**Recommended checklist wording (deferred/accepted-risk override path):**

> PITR restore drill deferred to post-launch as Accepted MVP Risk. Owner __________ acknowledges no restore path has been proven end-to-end. Drill scheduled by __________ (within 30 days of launch). Compensating control: PITR enabled with 7-day window and Supabase-managed backups.

---

## 3. Storage Backup Posture

**Status:** Accepted for MVP by operator on 2026-07-05.

Current posture inventory:

| Layer | Backup mechanism | MVP acceptable? |
|---|---|---|
| Postgres database | Supabase managed daily backups + PITR (7-day MVP window) | Yes for MVP |
| Storage objects (user documents/media) | Supabase Storage provider-managed durability and replication | Yes for MVP |
| Storage objects - secondary app-managed copy | None | Yes - explicitly deferred |
| `exports/` bucket | Regenerable from source data; 7-day lifecycle via `process-expired-exports` | Yes |

**Operator decision: ACCEPT for MVP.** A secondary app-managed object backup (cross-region snapshot, cross-account replication) is a post-launch maturity item. It is not required to open the product because the decision is disclosed and will be revisited.

**Post-launch P1/Q1 action:**

- Evaluate scheduled object snapshot vs cross-region replication per `docs/AssetSafe_Data_Lifecycle_External_Controls_Runbook.md` Section 2.
- Update `AssetSafe_Data_Lifecycle_External_Controls_Runbook.md` with the chosen posture.
- Track the secondary object snapshot / cross-region replication review in `docs/AssetSafe_Launch_Operator_Signoff_Checklist.md`.

**Recommended checklist wording:**

> Storage backup posture accepted for MVP: Supabase managed DB backups + PITR for the Postgres layer, and Supabase Storage provider-managed durability/replication for object storage. No app-managed secondary object backup is provisioned for MVP; this is an explicit, disclosed deferral. Post-launch review to evaluate secondary object backup is tracked as P1/Q1 follow-up.

---

## 4. Legal Retention Schedule

**Status:** Accepted for MVP by operator on 2026-07-05; counsel review pending.

Implemented and current:

- `docs/AssetSafe_Retention_Deletion_Policy_Matrix.md` - technical retention matrix
- `docs/AssetSafe_Closure_Deletion_Table_Matrix.md` - per-table boundary decisions
- `docs/AssetSafe_Audit_Log_Retention_Runbook.md` - audit retention windows
- Legal hold fields and admin review workflow on `account_closure_requests` and `deleted_accounts`
- Retention/expiration sweepers (`process-retention-expirations`, `scrub-old-support-pii`, `process-account-closures`) all skip legal-hold accounts
- Public retention language in `src/pages/Terms.tsx` aligned to tombstone/anonymization model

Operator decisions:

- [x] Retention matrix and closure/deletion boundary matrix accepted for MVP by operator
- [x] Counsel review status recorded: **operator-accepted-pending-counsel**
- [x] Legal hold confirmed to override deletion, anonymization, and expiration sweepers
- [x] Plaintext email in legal evidence: access-restricted and minimized unless counsel advises otherwise
- [x] Billing/Stripe evidence retention window: 7 years, tombstone-linked

**Recommended checklist wording:**

> Legal retention schedule reviewed and accepted for MVP. Retention matrix (`docs/AssetSafe_Retention_Deletion_Policy_Matrix.md`) and closure/deletion boundary matrix (`docs/AssetSafe_Closure_Deletion_Table_Matrix.md`) accepted by owner Michael Lewis on 2026-07-05. Counsel review pending; operator accepted for MVP with counsel review to follow. Legal hold confirmed to block deletion, anonymization, and retention sweepers. Billing/Stripe evidence retention default remains 7 years and tombstone-linked. Plaintext email in legal evidence remains access-restricted and minimized unless counsel advises otherwise. Terms/Privacy language in `src/pages/Terms.tsx` aligns with implemented tombstone/anonymization model.

---

## Consolidated Sign-Off Table

Copy into launch notes and complete before flipping the launch gate.

| Control | Decision | Owner | Date | Evidence |
|---|---|---|---|---|
| PITR enabled (7-day MVP window) | Accepted MVP; 14-day target deferred to P1 | Michael Lewis | 2026-07-05 | Operator approval; dashboard screenshot recommended for evidence packet |
| PITR restore drill | Accepted MVP - scheduled; completed drill preferred before broad launch | Michael Lewis / platform owner | 2026-07-05 | Scheduled for 2026-07-07 at 10:00 AM America/Chicago; `restore_drill_runs` row id and signoff still required after execution |
| Storage backup posture | Accepted for MVP | Michael Lewis | 2026-07-05 | This document + launch checklist |
| Legal retention schedule | Accepted for MVP; counsel review pending | Michael Lewis | 2026-07-05 | This document + counsel status |

---

## Cross-References

- Runbook: `docs/AssetSafe_Data_Lifecycle_External_Controls_Runbook.md`
- Retention: `docs/AssetSafe_Retention_Deletion_Policy_Matrix.md`
- Backup/restore: `docs/AssetSafe_Backup_Restore_Runbook.md`
- Ongoing gaps: `docs/AssetSafe_Data_Lifecycle_Retention_Operations_Review.md`
- Launch sign-off: `docs/AssetSafe_Launch_Operator_Signoff_Checklist.md`
