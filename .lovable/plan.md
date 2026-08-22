# Next AU Cleanup Pass

## Priority 1 — Fix PeopleActivityCard runtime bug

`src/components/PeopleActivityCard.tsx` renders `loadingContributors` and `contributors` (lines ~175-206) while state is `loadingUsers` / `authorizedUsers`. Replace the stale render references with the current variables. No query, permission, or membership logic changes. Then attempt removing `// @ts-nocheck`; if it exposes unrelated errors, keep it and report.

## Priority 2 — User-visible terminology only

- `subscriptionFeatures.ts` — `contributor_roles.description` → "Invite authorized users (spouse, adult child, planner) to your account". Keep `CONTRIBUTOR_LIMITS` / `getContributorLimit` / `checkContributorLimit` identifiers.
- `ActivityLog.tsx` — tab label "Contributors" → "Authorized Users"; description and info copy reworded. Keep `action_category === 'contributor'` filter values.
- `ActivityLogList.tsx` — "By contributor:" → "By authorized user:"; visible labels for `contributor`/`contributor_access` cases reworded. Keep case keys.
- `AccountSettings.tsx` — role label "Contributor Access" → "Full Access", "Viewer Access" → "Read Only"; comment wording. Keep `isContributorRole` alias and `AdminContributorPlanInfo` import.
- `FAQAccordion.tsx` — 4 copy spots: trusted contacts/contributors → Authorized Users; encryption Q&A reworded so only owner or approved Legacy Admin can unlock.
- `LegacyLocker.tsx` — encryption notices: "Contributors will not be able to view…" → "Authorized Users cannot view encrypted data…"; unencrypted variant → "Authorized Users with access can view this data."
- `DemoLegacyLocker.tsx` — bullet → "Control whether Authorized Users can access this information".
- `SampleDashboard.tsx` — two demo strings: "Invite contributors" → "Invite Authorized Users".
- Admin `SystemInfrastructure.tsx` — role text "(viewer/contributor/administrator)" → "(Read Only / Full Access)"; premium copy "Contributor roles" → "Authorized User roles". Keep edge-function names, categories, and dormant-table rows as-is.
- Admin `SystemArchitectureFlowcharts.tsx` — flow titles/labels and the role matrix relabeled to Authorized User / Read Only / Full Access, with continuity nodes described as Legacy Admin. Keep function names, `contributors` table node, `has_contributor_access()`, `contributor_role` references (dormant Stage 3/4 infrastructure documentation).

Note: `src/components/Features.tsx` does not exist; no equivalent contributor copy found in `FeaturesList.tsx`/`FeaturesSection.tsx` — will confirm during the scan.

## Explicitly unchanged

AU permissions, `account_memberships`, Full Access / Read Only behavior, Legacy Admin eligibility & recovery, Secure Vault RLS, encryption/passphrase behavior, deletion authorization, export behavior. Internal aliases retained: `OwnerWithContributors`, `ownersWithContributors`, `contributorSearchTerm`, iterator names, `has_contributors`, plus dormant `contributors` table, `contributor_role`, `has_contributor_access`, contributor invite/signup edge functions.

## Verification

Typecheck (`tsgo`), production build, confirm PeopleActivityCard has no `contributors`/`loadingContributors` render refs, repo-wide scan for remaining user-visible contributor-era terminology, report retained internal/dormant terminology separately, and return the new origin/main commit SHA.
