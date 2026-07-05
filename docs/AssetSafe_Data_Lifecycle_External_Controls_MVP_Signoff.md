# Asset Safe Data Lifecycle External Controls — MVP Launch Sign-Off

Status: Draft for operator sign-off
Date prepared: 2026-07-05
Production project: `leotcbfpqiekgkgumecn`
Companion runbook: `docs/AssetSafe_Data_Lifecycle_External_Controls_Runbook.md`

This document captures the four open Data Lifecycle External Controls items required before MVP launch. Items marked **Operator action required** cannot be completed from the application codebase — they depend on Supabase dashboard settings, restore execution, or legal review.

---

## 1. PITR (Point-in-Time Recovery)

**Status:** ⚠️ Operator action required — cannot be verified from code.

PITR is a Supabase project-level setting configured in the dashboard. It is not visible through the Data API and cannot be confirmed programmatically from this repo.

**Operator must confirm:**

- [ ] PITR is enabled on production project `leotcbfpqiekgkgumecn`
- [ ] Recovery window meets pre-launch target: **14 days minimum**
- [ ] Post-launch target scheduled to increase to **28 days**

**Evidence to capture:**

- Screenshot of Supabase Dashboard → Project Settings → Add-ons → Point in Time Recovery, showing enabled state and retention window
- Store in launch evidence packet alongside `docs/AssetSafe_Launch_Evidence_Run_2026_07_01.md`

**Recommended checklist wording:**

> PITR enabled on production Supabase project `leotcbfpqiekgkgumecn` with a 14-day recovery window (pre-launch target). Confirmed via Supabase dashboard screenshot dated __________. Post-launch increase to 28 days scheduled by __________. Owner: __________.

---

## 2. PITR Restore Drill

**Status:** ⚠️ Not completed. Recommendation below.

Restore drill tables (`public.restore_drill_runs`), admin surfaces, and the `quarterly-restore-drill-reminder` cron are all implemented and healthy. No `restore_drill_runs` row with `status = 'passed'` exists yet, so the drill itself has not been executed.

**Recommendation: REQUIRE BEFORE LAUNCH — do NOT accept as MVP risk.**

Rationale:

- Asset Safe stores user-critical records (property, insurance, legal, financial documents) whose loss would be reputationally and legally severe.
- All supporting tooling is already in place — running one drill following `docs/AssetSafe_Backup_Restore_Runbook.md` is the last remaining step.
- Marketing and Terms language commits to durable custodianship of user records; launching without a proven restore path contradicts that commitment.
- The drill produces the only evidence that PITR + edge function redeploy + secret rehydration actually works end-to-end.

**If the operator elects to accept as MVP risk anyway,** the following mitigations MUST be in place and disclosed internally:

- Written owner acknowledgment that no restore has been proven
- Restore drill scheduled within 30 days of launch, tracked as P0 in the launch backlog
- Incident response runbook updated to reflect "restore path unverified" as an elevated risk factor

**Recommended checklist wording (required-before-launch path):**

> PITR restore drill completed on __________ per `docs/AssetSafe_Backup_Restore_Runbook.md`. `restore_drill_runs` row id __________ shows `status = 'passed'` with all five smoke checks (db, storage, auth, edge, signed_url) true. RPO __________ min, RTO __________ min. Owner sign-off recorded via `sign_off_restore_drill_run`. Findings and follow-ups reviewed.

**Recommended checklist wording (deferred/accepted-risk path — NOT recommended):**

> PITR restore drill deferred to post-launch as Accepted MVP Risk. Owner __________ acknowledges no restore path has been proven end-to-end. Drill scheduled by __________ (within 30 days of launch). Compensating control: PITR enabled with 14-day window and Supabase-managed backups.

---

## 3. Storage Backup Posture

**Status:** ✅ Can be accepted for MVP with operator sign-off.

Current posture inventory:

| Layer | Backup mechanism | MVP acceptable? |
|---|---|---|
| Postgres database | Supabase managed daily backups + PITR (14 day window) | Yes, once PITR confirmed per §1 |
| Storage objects (user documents/media) | Supabase Storage provider-managed durability and replication | Yes for MVP |
| Storage objects — secondary app-managed copy | None | Yes — explicitly deferred |
| `exports/` bucket | Regenerable from source data; 7-day lifecycle via `process-expired-exports` | Yes |

**Recommendation: ACCEPT for MVP.** A secondary app-managed object backup (cross-region snapshot, cross-account replication) is a post-launch maturity item. It is not required to open the product provided the decision is disclosed and revisited.

**Post-launch action (recommend scheduling within Q1 after launch):**

- Evaluate scheduled object snapshot vs cross-region replication per `docs/AssetSafe_Data_Lifecycle_External_Controls_Runbook.md` §2
- Update `AssetSafe_Data_Lifecycle_External_Controls_Runbook.md` with the chosen posture

**Recommended checklist wording:**

> Storage backup posture accepted for MVP: Supabase managed DB backups + PITR for the Postgres layer, and Supabase Storage provider-managed durability/replication for object storage. No app-managed secondary object backup is provisioned for MVP; this is an explicit, disclosed deferral. Owner __________ has accepted this posture. Post-launch review to evaluate secondary object backup scheduled by __________.

---

## 4. Legal Retention Schedule

**Status:** ⚠️ Partially complete — operator/counsel sign-off required.

Implemented and current:

- `docs/AssetSafe_Retention_Deletion_Policy_Matrix.md` — technical retention matrix
- `docs/AssetSafe_Closure_Deletion_Table_Matrix.md` — per-table boundary decisions
- `docs/AssetSafe_Audit_Log_Retention_Runbook.md` — audit retention windows
- Legal hold fields and admin review workflow on `account_closure_requests` and `deleted_accounts`
- Retention/expiration sweepers (`process-retention-expirations`, `scrub-old-support-pii`, `process-account-closures`) all skip legal-hold accounts
- Public retention language in `src/pages/Terms.tsx` aligned to tombstone/anonymization model

Outstanding decisions requiring operator (and ideally counsel) sign-off:

- [ ] Retention matrix and closure/deletion boundary matrix accepted for MVP
- [ ] Counsel review status recorded: **completed** or **operator-accepted-pending-counsel**
- [ ] Legal hold confirmed to override deletion, anonymization, and expiration sweepers
- [ ] Decision on plaintext email retention in legal evidence (default: only if counsel approves; access-restricted)
- [ ] Decision on billing/Stripe evidence retention window (default: 7 years, tombstone-linked)

**Recommended checklist wording:**

> Legal retention schedule reviewed and accepted for MVP. Retention matrix (`docs/AssetSafe_Retention_Deletion_Policy_Matrix.md`) and closure/deletion boundary matrix (`docs/AssetSafe_Closure_Deletion_Table_Matrix.md`) accepted by owner __________ on __________. Counsel review: [ ] completed by __________ / [ ] pending — operator-accepted for MVP with counsel review scheduled by __________. Legal hold confirmed to block deletion, anonymization, and retention sweepers (verified in `process-account-closures`, `process-retention-expirations`, `scrub-old-support-pii`). Terms/Privacy language in `src/pages/Terms.tsx` aligns with implemented tombstone/anonymization model.

---

## Consolidated Sign-Off Table

Copy into launch notes and complete before flipping the launch gate.

| Control | Decision | Owner | Date | Evidence |
|---|---|---|---|---|
| PITR enabled (14-day window) | ☐ Confirmed |  |  | Dashboard screenshot |
| PITR restore drill | ☐ Passed / ☐ Accepted risk |  |  | `restore_drill_runs` row id or written acceptance |
| Storage backup posture | ☐ Accepted for MVP |  |  | This document + operator note |
| Legal retention schedule | ☐ Accepted for MVP |  |  | This document + counsel status |

---

## Cross-References

- Runbook: `docs/AssetSafe_Data_Lifecycle_External_Controls_Runbook.md`
- Retention: `docs/AssetSafe_Retention_Deletion_Policy_Matrix.md`
- Backup/restore: `docs/AssetSafe_Backup_Restore_Runbook.md`
- Ongoing gaps: `docs/AssetSafe_Data_Lifecycle_Retention_Operations_Review.md`
- Launch sign-off: `docs/AssetSafe_Launch_Operator_Signoff_Checklist.md`
