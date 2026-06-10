## Corrected approach

Acknowledged: client-side DB-row-first deletion is wrong. Two systems (Postgres + Storage) cannot be made atomic from the browser. The fix is a **server-controlled, recoverable deletion state** behind a single typed edge function. Phase 3A will not proceed until this architecture lands.

---

## Shared foundation (lands before 3A)

### Migration 1 — `pending_delete` columns

Add to each in-scope table (only these, no broader sweep):

```sql
ALTER TABLE <t>
  ADD COLUMN pending_delete       boolean NOT NULL DEFAULT false,
  ADD COLUMN pending_delete_at    timestamptz,
  ADD COLUMN delete_error         text,
  ADD COLUMN delete_attempts      integer NOT NULL DEFAULT 0;

CREATE INDEX <t>_pending_delete_idx
  ON <t> (pending_delete) WHERE pending_delete = true;
```

Tables touched (limited to current phase scope):
- `property_files`, `user_documents` (3A)
- `memory_safe_items`, `family_recipes` attachments, `notes_traditions` attachments (3B — only if they own a storage object; pure-text rows are skipped)
- `vip_contact_attachments`, `paint_codes` (3C, contingent on audit)

Legacy Locker tables remain untouched (Secure Vault hardening owns them).

### Migration 2 — `NOT NULL` guardrails

Run only after read-query confirms zero NULLs (backfill the handful if needed):
- `property_files.bucket_name`, `property_files.file_path` → NOT NULL
- `user_documents.file_path` → NOT NULL
- `memory_safe_items.file_path` → NOT NULL (if clean)
- `vip_contact_attachments.file_path` → NOT NULL (if clean)
- `paint_codes.swatch_image_path` stays nullable (optional swatch)

### Edge function — `secure-delete-file`

Single entry point for all in-scope deletions. Client never names a table or bucket.

Input contract:
```ts
{ resource: ResourceKind, id: string }

type ResourceKind =
  | 'property_file'
  | 'user_document'
  | 'memory_safe_item'
  | 'family_recipe_attachment'
  | 'notes_tradition_attachment'
  | 'contact_attachment'
  | 'paint_code_swatch'
```

Server-side map (hard-coded, never client-supplied):
```
property_file              → property_files,            bucket from row, path: file_path
user_document              → user_documents,            bucket: documents, path: file_path
memory_safe_item           → memory_safe_items,         bucket: memory-safe, path: file_path
family_recipe_attachment   → <recipe attach table>,     bucket: documents,  path: file_path
notes_tradition_attachment → <notes attach table>,      bucket: documents,  path: file_path
contact_attachment         → vip_contact_attachments,   bucket: contact-attachments, path: file_path
paint_code_swatch          → paint_codes,               bucket: photos, path: swatch_image_path (nullable)
```

Flow per call:
1. Authenticate caller via `getClaims(token)`; reject if missing/invalid.
2. Look up resource by hard-coded table + `id` using a service-role client.
3. Authorize:
   - **Shared (3A):** require active membership in the row's `account_id` and a role of Owner or Full Access (Read Only rejected with 403).
   - **Owner-only (3B + paint_code_swatch + contact_attachment):** require `row.user_id === claims.sub`.
4. If row already `pending_delete=true`, skip ahead to step 6 (idempotent retry).
5. Mark `pending_delete=true`, `pending_delete_at=now()`, increment `delete_attempts`.
6. Read `bucket`, `path` from the now-pending row. If `path` is null/empty (e.g. paint code with no swatch), skip step 7.
7. `storage.remove([path])`:
   - Success → continue.
   - "Not found" / "Object does not exist" → treat as successful idempotent cleanup, continue.
   - Other failure → write `delete_error = <message>`, return HTTP 409 `{ retryable: true, code: 'storage_remove_failed' }`. Row stays as `pending_delete` with its path intact.
8. Delete the DB row (`DELETE … WHERE id = $1 AND pending_delete = true`).
9. Return `{ ok: true }`.

Authorization helpers reused from existing project patterns (`account_memberships` membership lookup, `has_role`-style checks). No new RLS policies are widened.

### RLS update

Add to every in-scope table's SELECT policies:
```
AND pending_delete = false
```
So list/detail UI never shows rows mid-deletion. Owner-only tables get the same predicate. Service role (used by the edge function) is unaffected.

---

## Phase 3A — Shared Asset Documentation

After the foundation lands:

- `PropertyService.deletePropertyFile` → calls `supabase.functions.invoke('secure-delete-file', { body: { resource: 'property_file', id } })`. Removes the storage call from client code entirely.
- `Documents.tsx` `confirmDelete` (single + bulk) → same call with `resource: 'user_document'`. Bulk path invokes per id and aggregates results.
- `usePropertyFiles.deleteFile` → same call; returns ok/retryable to caller.

User-facing messages (generic only):
- success → "File deleted."
- 409 retryable → "The file could not be fully deleted. Please try again."
- 403 → "You don't have permission to delete this file."
- other → "Something went wrong. Please try again."

No bucket name, no path, no provider error text reaches the toast.

## Phase 3B — Family Archive owner-only

Same pattern, owner-only authorization branch:
- `MemorySafe.tsx` → `resource: 'memory_safe_item'`
- `FamilyRecipes.tsx` attachment delete → `resource: 'family_recipe_attachment'` (only if it has a stored object)
- `NotesAndTraditions.tsx` attachment delete → `resource: 'notes_tradition_attachment'`
- `QuickNotesSection.tsx` → text-only rows; no edge function needed, plain DB delete kept (no storage object exists).

Owner-only RLS preserved. No cross-account access introduced.

## Phase 3C — Paint Codes & Contact Attachments (audit-then-wire)

Audit (read-only) before wiring:
- Paint codes: confirm `swatch_image_path` nullability, bucket path prefix, owner-only model.
- Contact attachments: confirm `file_path` column is reliably populated for both legacy and new rows; if not, plan a one-time backfill (separate, explicit) before switching the delete site.

Then:
- `PaintCodesSection.tsx` → `resource: 'paint_code_swatch'`. Null `swatch_image_path` skips storage step cleanly.
- `ContactAttachments.tsx` → `resource: 'contact_attachment'`. **Fix existing bug:** stop reconstructing path from `userId/contactId/file_name`; the edge function uses the row's stored `file_path`.

## Explicitly excluded

- Legacy Locker (governed by Secure Vault hardening).
- File registry table joining all DB rows ↔ storage objects.
- Quota reservation / two-phase upload commit.
- Background orphan sweeper (the pending_delete index supports a future retry job, but no scheduler is added now).
- Migrating existing storage paths.
- Any RLS broadening.

## Verification matrix (per resource, before closing each phase)

1. **Happy path** — row gone, object gone, success toast, no `pending_delete` rows left behind.
2. **Storage failure (controlled mock)** — inject a temporary deny via a service-role wrapper or a test-only bucket policy; expect:
   - row remains with `pending_delete=true`, `delete_error` populated, `delete_attempts=1`, `file_path` intact
   - generic retryable toast
   - list views hide the row
3. **Retry after storage recovers** — second invoke finalizes deletion; `delete_attempts=2`; row gone.
4. **Object already missing** — pre-delete the object out-of-band, then invoke; treated as success; row removed; no error.
5. **DB authorization denied** — Read Only AU (3A) or non-owner user (3B/3C) → 403, no storage call made, no `pending_delete` mutation.
6. **Bad input** — unknown `resource` or unknown `id` → 400/404, no side effects.
7. **Auth missing** — 401, no side effects.
8. **Account switch mid-flow** — resource lookup is keyed by row id; authorization re-checks current membership server-side; stale client account context cannot escalate.

Phase 3A begins only after the foundation migrations, the edge function, and its verification matrix pass.
