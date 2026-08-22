# Stage 2A — Admin CRM repoint to account_memberships

Scope: `src/components/admin/AdminUsers.tsx` only. No database changes, no other components, no Stage 2B/3/4 work. The `legacy_locker.delegate_user_id` mirror gap stays untouched.

## How the CRM derives relationships today (documented before change)

`loadData()` builds three things:

1. **Users tab** — all `profiles` rows, merged with `entitlements` (authoritative plan/status), `subscribers` (email fallback), and auth emails from the `admin-get-user-emails` edge function. AU status per user comes from `auMembershipMap` (first active non-owner `account_memberships` row whose owner has an active/trialing entitlement), falling back to a legacy `contributors` record. Fields set: `isContributor`, `contributorRole`, `ownerEmail`, `ownerName`, `ownerAccountNumber`.
2. **Authorized Users tab** — `ownersWithContributors`: owners are only bucketed when they have a profile AND an active/trialing entitlement (`ensureOwner`). Legacy `contributors` rows are pushed first; then active `account_memberships` rows are pushed, skipped when `contributor_user_id` or email already matches a contributor row (the de-dupe merge). Rows render AU name, AU account #, email, role badge, status, owner, owner account #, invited (`created_at`), accepted (`accepted_at`).
3. Gifts, payment events, support access reviews — untouched.

Constraints observed: only `status = 'active'` memberships are fetched today, so revoked AUs never appear. Role badges already normalize both vocabularies (`full_access`/`administrator` → FULL AU, `read_only`/`viewer` → VIEW AU). Legacy Admin is not displayed in this component at all (it lives in the admin legacy-continuity surfaces, and `legacy_admins` has no admin-role SELECT policy), so nothing about Legacy Admin display changes here.

## Changes

1. **Fetch memberships without the status filter**, selecting `id, account_id, user_id, role, status, email, created_at, accepted_at, revoked_at` plus `accounts!inner(owner_user_id, account_name)`. This adds revoked/pending rows for historical visibility.
2. **Rebuild the Authorized Users tab purely from `accounts` + `account_memberships` + `profiles`.** One row per membership row, keyed by membership `id` (structurally impossible to duplicate). Fields:
   - AU name / account # from the AU's `profiles` row; email from `subscribers` → auth emails → membership `email` column.
   - Role from the membership enum; status from the membership `status` (`active`, `revoked`, …).
   - Invited = membership `created_at`; Accepted = `accepted_at`.
   - Owner bucket derived from `accounts.owner_user_id`, same `ensureOwner` gating as today (profile exists + active/trialing entitlement) so account and owner counts are unchanged.
3. **Users tab AU derivation**: keep preferring an active non-owner membership (unchanged behavior); when none is active, fall back to the most recent non-active membership so a revoked AU is still shown attached to its owner instead of falling back to `contributors`. Remove the `contributorMap` / contributors fallback.
4. **Role labels**: extend the badge helper to emit the explicit `Full Access` / `Read Only` labels and drop the `administrator` / `contributor` / `viewer` branches once the contributors read is gone. Status badge treats `active` (and legacy `accepted`) as the default variant, revoked as destructive-secondary.
5. **Remove the `contributors` fetch, `ContributorRecord`-based merge, and de-dupe logic** — only after the validation below passes. Internal state names may keep their current spelling to keep the diff tight.
6. `AdminDatabase.tsx` keeps `contributors` in its table-stats list as a read-only count. No change.

## Validation (side-by-side, before removing the contributors merge)

Because `contributors` currently holds **0 rows**, the legacy merge contributes nothing today — so the before/after row sets must match exactly except for the intentional addition of non-active memberships. Checks run against the live database and the rendered admin panel:

- Owner accounts present in the Authorized Users tab before == after (owner set and count).
- Full Access AU `4df74d1f…` still attached to owner `2e62a796…` on account `35f0a6a4…`, labeled Full Access.
- Read Only AU `119929b9…` still listed, labeled Read Only.
- The revoked `full_access` membership on account `35082a28…` now appears with status `revoked` (new, historical — the only intended delta).
- Users tab total row count == `profiles` row count, unchanged; AU-flagged user count unchanged for active AUs.
- No duplicate AU rows: distinct membership `id` count == rendered row count.
- Legacy Admin surfaces (legacy-continuity admin panel) render exactly as before — not touched.

Verification will be done with a database query for the expected row set plus a browser pass over the admin panel's Users and Authorized Users tabs.

## Stop point

Report the before/after table and the one intended delta. No Stage 2B, 3, or 4 work without a new approval.
