# Asset Safe Data Lifecycle External Controls Runbook

Status: launch operations runbook
Owner: Asset Safe operator / project owner
Production project: `leotcbfpqiekgkgumecn`
Companion docs:
- `docs/AssetSafe_Data_Lifecycle_Retention_Operations.md`
- `docs/AssetSafe_Backup_Restore_Runbook.md`
- `docs/AssetSafe_Storage_Deletion_Cron_Runbook.md`
- `docs/AssetSafe_Key_Rotation_Runbook.md`
- `docs/AssetSafe_Security_Incident_Response_Runbook.md`
- `docs/AssetSafe_Vulnerability_Scan_Runbook.md`
- `docs/AssetSafe_Audit_Log_Retention_Runbook.md`
- `docs/AssetSafe_Legal_Request_Runbook.md`
- `docs/AssetSafe_Privacy_Request_DSAR_Runbook.md`
- `docs/AssetSafe_DMCA_Takedown_Runbook.md`
- `docs/AssetSafe_Terms_Privacy_Update_Runbook.md`
- `docs/AssetSafe_Mobile_Capacitor_Ops_Runbook.md`
- `docs/AssetSafe_Operational_Readiness_Sweep.md`

## Purpose

This runbook covers data lifecycle controls that cannot be completed by application code alone. These items require Supabase dashboard settings, cloud/storage configuration, legal review, or owner sign-off.

Use this checklist before launch, after major Supabase/storage changes, and during quarterly restore drills.

## Launch Gate Checklist

| Control | Launch gate | Evidence to keep |
|---|---|---|
| PITR enabled | Required before launch | Supabase dashboard screenshot or project settings export |
| PITR restore drill | Required before launch | `restore_drill_runs` row with `status = 'passed'` |
| Storage backup posture | Required before launch | Written decision: provider replication only vs secondary copy |
| Bucket lifecycle policy | Required before launch | Bucket inventory with retention/quarantine rules |
| Cron health verification | Required before launch | Admin screenshots or `cron_job_health` query result |
| Legal retention review | Required before launch | Counsel/operator sign-off on public retention schedule |
| Audit log retention review | Required before launch | `docs/AssetSafe_Audit_Log_Retention_Runbook.md` review notes |
| Legal request intake path | Required before launch | `docs/AssetSafe_Legal_Request_Runbook.md` owner/counsel path |
| Privacy request intake path | Required before launch | `docs/AssetSafe_Privacy_Request_DSAR_Runbook.md` owner/counsel path |
| Takedown/content complaint path | Required before launch | `docs/AssetSafe_DMCA_Takedown_Runbook.md` owner/counsel path |
| Terms/privacy update process | Required before launch | `docs/AssetSafe_Terms_Privacy_Update_Runbook.md` review notes |
| Mobile release/privacy review | Required before app-store launch | `docs/AssetSafe_Mobile_Capacitor_Ops_Runbook.md` launch gate |
| Incident contact path | Required before launch | Named owner and escalation email/group |

## 1. PITR And Restore Readiness

### Required setting

Confirm production Supabase PITR is enabled and the recovery window meets the current target:

| Phase | Target |
|---|---:|
| Pre-launch | 14 days |
| Post-launch | 28 days |

### Required pre-launch drill

Before launch, run one owner-operated restore drill from production into a scratch project. Follow `docs/AssetSafe_Backup_Restore_Runbook.md`.

The drill is not complete until:

1. A row exists in `public.restore_drill_runs`.
2. `status = 'passed'`.
3. `db_smoke_passed`, `storage_smoke_passed`, `auth_smoke_passed`, `edge_smoke_passed`, and `signed_url_smoke_passed` are all true.
4. `rpo_minutes` and `rto_minutes` are filled in.
5. Any findings have an owner or are explicitly accepted.

Verification query:

```sql
select
  id,
  environment,
  drill_type,
  status,
  restore_point_at,
  completed_at,
  rpo_minutes,
  rto_minutes,
  findings,
  follow_up_actions
from public.restore_drill_runs
where status = 'passed'
order by completed_at desc
limit 1;
```

## 2. Storage Backup And Replication Decision

Supabase Storage relies on the provider's managed durability and replication. Asset Safe does not currently maintain an app-owned secondary object copy.

Before launch, choose one of these positions and record it in the launch notes:

| Option | Recommendation | Tradeoff |
|---|---|---|
| Provider replication only | Acceptable for MVP if disclosed internally | Fastest, least operational load |
| Scheduled object snapshot | Recommended within quarter 1 | Better recovery posture, more cost/process |
| Cross-region object replication | Best for mature operations | More setup, monitoring, and storage spend |

Minimum launch evidence:

- Confirm the production storage bucket list.
- Confirm no bucket contains test-only or unmanaged production data.
- Record whether app-owned secondary snapshots are deferred or scheduled.

## 3. Bucket Inventory And Lifecycle Rules

Maintain the canonical bucket inventory in `storage_bucket_lifecycle_policies`. The Admin Database panel reads `get_storage_bucket_lifecycle_status` to compare that inventory with live `storage.buckets` rows and flag missing buckets or public/private mismatches.

For each bucket, record:

- Bucket name.
- Data class.
- Whether objects are user content, generated exports, quarantine/review objects, or system artifacts.
- Expected retention.
- Operational max bucket size and alert threshold.
- Whether objects are deleted by edge function, admin review, bucket lifecycle rule, or manual operator action.
- Whether public access is disabled.

Recommended launch inventory:

| Bucket/data area | Expected retention | Owner action |
|---|---|---|
| User document/media buckets | Active account lifetime, then hard delete after deletion grace | Confirm app delete paths enqueue or remove objects |
| `exports` | 7 days | Confirm `process-expired-exports` cron health |
| Orphan/quarantine prefixes, if used | 30 days after admin decision | Add bucket lifecycle rule or documented manual purge |
| Temporary/import buckets, if any | 7 to 30 days | Confirm not public and not used for permanent records |

Open launch decision:

- If Supabase bucket lifecycle rules are available for the production plan, configure auto-delete for `exports/` and quarantine/temp prefixes.
- If bucket lifecycle rules are not available, keep deletion in scheduled edge functions and document the manual fallback.
- After any bucket is added through the Storage UI, add or update the matching `storage_bucket_lifecycle_policies` row and confirm Admin Database reports the expected status and cap usage.

## 4. Cron Health Launch Verification

After deployment and cron installation, verify every data lifecycle sweeper has a recent success row.

Required jobs:

- `process-account-closures`
- `process-expired-exports`
- `process-storage-deletion-jobs`
- `process-storage-orphans`
- `process-storage-usage-drift`
- `process-retention-expirations`
- `scrub-old-support-pii`
- `quarterly-restore-drill-reminder`

Verification query:

```sql
select
  job_name,
  health_status,
  last_status,
  last_succeeded_at,
  minutes_since_success,
  last_error
from public.cron_job_health_status
where job_name in (
  'process-account-closures',
  'process-expired-exports',
  'process-storage-deletion-jobs',
  'process-storage-orphans',
  'process-storage-usage-drift',
  'process-retention-expirations',
  'scrub-old-support-pii',
  'quarterly-restore-drill-reminder'
)
order by job_name;
```

Launch criteria:

- No required job is missing.
- No required job has `health_status = 'critical'`.
- Any `warning` status has a named owner and accepted reason.

## 5. Legal And Retention Sign-Off

Before launch, the owner or counsel should review:

- Public retention language in `src/pages/Terms.tsx`.
- The deletion/anonymization policy in `docs/AssetSafe_Retention_Deletion_Policy_Matrix.md`.
- The table boundary decision record in `docs/AssetSafe_Closure_Deletion_Table_Matrix.md`.
- Legal hold controls for `account_closure_requests` and `deleted_accounts`.

Required decision points:

| Decision | Default |
|---|---|
| Keep `deleted_accounts` tombstones indefinitely or at least 7 years | Indefinite, minimized |
| Keep legal agreement evidence after deletion | Yes, tombstone-linked |
| Keep billing/Stripe evidence after deletion | Yes, tombstone-linked, 7 years |
| Keep plaintext email in legal evidence | Only if counsel approves; restrict access |
| Allow legal hold to block deletion/retention sweepers | Yes |

## 6. Alert Routing And Incident Ownership

The app records cron health and admin panels expose the major data lifecycle warnings. External paging or Slack routing remains an operational integration.

Security incident response is covered in `docs/AssetSafe_Security_Incident_Response_Runbook.md`. Secret rotation cadence, emergency rotation triggers, and post-rotation validation are covered in `docs/AssetSafe_Key_Rotation_Runbook.md`.

Minimum launch routing:

- One owner email for data lifecycle incidents.
- One backup recipient.
- A documented path for urgent storage deletion, restore, or legal hold failures.

Recommended first alerts:

| Signal | Suggested route |
|---|---|
| `process-account-closures` critical | Page/email owner |
| `process-expired-exports` critical | Email owner within same business day |
| Storage drift above threshold repeatedly | Slack/email ops |
| Restore drill overdue | Email owner monthly |
| Support PII scrubber failure | Email owner |

## 7. Manual Fallbacks

If a scheduled lifecycle job fails and cannot be fixed immediately:

1. Pause the related cron job if it is repeatedly failing.
2. Review `cron_job_health_status.last_error`.
3. Review edge function logs in Supabase.
4. Run the function manually with `dry_run` where supported.
5. Record the incident and resolution in launch/ops notes.
6. Re-enable cron only after a successful manual run.

If storage deletion is blocked:

1. Stop approving new orphan candidates.
2. Keep candidates in review state.
3. Confirm affected buckets and object paths.
4. Resume deletion only after `process-storage-deletion-jobs` succeeds.

If PITR restore is needed:

1. Activate maintenance mode.
2. Follow `docs/AssetSafe_Backup_Restore_Runbook.md`.
3. Record the restore as a `restore_drill_runs` row, even if it was a real incident rather than a drill.

## 8. Owner Sign-Off

Complete this section in launch notes or an internal ticket.

| Item | Owner | Date | Evidence |
|---|---|---|---|
| PITR enabled |  |  |  |
| PITR restore drill passed |  |  |  |
| Storage backup posture accepted |  |  |  |
| Bucket lifecycle policy accepted |  |  |  |
| Cron health verified |  |  |  |
| Legal retention schedule reviewed |  |  |  |
| Incident routing confirmed |  |  |  |
