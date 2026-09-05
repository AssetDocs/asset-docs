# Security Investigation — Public Admin Documents (`public/admin-docs/`)

Investigation only. Nothing was changed.

## A. Public document inventory

`public/admin-docs/` exists and contains exactly **11 PDF files** (matches the Automata finding):

| # | Filename | Type | Path |
|---|---|---|---|
| 1 | assumed-name-acknowledgment.pdf | PDF | public/admin-docs/assumed-name-acknowledgment.pdf |
| 2 | assumed-name-certificate.pdf | PDF | public/admin-docs/assumed-name-certificate.pdf |
| 3 | assumed-name.pdf | PDF | public/admin-docs/assumed-name.pdf |
| 4 | ein.pdf | PDF | public/admin-docs/ein.pdf |
| 5 | formation-document-ellidair-llc.pdf | PDF | public/admin-docs/formation-document-ellidair-llc.pdf |
| 6 | initial-resolutions-ellidair-llc.pdf | PDF | public/admin-docs/initial-resolutions-ellidair-llc.pdf |
| 7 | operating-agreement-ellidair-llc.pdf | PDF | public/admin-docs/operating-agreement-ellidair-llc.pdf |
| 8 | sos-transactions-1.pdf | PDF | public/admin-docs/sos-transactions-1.pdf |
| 9 | sos-transactions-2.pdf | PDF | public/admin-docs/sos-transactions-2.pdf |
| 10 | sos-transactions-3.pdf | PDF | public/admin-docs/sos-transactions-3.pdf |
| 11 | tx-vo-office-lease-ellidair-llc.pdf | PDF | public/admin-docs/tx-vo-office-lease-ellidair-llc.pdf |

No document contents were opened, quoted, or summarized. These are the only PDFs anywhere in the repository.

## B. Repository references

- `src/components/admin/AdminDocuments.tsx` — a hardcoded `STATIC_DOCUMENTS` array lists all 11 files by `/admin-docs/<file>.pdf` path (lines 15–27); the same file also defines `const BUCKET = 'admin-docs'` for uploaded documents.
- `src/components/admin/AdminOwnerWorkspace.tsx` — imports `AdminDocuments` and renders it in the owner workspace "Documents" tab.
- `supabase/migrations/20260719224907_...sql` — four storage policies referencing the `admin-docs` **bucket** (unrelated to the public folder, but same name).
- No other component, route, config, sitemap, or metadata file references these filenames. `public/robots.txt` disallows `/admin` and `/admin/*` only — it does **not** disallow `/admin-docs/`.

## C. Duplicate exposure

No duplicates. `public/` otherwise contains only `images/` (2 logos), `lovable-uploads/` (12 images), favicons, `placeholder.svg`, `robots.txt`, `sitemap.xml`, `_redirects`, and a stub `AssetDocsIntro2.mp4`. `src/assets/` contains logos and CDN asset pointers only. The `admin-docs` Supabase bucket is currently **empty** (0 objects), so no copy exists there either.

## D. Current admin dependency — what breaks if removed today

`AdminDocuments.tsx` is the only consumer. Removing the folder today would:

- Leave all 11 cards visible in the Admin Workspace "Documents" tab, since the list is hardcoded, not directory-driven.
- Break **View** (the dialog iframe would load a 404 / SPA fallback page) and **Download** (a 404 file) for all 11 static entries.
- Not throw JavaScript runtime errors and not affect uploads, deletes, or the rest of the workspace.

So the folder cannot be deleted alone — `STATIC_DOCUMENTS` must be removed or repointed in the same change, and the documents must first be re-uploaded into the private bucket if they should remain available.

## E. Current storage architecture

All 9 Supabase buckets are **private** (`public = false`):

| Bucket | Public | Purpose |
|---|---|---|
| admin-docs | no | admin/company documents (currently empty) |
| documents | no | customer documents |
| photos / videos | no | customer media |
| memory-safe | no | Memory Safe media |
| exports | no | generated export bundles |
| continuity-documents | no | continuity/legacy case files |
| external-assistance-docs | no | assistance documents |
| contact-attachments | no | contact-form attachments |

Customer document access is already **private bucket + short-lived signed URL**, never public URLs: `src/hooks/useSignedUrl.ts`, `src/services/StorageService.ts`, `usePropertyFiles.ts`, and many components. `supabase/functions/download-account-export-bundle/index.ts` shows the stronger pattern: RPC authorization first, then a service-role signed URL created server-side.

A suitable private admin-only bucket **already exists** (`admin-docs`), with SELECT/INSERT/UPDATE/DELETE storage policies restricted to `get_admin_role(auth.uid()) IN ('owner','admin','dev_lead')`. Nothing new needs to be created for basic private storage.

## F. Current admin authorization

- Role source: `get_admin_role(auth.uid())` (security-definer RPC), surfaced by `src/hooks/useAdminRole.ts`. Roles: owner, admin, dev_lead, developer, qa.
- Frontend: `src/components/admin/AdminShell.tsx` gates the workspace (`AdminPasswordGate` plus role checks) and restricts the **owner** workspace — where the Documents tab lives — to `hasOwnerAccess` (owner or admin).
- Database: the `admin-docs` bucket policies enforce owner/admin/dev_lead server-side, so uploaded documents are protected by RLS regardless of the UI.
- Gap: the 11 **static** PDFs bypass all of the above. They are plain files behind no authentication whatsoever — the frontend gate only hides the links, not the files.

Note: `dev_lead` can read/write the bucket via storage policy even though the owner workspace UI is owner/admin-only — a role mismatch worth deciding on.

## G. Git exposure

All 11 PDFs are **tracked by Git** (confirmed via `git ls-files`), and `public/admin-docs` appears in project history across two commits. `.gitignore` does not exclude them. Deleting them now removes them from the deployed build but **not** from history — repository-history cleanup is a separate decision.

## H. Additional security concerns

1. **Deployment exposure is real but currently not live-serving.** Files in `public/` are copied verbatim into the Vite build, so `public/admin-docs/ein.pdf` maps to `https://<domain>/admin-docs/ein.pdf` with no auth. At the moment `https://getassetsafe.com/` returns 404 for *everything* (root, robots.txt, favicon), i.e. the domain is not currently serving the built app, and the Lovable preview domain returns 401. So no public 200 response was observed today — but the exposure becomes immediate on publish. Treat this as unresolved, not safe.
2. `robots.txt` does not disallow `/admin-docs/`, so once served, crawlers could index the PDFs; search-engine and archive caches would then persist copies.
3. Static entries use permanent, guessable, unauthenticated URLs — filename knowledge alone grants access.
4. Uploaded documents are stored with `Date.now()`-prefixed filenames at the bucket root with no metadata table, so there is no audit trail of who uploaded, viewed, or deleted a company document.
5. No secret exposure found: no service-role key or privileged `VITE_*` variable in frontend code. The only match is a display-only label string in `SystemInfrastructure.tsx` listing `SUPABASE_SERVICE_ROLE_KEY` as a configured secret name (name only, no value). All storage calls from the browser use the anon key plus RLS.
6. Access control for the static files is effectively client-side-only (link hiding), which is the core finding.

## I. Recommended remediation sequence (proposal only)

1. Take a local, off-repo backup of the 11 PDFs.
2. Upload the 11 documents into the existing private `admin-docs` bucket (signed-in owner/admin, through the existing Upload button or a one-time controlled upload), under a `company/` prefix.
3. Verify each uploaded document opens through a signed URL in the Admin Workspace.
4. Remove the `STATIC_DOCUMENTS` array and the `source: 'static'` branch from `AdminDocuments.tsx` so every document flows through signed URLs.
5. Delete `public/admin-docs/` from the repository.
6. Optionally add a small `admin_documents` metadata table (display name, category, uploader, timestamps) plus access/delete audit logging.
7. Align role scope: decide whether `dev_lead` should retain bucket access; tighten policies to owner/admin if not.
8. Publish, then confirm `/admin-docs/*` returns 404 on all domains.
9. Separately decide on Git-history purge, and rotate/re-file anything considered compromised (the EIN and formation filings are largely public record; the operating agreement and lease are not).

## J. Files that would eventually need modification

- `src/components/admin/AdminDocuments.tsx` — drop static list, signed-URL-only, optional metadata/audit wiring.
- `public/admin-docs/*.pdf` (11 files) — delete from the repo.
- `public/robots.txt` — optional belt-and-braces `Disallow: /admin-docs/`.
- Optionally `src/components/admin/AdminOwnerWorkspace.tsx` (tab copy only) and a new metadata/service module if a table is added.

## K. Database/storage changes that would eventually be required

- Bucket: none required — private `admin-docs` already exists.
- Policies: optional narrowing from `('owner','admin','dev_lead')` to `('owner','admin')`.
- Optional new table `public.admin_documents` (+ GRANTs, RLS restricted via `get_admin_role`, updated_at trigger) for metadata.
- Optional audit logging of view/download/delete events.
- Optional Edge Function for server-mediated signed URLs and audit writes, mirroring `download-account-export-bundle`.
- No migration, bucket, or policy change is needed to simply remove the public exposure.

## L. Confirmation

Investigation complete. No code, storage, database, configuration, or document changes were made.
