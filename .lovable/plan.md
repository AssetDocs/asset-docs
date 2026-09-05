# Remediation — Company documents out of the public build

Goal: no Asset Safe corporate PDF exists in the public site, and every company document in the Admin Workspace comes from the private `admin-docs` storage area, with access decided by the database rather than the screen.

## Investigation summary (already confirmed)

- `public/admin-docs/` holds 11 PDFs, all tracked in the repository.
- `src/components/admin/AdminDocuments.tsx` hardcodes those 11 as "static" entries and links them by plain URL; everything else in that tab already uses private storage with short-lived links.
- The private `admin-docs` storage area already exists and is not public; it is currently empty.
- Its access rules currently allow owner, admin and dev_lead.
- Nothing else in the project references these files, and there are no duplicate copies.
- Right now `getassetsafe.com` returns Not Found for everything (including the homepage and favicon), so no live exposure could be observed today; the exposure would become real on the next publish.

## One thing needed from you first

The 11 PDFs only exist in the repository. Once they are deleted, the Admin Workspace can only show documents that live in the private storage area, and only a signed-in owner/admin can put them there — I cannot upload on your behalf.

So the order is:

1. You download the 11 files from the current Admin Workspace Documents tab (or keep your own copies).
2. You re-upload them in that same tab using the existing Upload button — they land in the private storage area.
3. I then remove the static list and delete the public copies.

If you prefer, I can do steps 3 first and you upload afterwards; the tab would simply be empty in between. Tell me which order you want.

## What I will change

1. **Documents tab** — remove the hardcoded list and the "static" path entirely from `src/components/admin/AdminDocuments.tsx`. Listing, upload, view, download and delete all keep working, all through private storage with short-lived links. An empty state message replaces the previous hardcoded cards when nothing is uploaded yet.
2. **Access rules** — a database migration that narrows the four `admin-docs` storage rules from owner/admin/dev_lead to owner/admin only, still using the existing server-side role check. dev_lead, developer, QA, subscribers, Authorized Users and visitors are denied by the database, not by the screen.
3. **Public copies** — delete all 11 PDFs and the `public/admin-docs/` directory. No copies recreated anywhere in the site's static files or bundle.
4. **No robots.txt trick** — the old URLs will genuinely not exist. No robots entry is added as a substitute protection.
5. **No history rewrite** — repository history is left untouched, to be evaluated separately.

## Out of scope for this pass

No metadata table, no audit logging, no new server function, no UI redesign, no new document categories, no unrelated security changes.

## Verification I will run

- Repository search proving no remaining reference to `/admin-docs/<filename>` and no duplicate copies anywhere in static assets.
- Confirm `AdminDocuments.tsx` has no static branch and no public-URL usage.
- Confirm the storage area is still private and the new rules list only owner and admin, read back from the database after the migration.
- Confirm the build passes.
- Test the Documents tab in the browser for listing, upload, view, download and delete.
- Test all 11 former public URLs after deployment. If the production host is still offline, I will report that check as pending deployment rather than passing.

## Technical notes

- File edited: `src/components/admin/AdminDocuments.tsx` (drop `STATIC_DOCUMENTS`, the `source: 'static'` union member and its branches in `handleView`/`handleDownload`; `handleDelete` becomes available for every listed document).
- Files deleted: the 11 PDFs under `public/admin-docs/`.
- Migration: drop and recreate the four policies on `storage.objects` for `bucket_id = 'admin-docs'` with `public.get_admin_role(auth.uid()) IN ('owner','admin')`.
- Signed links stay at the existing 10-minute expiry, created client-side with the anon key under RLS; no service-role credential reaches the browser.
