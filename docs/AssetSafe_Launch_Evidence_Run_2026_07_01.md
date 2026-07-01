# Asset Safe Launch Evidence Run - 2026-07-01

Status: security operations / monitoring verification
Environment: production
Project ref: `leotcbfpqiekgkgumecn`

## Summary

This evidence run records the post-rotation lifecycle cron verification and the Resend webhook recovery work completed after Resend disabled the `leo` webhook endpoint for repeated `503 BOOT_ERROR` responses.

## Lifecycle Cron Health

The production `cron_job_health_status` check returned all 8 lifecycle jobs as healthy:

| Job | Health | Last status | Consecutive failures | Last error |
|---|---|---|---:|---|
| `process-account-closures` | `ok` | `succeeded` | `0` | `null` |
| `process-expired-exports` | `ok` | `succeeded` | `0` | `null` |
| `process-retention-expirations` | `ok` | `succeeded` | `0` | `null` |
| `process-storage-deletion-jobs` | `ok` | `succeeded` | `0` | `null` |
| `process-storage-orphans` | `ok` | `succeeded` | `0` | `null` |
| `process-storage-usage-drift` | `ok` | `succeeded` | `0` | `null` |
| `quarterly-restore-drill-reminder` | `ok` | `succeeded` | `0` | `null` |
| `scrub-old-support-pii` | `ok` | `succeeded` | `0` | `null` |

Evidence source: `Supabase Snippet Untitled query (8).csv`.

## Resend Webhook Recovery

Resend disabled the webhook endpoint:

`https://leotcbfpqiekgkgumecn.supabase.co/functions/v1/resend-webhook`

Observed provider failure:

- HTTP status: `503 - Service Unavailable`
- Response body: `{"code":"BOOT_ERROR","message":"Function failed to start (please check logs)"}`

Root cause:

- `supabase/functions/resend-webhook/index.ts` imported `corsHeaders` from `npm:@supabase/supabase-js@2/cors`.
- That subpath was not available at Edge Function boot time, so the function could fail before request handling.

Fix:

- Removed the fragile CORS import.
- Added a local `corsHeaders` constant in `supabase/functions/resend-webhook/index.ts`.
- Deployed `resend-webhook` to production.
- Committed and pushed as `748909f2 Fix Resend webhook boot error`.

Smoke verification:

| Request | Expected | Observed |
|---|---|---|
| `OPTIONS /functions/v1/resend-webhook` | Function boots and returns `200` | `200 ok` |
| Unsigned `POST /functions/v1/resend-webhook` | Function boots and rejects missing/invalid Svix signature | `401` |

The unsigned `401` is expected because `RESEND_WEBHOOK_SECRET` is active. A valid Resend webhook event should now be accepted when signed by Resend.

## Current Security-Ops Launch State

Ready / verified:

- Lifecycle cron jobs are scheduled and healthy after internal secret rotation.
- Resend webhook endpoint no longer boot-errors.
- Email deliverability events query path is operational.
- Security runbooks exist for key rotation, incident response, vulnerability scanning, and audit-log retention.
- Dependency audit is clean after targeted package updates.
- Production build succeeds on the patched dependency set.

## Dependency Audit And Build

Initial `npm audit --audit-level=high --production=false` found launch-blocking dependency findings, including:

- `jspdf` critical advisories.
- `@supabase/auth-js` high advisory through `@supabase/supabase-js`.
- Multiple high transitive findings in outdated build/tooling dependencies.
- A Vite/esbuild dev-server advisory.

Remediation applied:

| Package | Resulting version | Reason |
|---|---:|---|
| `@supabase/supabase-js` | `2.110.0` | Pulls patched `@supabase/auth-js` |
| `vite` | `6.4.3` | Smallest patched 6.x line for the dev-server advisory |
| `@vitejs/plugin-react-swc` | `4.3.1` | Vite 6 compatible current plugin |
| `lovable-tagger` | `1.3.1` | Vite 6 compatible current plugin |
| `jspdf` | `4.2.1` | Clears critical PDF-generation advisories |
| `dompurify` | `3.4.11` | Clears sanitizer advisories |

Verification:

```text
npm audit --audit-level=high --production=false
found 0 vulnerabilities
```

Production build:

```text
npm run build
vite v6.4.3 building for production...
3239 modules transformed.
built successfully
```

Build notes:

- Vite reported existing large chunk warnings.
- Vite reported one existing dynamic/static import chunking warning for `src/lib/continuityNotifications.ts`.
- Browserslist data is 6 months old; update during normal dependency maintenance.
- No compile failure occurred after the dependency updates.

Remaining operator actions:

- Record the approved long-term production secret manager and access owner.
- Run the pre-launch ZAP/manual vulnerability scan against staging and triage High/Critical findings.
- Schedule or complete the launch incident tabletop.
- Decide when to remove the legacy service-role fallback from the internal cron auth helper.
- Confirm provider audit-log review evidence after recent secret/webhook changes.
