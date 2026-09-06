# Git State Correction — Public Admin Docs Remediation

Investigation only. No changes, no merge.

## Why the earlier report was wrong

Lovable's `origin` is **not** GitHub. It points at Lovable's internal git storage
(`git.private.lovable-gcp.code.storage/6cc71ded-...`), which mirrors only `main`,
`_agent-publish`, and `lovable-backup-main-*` snapshots. A `git ls-remote origin` there
returns 10 refs and will never show a GitHub feature branch, no matter how many times it
is refreshed. Your GitHub verification was correct; my remote was simply the wrong one.

Correction: the branch is readable via the GitHub API on `AssetDocs/asset-docs`, and all
findings below come from reading commit `ee09007d` directly from GitHub.

## A. Branch now visible: YES (via GitHub, not via Lovable's git remote)

- `GET /repos/AssetDocs/asset-docs/branches/security/public-admin-docs-remediation` → 200,
  head commit `ee09007d624d76a0650f937ce094550c0decfe41`.
- Commit message: `security: remove public admin documents and tighten storage access`
- Parent: `9de81376` — exactly the `main` tip before the newer commits. Confirms "1 ahead, 4 behind".
- Diff stat: 13 files, +121 / -45.

## B. Codex remediation confirmed: YES — all seven items verified

| Requirement | Confirmed |
|---|---|
| All 11 PDFs under `public/admin-docs/` deleted | YES — all 11 show status `removed`; directory has no remaining files |
| `STATIC_DOCUMENTS` and static `/admin-docs/...` handling removed | YES — array gone; `AdminDoc` is now `{ name, file }` with no `source` field |
| Private-bucket-only listing | YES — `loadUploaded()` is the sole source; `supabase.storage.from('admin-docs').list('')` |
| Signed-URL view/download | YES — both `handleView` and `handleDownload` call `getSignedUrl` (600s expiry); no public URL path remains |
| Delete capability | YES — improved: `AlertDialog` confirmation replaces the old `confirm()`, plus `deletingPath` guard against double-submit and optimistic list update |
| Migration `20260905000100_narrow_admin_docs_storage_policies.sql` | YES — added, 44 lines |
| Owner/admin-only storage access | YES — see below |

Migration content verified: it drops then recreates all four `storage.objects` policies
(SELECT / INSERT / UPDATE / DELETE), each scoped `TO authenticated` with
`bucket_id = 'admin-docs' AND public.get_admin_role(auth.uid()) IN ('owner', 'admin')`.
UPDATE correctly carries both `USING` and `WITH CHECK`. `dev_lead` is dropped in all four —
so `dev_lead`, `developer`, `qa`, ordinary subscribers, Authorized Users, and
unauthenticated visitors are all denied at the database layer, not just the UI.

## C. What the 4 newer main commits changed

`main` advanced `9de81376 → 155b3593 → b1109528 → a11c141d → e0dd3445`
("Changes" / "Update plan" pairs). Full cumulative diff `9de81376..origin/main`:

```text
 .lovable/plan.md | 63 ++++++++++++++++++++++++--------------------------------
 1 file changed, 27 insertions(+), 36 deletions(-)
```

That is the entire change set — my own edits to the plan document during this
investigation. **None** of the four commits touched `AdminDocuments.tsx`, admin role
logic, the `admin-docs` bucket, storage policies, or any migration.

## D. Does any conflict exist: NO

The branch changes `AdminDocuments.tsx`, adds one migration, deletes 11 PDFs. Main's newer
commits change only `.lovable/plan.md`. Disjoint file sets — a merge or rebase is
textually conflict-free.

## E. Should the branch be updated from main before merge

Not required for correctness, but **yes, do it anyway** — your instinct is right for a
security merge. Rebasing or merging main in costs nothing (plan-file-only delta) and gives
you a clean build against the exact tree that will ship. The only file that could move is
`.lovable/plan.md`, which the remediation branch never touched.

## Differences from the original plan (all improvements or neutral)

1. **Delete UX upgraded** — plan said "preserve existing UX"; Codex replaced the native
   `confirm()` with a shadcn `AlertDialog` and added in-flight protection. Better.
2. **Download error handling added** — the old `handleDownload` had no try/catch and would
   throw unhandled on a signing failure. Now it toasts.
3. **PDFs deleted without first uploading to the bucket.** This is the one operational gap.
   The plan sequenced "preserve/upload copies to the private bucket, verify, then delete".
   Codex deleted the repository copies in the same commit. The files are recoverable from
   git history at `9de81376`, so nothing is lost — but after merge the Documents tab will
   list zero documents until someone uploads the 11 PDFs into the private bucket.
4. No metadata table, no audit logging, no new edge function, no UI redesign, no history
   rewrite — correctly matching the plan's "do not implement in this phase" list.

## Recommended path (unchanged from your proposal, with one added step)

1. Retrieve the 11 PDFs from git history at `9de81376` (or from local copies).
2. Update the remediation branch from current `main`.
3. Clean build / typecheck.
4. Review and merge the PR.
5. Deploy.
6. **Upload the 11 PDFs into the private `admin-docs` bucket** via the Admin Workspace
   Documents tab, then verify list / view / download / delete all work signed.
7. Live-verify all 11 former `/admin-docs/<filename>.pdf` URLs return 404.
