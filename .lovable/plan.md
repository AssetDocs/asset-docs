# Remaining User-Visible AU Terminology Cleanup

Most of the approved copy changes are already present in the working tree (ActivityLog tab reads "Authorized Users", subscriptionFeatures descriptions, AdminContributorPlanInfo badges, LegacyLocker notice, FAQAccordion, Features, DemoLegacyLocker, SampleDashboard). What remains are a few admin-facing labels and descriptive strings.

## Changes

**src/components/admin/SystemInfrastructure.tsx**
- Rename the edge-function category label `Contributors` to `Authorized Users` (list entries + the badge color map key), keeping function names (`send-contributor-invitation`, etc.) unchanged since those are real deployed function identifiers.
- Reword purposes: "Invite contributors to account" to "Invite Authorized Users to account"; "Accept contributor invite" to "Accept Authorized User invite"; delegate rows reworded to Legacy Admin recovery notifications/acknowledgment.
- Email row `type: 'Contributor Invite'` to `'Authorized User Invite'` (function name unchanged).

**src/components/admin/SystemArchitectureFlowcharts.tsx**
- Keep all technical node labels that name real artifacts (`send-contributor-invitation`, `contributors table`, `has_contributor_access()`, `contributor_role enum`, `ContributorContext.tsx`, `/auth?mode=contributor`) exactly as-is.
- Update descriptive prose only: the vault section description and legend text change "delegate recovery system" / "Delegate" wording to Legacy Admin, stated as available only through the approved recovery process, with no standing Secure Vault access.

**src/components/admin/legacy-continuity/constants.ts**
- "Requires Continuity Administrator permission." to "Requires Legacy Admin permission." for the three gated actions (copy only).

**src/pages/AccountSettings.tsx**
- Header subtitle keeps the same meaning; no role-name change needed (already "Read Only Access" / "Full Access"). No edit unless the "Viewing ..." string is judged confusing — leaving it as-is.

## Out of scope (unchanged)
Internal identifiers and dormant infrastructure: `OwnerWithContributors`, `ownersWithContributors`, `contributorSearchTerm`, `isContributor*`, `useContributor`, `ContributorProvider`, `hasContributors`, `has_contributors`, `CONTRIBUTOR_LIMITS`, `getContributorLimit`, `checkContributorLimit`, action/event keys (`contributor`, `contributor_access`, `contributor_invite`, `contributor_remove`), `contributors` table, `contributor_role`, `has_contributor_access()`, contributor invite/signup edge functions, legacy auth/signup pages.

No permission, RLS, `account_memberships`, Legacy Admin recovery, Secure Vault, deletion authorization, or export behavior changes.

## Verification
`bunx tsgo` typecheck, `bun run build`, grep to confirm the replaced strings, then report the new `origin/main` SHA once the platform sync advances past `473788f3618c863d596427d07709c655dc19ee2d`.
