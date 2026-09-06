# Codex Remediation Branch Visibility — Investigation Report (Re-run after app update)

Investigation only. No changes made. Re-run at 02:45 UTC after the user updated the app.

## A. Is the Codex branch visible from the current Lovable project state?

**No.** Re-checked after the update:

- `git cat-file -t ee09007d...` → commit still does not exist in the object store.
- Live `git ls-remote origin` still lists only: `main`, `_agent-publish`, and seven `lovable-backup-main-*` branches. **No `security/public-admin-docs-remediation` branch exists on the remote.**
- Local branches: `main` plus four `edit/edt-*` branches (a new edit branch `edt-156b9435` appeared with the update).

Conclusion: **Lovable still cannot inspect the Codex branch.** It has never been pushed to the origin remote this project is connected to.

## B. Are the remediation changes already in main?

**No.** Remote main advanced from `9de81376` to `b1109528` (new commits `155b3593 "Changes"` and `b1109528 "Update plan"`), and the working tree is in sync — but those commits did NOT include the remediation. Current state:

| Check | Status in main |
|---|---|
| `STATIC_DOCUMENTS` removed from `AdminDocuments.tsx` | NO — still present at line 15 with all 11 hardcoded `/admin-docs/*.pdf` entries |
| No direct `/admin-docs/...` public handling | NO — `source: 'static'` union still present; static branch still in handleView/handleDownload |
| View/download via private bucket + signed URLs | Partially (uploaded docs use 10-min signed URLs; static docs do not) |
| Per-document Delete | Exists for uploaded docs only; static branch blocks it |
| 11 PDFs deleted from `public/admin-docs/` | NO — all 11 still present and tracked |
| Migration `20260905000100_narrow_admin_docs_storage_policies.sql` | NO — no matching file in `supabase/migrations/` |

## C. Where do the changes exist?

Only in the Codex environment where the commit was created. Not in `main`, not on the remote, not reachable from Lovable.

## D. Differences between Lovable's plan and the Codex implementation

Cannot compare — the Codex commit content is unreachable. The migration filename in the user's description matches the plan's intent (narrow admin-docs storage policies to owner/admin), but nothing can be verified.

## E. Next action

The plan still stands. Required first step:

1. Have Codex (or whoever holds the branch) push it to this project's origin remote: `git push origin security/public-admin-docs-remediation`.
2. Once visible, Lovable reviews it against the checklist above, then it can be merged, deployed, and live URL verification completed.

Alternative if the branch cannot be pushed: Lovable re-implements the already-approved remediation plan directly on this project (remove STATIC_DOCUMENTS/static branches, add the owner/admin narrowing migration, delete the 11 public PDFs, verify).
