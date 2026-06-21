# Asset Safe Backup & Restore Runbook

Status: launch operations runbook
Owner: Asset Safe operator / project owner
Production project: `leotcbfpqiekgkgumecn`
Drill cadence: quarterly before launch, then quarterly after launch
Reminder: `quarterly-restore-drill-reminder` checks monthly and emails ops when no passed drill is recorded in the last 90 days

## Targets

| Metric | Target |
|---|---:|
| DB RPO | 5 minutes or less |
| Storage RPO | 24 hours or less |
| DB RTO | 4 hours or less |
| Full app RTO | 8 hours or less |

## Restore Drill Ledger

Record every drill in `public.restore_drill_runs`.
Use `docs/AssetSafe_Restore_Drill_Reminder_Cron_Runbook.md` to install the reminder cron.

Required fields:

- `environment`: `prod`, `staging`, `scratch`, or `local`.
- `status`: `planned`, `in_progress`, `passed`, `failed`, or `cancelled`.
- `drill_type`: `pitr_to_scratch`, `logical_backup_restore`, or `full_app_restore`.
- `source_project_ref`, `target_project_ref`, `restore_point_at`.
- `started_at`, `completed_at`, `rpo_minutes`, `rto_minutes`.
- Smoke booleans: `db_smoke_passed`, `storage_smoke_passed`, `auth_smoke_passed`, `edge_smoke_passed`, `signed_url_smoke_passed`.
- `findings` and `follow_up_actions`.

Example start record:

```sql
insert into public.restore_drill_runs (
  environment,
  status,
  drill_type,
  source_project_ref,
  target_project_ref,
  restore_point_at,
  started_at,
  operator_user_id,
  notes
) values (
  'scratch',
  'in_progress',
  'pitr_to_scratch',
  'leotcbfpqiekgkgumecn',
  '<scratch-project-ref>',
  now() - interval '30 minutes',
  now(),
  auth.uid(),
  'Quarterly PITR drill'
);
```

## Quarterly PITR Drill

1. Pick a restore point from the last 24 hours.
2. Create or identify a scratch Supabase project.
3. Restore production PITR into the scratch project from the Supabase dashboard.
4. Apply any migrations that are newer than the restored point.
5. Deploy edge functions to scratch.
6. Set scratch secrets from the approved secret store.
7. Run smoke checks:
   - Login test user.
   - List properties.
   - Open one signed URL.
   - Invoke `check-subscription`.
   - Invoke `list-cron-job-health` as a dev/admin user.
8. Mark the `restore_drill_runs` row `passed` or `failed`.
9. Add findings and follow-up actions before closing the drill.

Example completion:

```sql
update public.restore_drill_runs
set
  status = 'passed',
  completed_at = now(),
  rpo_minutes = 5,
  rto_minutes = 180,
  db_smoke_passed = true,
  storage_smoke_passed = true,
  auth_smoke_passed = true,
  edge_smoke_passed = true,
  signed_url_smoke_passed = true,
  findings = array['No blocking restore issues found'],
  follow_up_actions = array[]::text[]
where id = '<restore_drill_run_id>';
```

## Production Restore Decision Gate

Production restore requires owner approval before any destructive change.

Before restore:

1. Confirm incident impact and desired restore point.
2. Export current production metadata/snapshot where available.
3. Activate global maintenance mode to freeze user writes and show the in-app notice.
4. Pause write-heavy scheduled jobs.
5. Confirm edge function and secret redeploy plan.
6. Confirm rollback path if the restore target is wrong.

Activate maintenance mode:

```sql
select public.activate_maintenance_mode(
  p_reason := 'Production restore',
  p_message := 'Asset Safe is performing maintenance. Your records remain available, but changes are temporarily paused.',
  p_ends_at := now() + interval '4 hours',
  p_metadata := jsonb_build_object('incident_id', '<incident-or-ticket-id>')
);
```

During restore:

1. Restore to a new project first whenever possible.
2. Run smoke checks against the restored project.
3. Switch production traffic only after owner approval.
4. Resume scheduled jobs after smoke checks pass.

After restore:

1. End maintenance mode.
2. Record RPO/RTO and findings in `restore_drill_runs`.
3. Review data changed after the restore point.
4. Notify affected users if any data loss window exists.
5. Write follow-up actions for any failed smoke check.

End maintenance mode:

```sql
select public.end_maintenance_mode();
```

## Known Gaps

- No cross-region storage snapshot controlled by the app exists yet.
- Scratch project secrets still require manual secure setup.
