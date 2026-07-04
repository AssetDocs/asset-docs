
# Plan: Stand up staging environment, then seed ZAP test accounts

You picked "stand up a new staging Supabase project first" and confirmed both expired/read-only and deletion-hold flows are in scope. The current repo is wired to production Supabase (`leotcbfpqiekgkgumecn`) only, so no staging accounts can be created yet — this plan gets staging to a state where seeding is safe, then seeds the 6 accounts.

## Phase 1 — Operator actions (I cannot do these from the repo)

You (or the platform owner) must complete these before I run anything. They involve Supabase org billing, Stripe test-mode keys, Resend domain, and a Lovable environment split, none of which the agent can provision.

1. Create a new Supabase project — e.g. `assetsafe-staging` — in the same org. Capture the new project ref (must not equal `leotcbfpqiekgkgumecn`).
2. Apply the current production schema to staging: `supabase db dump --project-ref leotcbfpqiekgkgumecn --schema public,storage --data=false > /tmp/prod-schema.sql`, then apply against the staging ref. Do NOT copy production data.
3. Create staging-only equivalents of every required Edge Function secret from the production list (Stripe **test-mode** keys, Resend key scoped to a staging sender, `ASSETSAFE_SECRET_KEYS`, internal cron secret, etc.). Never reuse production secrets.
4. Create a staging Lovable deployment/preview pointed at the staging Supabase ref (separate `.env` with the staging `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` / `VITE_SUPABASE_PROJECT_ID`). Capture the staging app URL.
5. Confirm in writing: staging contains no production PII and no production uploads.
6. Share back: staging app URL, staging Supabase project ref, staging anon key (for the seed script), and confirmation of items 3 and 5.

Until step 6 lands, I will not touch any database — creating accounts against production would violate the Vulnerability Scan Runbook.

## Phase 2 — Seed the 6 test accounts (agent, on staging only)

Once you hand me the staging ref + URL, I will:

1. Add a hard guard to the seed script: refuse to run if the target ref equals `leotcbfpqiekgkgumecn` or if the URL host matches any production/custom domain.
2. Create a one-off Deno seed script (run locally against staging with the staging service-role key you paste at run time — not committed) that provisions:

   | Role | Email | How it's set up |
   |---|---|---|
   | Owner | `owner-staging@assetsafe.test` | `auth.admin.createUser` (email_confirm=true), profile row, own `accounts` row, `account_memberships` role=`owner`, entitlement=active paid plan |
   | Authorized User / Full Access | `authorized-full-staging@assetsafe.test` | Created, then added to Owner's account via `account_memberships` role=`full_access` |
   | Read Only | `readonly-staging@assetsafe.test` | Created, added to Owner's account with role=`read_only` |
   | Admin | `admin-staging@assetsafe.test` | Created, own account, `user_roles` row with `role='admin'` (per `has_role` pattern) |
   | Expired / read-only | `expired-staging@assetsafe.test` | Created with own account; entitlement set to expired/past_due and subscriber row flagged inactive so the app enforces read-only |
   | Deletion-hold / legal-hold | `deletion-hold-staging@assetsafe.test` | Created with own account; row inserted in `account_deletion_requests` (or `account_closure_requests`) in a hold state, plus any legal-hold flag your closure flow uses |

3. Print — and I will paste back into chat — the resulting `user_id`, `account_id`, role, and state for each account. No passwords or tokens in chat; passwords are randomly generated per account and provided to you once via secure channel.
4. Update `docs/AssetSafe_Vulnerability_Scan_Evidence_Pending.md` with:
   - Staging app URL, staging Supabase ref
   - "Non-production data only: confirmed by <you>, <date>"
   - The account matrix with real emails and user IDs
   - Expired/read-only: available. Deletion-hold: available.
   - ZAP scope: staging only, active scanning approved for staging, prohibited on production.

## Phase 3 — Pre-scan sanity checks (agent)

Before you kick off ZAP:

- Log in as each seeded account via Playwright against the staging URL and screenshot the landing dashboard to prove the role gate works (owner sees owner UI, read-only can't see write buttons, expired sees the expired state, deletion-hold sees the hold banner, admin sees `/admin`).
- Confirm the staging `supabase/client.ts` env resolves to the staging ref (not prod) by reading the built bundle.

## What I need from you to move to build mode

- Staging Supabase project ref
- Staging app URL
- Written confirmation staging has no production data
- Green light to run the seed script

Once those four are provided I'll switch to build mode and execute Phase 2 + Phase 3.
