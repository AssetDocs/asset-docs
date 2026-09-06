# Codex Remediation Branch Visibility — Investigation Report

Investigation only. No changes made.

## A. Is the Codex branch visible from the current Lovable project state?

**No.** Checked both the local repository and the remote:

- `git cat-file -t ee09007d...` → commit does not exist in the local object store.
- `git ls-remote origin` (live query of the remote) lists only: `main`, `_agent-publish`, and seven `lovable-backup-main-*` branches. **No `security/public-admin-docs-remediation` branch exists on the remote.**
- Local branches are only `main` and three `edit/edt-*` branches.

Conclusion: **Lovable cannot inspect the Codex branch.** It was never pushed to the origin remote this project is connected to. Codex likely committed it in a different clone/fork or a local repo and did not push.

## B. Are the remediation changes already in main?

**No.** Current `main` (= `origin/main` = `9de81376`, identical to the current edit branch) still contains the vulnerable state:

| Check | Status in main |
|---|---|
| `STATIC_DOCUMENTS` removed from `AdminDocuments.tsx` | NO — still present at line 15 with all 11 hardcoded `/admin-docs/*.pdf` entries |
| No direct `/admin-docs/...` public handling | NO — static paths still used; `allDocs = [...STATIC_DOCUMENTS, ...uploaded]` at line 115 |
| View/download via private bucket + signed URLs | Partially (uploaded docs already use signed URLs; static docs do not) |
| Per-document Delete | Exists for uploaded docs only; static branch still blocks it |
| 11 PDFs deleted from `public/admin-docs/` | NO — all 11 still present and tracked |
| Migration `20260905000100_narrow_admin_docs_storage_policies.sql` | NO — no matching file in `supabase/migrations/` |

## C. Where do the changes exist?

Only in the Codex environment where the commit was created. They are neither in `main` nor reachable from Lovable's remote.

## D. Differences between Lovable's plan and the Codex implementation

Cannot compare — the Codex commit content is unreachable, so none of its specifics (policy SQL, component changes, file deletions) can be verified against the plan. One naming note: the migration filename `20260905000100_...` matches the plan's intent (narrow admin-docs policies to owner/admin), suggesting Codex followed the plan closely, but this cannot be confirmed.

## E. Next action

Not to rerun the plan — the plan still stands. The required first step is:

1. Have Codex (or whoever has the branch) run `git push origin security/public-admin-docs-remediation` against this project's origin remote.
2. Once visible, Lovable reviews it against the checklist above, then it can be merged, deployed, and live URL verification completed.

Alternative if the branch cannot be pushed: Lovable re-implements the already-approved remediation plan directly on this project.
