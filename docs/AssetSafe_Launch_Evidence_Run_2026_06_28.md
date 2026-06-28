# Asset Safe Launch Evidence Run - 2026-06-28

Status: security operations / lifecycle cron verification
Environment: production
Project ref: `leotcbfpqiekgkgumecn`

## Summary

Production lifecycle cron authentication was migrated away from the legacy service-role-key-as-cron-secret pattern. The cron jobs now authenticate with a fresh AssetSafe internal secret value stored in Supabase Edge Function Secrets as `assetsafe_secret_keys` or `ASSETSAFE_SECRET_KEYS`.

The secret was rotated after possible exposure in SQL verification output. All eight lifecycle cron jobs were unscheduled and recreated with the fresh secret in the `x-internal-secret` header.

## Code Changes Verified

- `aee00595` - `Use AssetSafe secret key for cron auth`
- `b9aa57ed` - `Accept platform Supabase secret keys for cron auth`
- `a7c4e86a` - `Accept lowercase AssetSafe secret key env`
- `ea9c4eb2` - `Remove temporary internal auth diagnostics`
- `6cda6af4` - `Use Storage API for account cleanup prefix scan`

Final state:

- `isAuthorizedInternalCall(req)` accepts `ASSETSAFE_SECRET_KEYS`, lowercase `assetsafe_secret_keys`, platform `SUPABASE_SECRET_KEYS`, and legacy `SUPABASE_SERVICE_ROLE_KEY` only as a transition fallback.
- Temporary diagnostic responses were removed.
- `delete-account` uses Supabase Storage API bucket listing for account cleanup prefix scans instead of querying `storage.objects` directly.

## Edge Functions Redeployed

The following functions were deployed to production after the auth helper updates:

- `check-gift-reminders`
- `check-grace-period-expiry`
- `check-payment-failures`
- `delete-account`
- `process-account-closures`
- `process-expired-exports`
- `process-retention-expirations`
- `process-storage-deletion-jobs`
- `process-storage-orphans`
- `process-storage-usage-drift`
- `quarterly-restore-drill-reminder`
- `scrub-old-support-pii`

## Database / Storage Prerequisites Confirmed

- Private `exports` bucket exists.
- `20260622113000_expire_account_export_bundles.sql` was applied after `process-expired-exports` initially failed on missing RPC `public.expire_account_export_bundles(p_dry_run, p_limit)`.
- PostgREST schema cache was reloaded after the RPC migration.

## Cron Jobs Recreated

The following cron jobs were recreated with the fresh internal secret:

- `process-storage-deletion-jobs-prod`
- `process-expired-exports`
- `process-account-closures-prod`
- `process-storage-usage-drift-prod`
- `process-storage-orphans-prod`
- `process-retention-expirations-prod`
- `scrub-old-support-pii-prod`
- `quarterly-restore-drill-reminder`

Verification query should not include `cron.job.command` because it contains the embedded secret. Use `jobid`, `jobname`, `schedule`, and `active` only.

## Manual Smoke Results

Manual and scheduled `net.http_post` checks were verified through `net._http_response`.

Latest observed healthy response range:

- IDs `2117` through `2124` returned `status_code = 200`.
- Older `401` rows were stale calls from before the final secret correction and rotation.

Function-specific checks:

- `process-storage-deletion-jobs`: HTTP `200`
- `process-expired-exports`: HTTP `200`
- `process-storage-usage-drift`: HTTP `200`
- `process-account-closures`: HTTP `200`
- `quarterly-restore-drill-reminder`: HTTP `200`
- `scrub-old-support-pii`: HTTP `200`

`process-account-closures` previously returned `207` because `delete-account` could not query `storage.objects`; after the Storage API prefix-scan fix and redeploy, it returned HTTP `200`.

## Cron Health Snapshot

Observed after recreation:

- `process-account-closures`: `ok`, `succeeded`
- `process-expired-exports`: `ok`, `succeeded`
- `process-storage-deletion-jobs`: `ok`, `succeeded`
- `quarterly-restore-drill-reminder`: `ok`, `succeeded`
- `scrub-old-support-pii`: `ok`, `succeeded`
- `process-retention-expirations`: `page`, `succeeded`, `consecutive_failures = 0`, `last_error = null`
- `process-storage-orphans`: `page`, `succeeded`, `consecutive_failures = 0`, `last_error = null`
- `process-storage-usage-drift`: `page`, `succeeded`, `consecutive_failures = 0`, `last_error = null`

Interpretation: the `page` rows were stale-window health statuses, not active failures, because their last observed status was `succeeded` and no consecutive failures were present. Re-check after each job's next scheduled window.

## Security Notes

- Do not use the legacy service-role key as the lifecycle cron `x-internal-secret`.
- Do not select or screenshot `cron.job.command`.
- If the internal cron secret is exposed, immediately create a fresh secret, update Edge Function Secrets, unschedule/recreate all lifecycle cron jobs, and verify new `net._http_response` rows return HTTP `200`.

## Follow-Ups

- Re-run `cron_job_health_status` after the next retention, orphan, and usage-drift scheduled windows.
- Consider removing legacy service-role fallback from `isAuthorizedInternalCall(req)` after one stable rotation cycle.
- Consider standardizing on uppercase `ASSETSAFE_SECRET_KEYS` later for consistency, while keeping lowercase support until all operators are trained.
