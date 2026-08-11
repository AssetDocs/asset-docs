# Split "Notes & Traditions" into Notes + Family Traditions

## Audit findings (verified against the live database and source)

**Components / files**
- `src/components/NotesAndTraditions.tsx` (496 lines) — single component: fetch, add/edit dialog, delete, folder sidebar wiring.
- `src/components/NotesTraditionFolders.tsx` — folder sidebar ("Notes Organization", Create Folder, "All Notes & Traditions", folder list with counts, edit/delete).
- Reused modals: `CreateFolderModal`, `EditFolderModal`.
- Grid card: `src/components/LifeHubGrid.tsx` ("Notes & Traditions" → `onTabChange('notes-traditions')`).
- Tab host: `src/pages/Account.tsx` — tab `notes-traditions`, header copy at line 306, back-to-Family-Archive list at line 370, `TabsContent` at line 534.
- Quick Add: `src/components/DashboardQuickAdd.tsx` line 49 — "Note / Tradition" → `/account?tab=notes-traditions&add=1` (component accepts `autoOpenAdd`).
- Export: `src/services/ExportService.ts` reads `notes_traditions`, export folder `notes-traditions`.
- Delete: edge function `secure-delete-file` resource key `notes_tradition_attachment` → table `notes_traditions`.

**Tables**
- `public.notes_traditions`: `id, user_id, title, subject, holiday, content, folder_id, file_path, file_url, file_name, file_size, bucket_name, created_at, updated_at`, plus pending-delete columns. **No type/category discriminator exists** — notes and traditions are currently indistinguishable.
- `public.notes_tradition_folders`: `id, user_id, folder_name, description, gradient_color, created_at, updated_at`.

**RLS**
- `notes_traditions`: per-command policies on `auth.uid() = user_id`, plus `hide_pending_delete_notes_traditions`.
- `notes_tradition_folders`: single ALL policy `auth.uid() = user_id`.
- Scoping is **owner `user_id`**, not `account_id` — Family Archive is owner-scoped today. No change proposed.

**Storage**
- Attachments use the existing **private** `documents` bucket (all 9 buckets are private).
- Path built by `buildFamilyArchivePath()`: `{userId}/notes-traditions/{randomized-filename}`.
- No new bucket is needed. `family-traditions` becomes an additional path segment in the same bucket, so existing storage policies and signed-URL access apply unchanged. No file migration, no bucket rename/delete.

**Existing data**: 4 rows total — 0 with attachments, 0 assigned to a folder. Since no reliable note/tradition distinction exists, all 4 stay under **Notes** by default (no keyword inference, no content loss).

## Proposed change (smallest safe path)

**Migration (one column, no new tables)**
- Add `record_type text NOT NULL DEFAULT 'note'` to `public.notes_traditions`, constrained to `'note' | 'tradition'` (validation via CHECK on an immutable value set).
- Existing 4 rows become `record_type = 'note'`.
- Folders remain notes-only; `folder_id` is simply never set for traditions.
- No RLS/grant changes required (policies are column-agnostic).

**UI**
1. `LifeHubGrid.tsx`: replace the combined card with two cards, same visual style/color:
   - **Notes** — "Keep important thoughts, reminders, lists, instructions, and information in one place." CTA "View Notes" → tab `notes`.
   - **Family Traditions** — "Preserve family traditions, stories, customs, and meaningful routines." CTA "View Traditions" → tab `family-traditions`.
2. Rename `NotesAndTraditions.tsx` → `NotesSection.tsx`, filtering `record_type = 'note'`, writing `record_type: 'note'`; copy changed to Notes ("Add Note", "All Notes", "No notes yet"). Keeps the folder sidebar, folder dropdown, attachments, edit, delete.
3. New `FamilyTraditions.tsx` — reuses the same fetch/save/delete/attachment logic against the same table with `record_type = 'tradition'`; fields Title, Subject/Occasion, Holiday, Description, optional attachment. **No folder sidebar, no folder dropdown.** CTA "+ Add Tradition".
4. `NotesTraditionFolders.tsx`: title stays "Notes Organization"; "All Notes & Traditions" → "All Notes".
5. `Account.tsx`: replace tab `notes-traditions` with tabs `notes` and `family-traditions` (header copy + back-to-Family-Archive list + `TabsContent`), each passing `autoOpenAdd` from the existing `?add=1` consumption pattern.
6. `DashboardQuickAdd.tsx`: replace the single entry with **Note** → `/account?tab=notes&add=1` and **Family Tradition** → `/account?tab=family-traditions&add=1`.
7. Attachment paths: extend `buildFamilyArchivePath` section union with `'family-traditions'`; notes keep `notes-traditions` path segment so existing references stay valid.
8. `ExportService.ts`: keep reading the one table, split export folders by `record_type` (notes vs family-traditions) — copy only, same data.
9. Terminology sweep limited to this module: "Notes & Traditions", "Add Note or Tradition", "All Notes & Traditions". Family Archive subtitle unchanged.

**Untouched**: Auth, MFA, AU invitations, gifts, billing, retention/deletion behavior, storage buckets/policies, other Family Archive modules, `secure-delete-file` (same table, same resource key).

## Verification after implementation
Notes card opens Notes; Traditions card opens Family Traditions; folders create/edit/delete/filter in Notes only; no folder UI in Traditions; the 4 existing records appear under Notes; attachment upload/read/delete works in both; Quick Add routes and auto-opens the right dialog; `tsgo --noEmit` clean.

## Open decision
Migration and code will be submitted only after you approve this audit. The migration is a single additive column with a default — no data rewrite, no bucket work.
