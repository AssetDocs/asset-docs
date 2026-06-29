# Asset Safe Launch Evidence Run - 2026-06-29

Status: managed account export verification
Environment: production
Project ref: `leotcbfpqiekgkgumecn`

## Summary

The **Export Account Archive** CTA was retested after fixing the managed export upload/download path. The export completed successfully and produced a managed bundle row in `account_export_audit`.

## Fixes Verified

- `f46d81cd` - `Use create-only upload for managed exports`
- `3e613a31` - `Harden managed export download path`
- `74b120bb` - `Fix account export bundle download counter`
- `ea97382d` - `Use service role JWT for export signed URLs`

## Successful Export Evidence

Newest `account_export_audit` row:

| Field | Value |
|---|---|
| `id` | `1aa29a6c-127c-4943-8cb4-e9159ed7f8bf` |
| `status` | `ready` |
| `storage_bucket` | `exports` |
| `storage_path` | `dbf24c5f-6469-4db4-b0e5-888c5ec7b679/1aa29a6c-127c-4943-8cb4-e9159ed7f8bf/asset-safe-export-2026-06-29.zip` |
| `bundle_file_name` | `asset-safe-backup-2026-06-29.zip` |
| `bundle_size_bytes` | `6805` |
| `expires_at` | `2026-07-06 03:28:12.97998+00` |
| `download_count` / `download_limit` | `1 / 5` |
| `last_downloaded_at` | `2026-06-29 03:28:13.954083+00` |
| `error_message` | `null` |

## Failure Trail Resolved

The earlier failed rows captured the launch-blocking issues in order:

- Storage RLS rejected browser uploads while the upload used overwrite semantics.
- `download-account-export-bundle` initially returned only a generic non-2xx error.
- `consume_account_export_bundle` had an ambiguous `download_count` reference.
- Storage signed URL creation failed when a non-JWT `sb_secret_...` key was used for the Supabase admin client.

Final production state:

- Browser managed export upload succeeds into the private `exports` bucket.
- `consume_account_export_bundle` increments `download_count`.
- `download-account-export-bundle` creates a signed URL using the service-role JWT.
- The user-facing export completes and downloads successfully.

## Remaining Follow-Up

- Allow `process-expired-exports` to expire this bundle after the 7-day TTL or manually verify against a test row if launch evidence requires expiry behavior before July 6, 2026.
- Keep failed export rows as useful launch-debug evidence unless an operator chooses to redact/annotate them later.
