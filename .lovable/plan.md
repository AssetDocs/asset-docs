
# Asset Safe — Supabase Storage Audit Report

Based on live inspection of: all 6 storage buckets, all 24 `storage.objects` RLS policies, actual file path structures in production, and the full frontend access model.

---

## PART 1 — Bucket Inventory

| Bucket | Public | File Size Limit | MIME Type Restriction | Purpose |
|--------|--------|-----------------|----------------------|---------|
| `photos` | **No** | None set | None set at bucket level | Property photos |
| `videos` | **No** | None set | None set | Property videos |
| `documents` | **No** | None set | None set | Property documents, receipts, voice notes |
| `floor-plans` | **No** | None set | None set | Property floor plans |
| `contact-attachments` | **No** | None set | None set | VIP contact attachments |
| `memory-safe` | **No** | None set | None set | Memory Safe uploads |

All 6 buckets are private. No bucket is public. This is correct.

**Finding:** No bucket has `file_size_limit` or `allowed_mime_types` set at the bucket configuration level. MIME type enforcement and file size limits are enforced entirely in the frontend (`StorageService.FILE_VALIDATION_OPTIONS`). This is a frontend-only control — it can be bypassed by any direct API call to Supabase Storage.

---

## PART 2 — Storage RLS Policies (Full Inventory)

All 24 policies on `storage.objects` follow the same uniform pattern. Each bucket has exactly 4 operations:

```
USING / WITH CHECK: (bucket_id = '<name>') AND (auth.uid()::text = storage.foldername(name)[1])
```

`storage.foldername(name)[1]` is equivalent to `path_tokens[1]` — it extracts the first folder component of the file path. Since all uploads go to `{userId}/{filename}`, this checks that the first path segment equals the requesting user's UUID.

**Full matrix of confirmed policies:**

| Bucket | SELECT | INSERT | UPDATE | DELETE |
|--------|--------|--------|--------|--------|
| `photos` | owner (path[1]) | owner (path[1]) | owner (path[1]) | owner (path[1]) |
| `videos` | owner (path[1]) | owner (path[1]) | owner (path[1]) | owner (path[1]) |
| `documents` | owner (path[1]) | owner (path[1]) | owner (path[1]) | owner (path[1]) |
| `floor-plans` | owner (path[1]) | owner (path[1]) | owner (path[1]) | owner (path[1]) |
| `contact-attachments` | owner (path[1]) | owner (path[1]) | owner (path[1]) | owner (path[1]) |
| `memory-safe` | owner (path[1]) | owner (path[1]) | owner (path[1]) | owner (path[1]) |

**Critical observation:** There are zero contributor-aware policies on `storage.objects`. Every policy only allows `auth.uid() = path_tokens[1]`.

---

## PART 3 — File Path Structure (Confirmed From Production)

From live inspection of `storage.objects`:

```
photos/
  {user_id}/{timestamp}-{filename}                         ← depth 2, standard
  {user_id}/legacy-locker/{timestamp}-{filename}           ← depth 3, legacy locker files
  {user_id}/{timestamp}-{property_id}_{timestamp}-{name}  ← depth 2, property-keyed

documents/
  {user_id}/{timestamp}-{filename}                         ← depth 2, flat
  {user_id}/{property_id}/{timestamp}-{filename}           ← depth 3, folder-keyed

memory-safe/
  (no files yet in production)
```

**Key structural finding:** The path structure is `{user_id}/...` — ownership is encoded only in the first path token. There is no `property_id` in the storage path for isolation between properties of the same user. Multiple properties share a flat `{user_id}/` namespace within each bucket.

**Stored URLs:** The 5 existing `property_files` records all store full signed URL strings with JWT tokens in the `file_url` column. These tokens expired 24 hours after upload (`exp` in the JWT payload confirms this). The `usePropertyFiles` hook refreshes them on every fetch via `refreshSignedUrls()` — this is correct behavior.

---

## PART 4 — Identified Issues

### ISSUE-S1 — Contributor file access is completely broken at the storage layer — **HIGH**

**What happens:**
1. A contributor (uid: `e9e5fe4f`) is granted `viewer` access to an account owner's account (uid: `5950acba`).
2. The contributor can SELECT rows from `property_files` — the table-level RLS allows this via `has_contributor_access`.
3. The contributor's frontend calls `useSignedUrl('photos', file_path)` or `supabase.storage.createSignedUrls(paths, 3600)`.
4. The storage RLS policy evaluates: `auth.uid()::text = storage.foldername(name)[1]` → `e9e5fe4f != 5950acba` → **DENIED**.

The storage layer blocks contributors from generating signed URLs for the account owner's files. Contributors can see the metadata (file names, descriptions, tags) in `property_files` but cannot view, render, or download the actual files. All media will silently fail to load for contributors.

There is no contributor-aware policy on `storage.objects`. The signed URL generation requires the requesting user to be the path owner.

**Risk:** High — contributors see broken images and unloadable documents; access works on table RLS but fails on storage.

---

### ISSUE-S2 — No bucket-level MIME type or size enforcement — **Medium**

All 6 buckets have `allowed_mime_types = NULL` and `file_size_limit = NULL`. This means:
- Any authenticated user can upload any file type to any bucket (bypassing the frontend `StorageService.FILE_VALIDATION_OPTIONS` checks).
- Any authenticated user can upload files of unlimited size directly via the Supabase Storage API, bypassing the subscription quota check in `StorageService.uploadFileWithValidation`.

**Attack vector:** A user with a valid JWT sends a `POST /storage/v1/object/photos/{userId}/malware.exe` with `application/octet-stream`. The frontend `checkMagicBytes` check is skipped entirely. The file uploads. If a signed URL is ever shared, the recipient downloads an executable.

---

### ISSUE-S3 — UPDATE policies missing WITH CHECK — **Medium**

All 6 UPDATE policies have a `USING` clause but `with_check = NULL`. Without a `WITH CHECK` on UPDATE, a user could potentially rename a file's `name` to a path under a different `user_id` via a direct API UPDATE call, moving the `name` token to point to another user's namespace.

In practice, Supabase Storage's `move()` operation uses UPDATE internally. This should be locked with `WITH CHECK` matching the same condition.

---

### ISSUE-S4 — File paths contain full property addresses in filename — **Low**

Confirmed from production data:
```
1769886411755-a3f04ce9-5761-4eaa-b002-f42dc976c494_1769886411587-Water___Flood_-_988_Emil_Place_Allen_Texas_75013_
1770581379049-a3f04ce9-5761-4eaa-b002-f42dc976c494_1770581378654-7354_Lathrop_Lane_Frisco_Texas_75033_interior__12
```

The storage path (and therefore the signed URL path segment) contains the full property street address. While buckets are private and signed URLs require token authentication, the path itself is visible in:
- Browser network inspector tabs
- Server-side access logs
- Any URL that leaks from `property_files.file_url` via the database

A database leak would expose all property addresses from signed URL paths, even if the actual files are inaccessible.

---

### ISSUE-S5 — Legacy Locker files stored in `photos` bucket — **Low**

Confirmed from production: Legacy Locker files for user `a23e1e2b` are at:
```
photos/{user_id}/legacy-locker/{timestamp}-{filename}
```

These estate planning files (photos of legal documents, executor information) are stored in the same bucket as general property photos. The storage RLS isolation is identical. This is functional but does not enforce any separation of sensitivity — the `photos` bucket MIME type restrictions (intended for images only) could allow documents to be uploaded here since bucket-level MIME restrictions are not set.

---

### ISSUE-S6 — Stale signed URLs stored in `file_url` column — **Low**

The 5 stored `property_files.file_url` values contain 24-hour JWT tokens generated at upload time. All 5 are now expired (created January–February 2026, token `exp` confirmed via JWT decode). The application correctly regenerates them via `refreshSignedUrls()` in `usePropertyFiles`, but the stored column value is always a stale token. Any code path that reads `file_url` directly without calling `createSignedUrls` first will receive an expired URL.

---

### ISSUE-S7 — `listUserFiles` exposes all files in a user's folder to the same user — **Low**

`StorageService.listUserFiles(bucket, userId)` calls `supabase.storage.from(bucket).list(userId)`. This is authenticated as the calling user. Because storage RLS grants SELECT to `path_tokens[1] = auth.uid()`, any authenticated user can call `.list(their_own_userId)` and enumerate all their own files. This is correct behavior. However, if called with someone else's `userId`, storage RLS blocks it correctly. No cross-account gap here.

---

## PART 5 — Enumeration Risk Assessment

| Attack | Possible? | Notes |
|--------|-----------|-------|
| Enumerate another user's files via `.list()` | **No** | Storage RLS blocks by path_tokens[1] |
| Download another user's file via direct URL | **No** | JWT token required; signed URL is per-path and scoped |
| Guess a file path and generate a signed URL for it | **No** — blocked by RLS | RLS checks `path_tokens[1] = auth.uid()` |
| Brute-force signed URL tokens | **No** | Tokens are HS256-signed JWTs; unforgeable |
| Upload a file to another user's path | **No** | INSERT WITH CHECK blocks mismatched path[1] |
| Upload malicious file type | **Yes** | No bucket-level MIME enforcement |
| Upload oversized file bypassing quota | **Yes** | No bucket-level size enforcement |
| Contributor view owner's files | **Yes — broken** | Storage RLS blocks contributor; files never render |

---

## PART 6 — Recommended Fixes (by severity)

### Fix S1 (HIGH) — Add contributor-aware SELECT policy to storage buckets

Contributors need to call `createSignedUrl` to view files. The storage SELECT RLS must be extended to allow this for authorized contributors.

```sql
-- For each of: photos, videos, documents, floor-plans
-- Pattern (shown for photos, repeat for all buckets):

CREATE POLICY "Contributors can view owner photos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'photos'
    AND (
      -- Owner access (existing)
      (auth.uid())::text = (storage.foldername(name))[1]
      OR
      -- Contributor access: path_tokens[1] is the account owner's user_id;
      -- check that auth.uid() is an accepted contributor of that owner
      EXISTS (
        SELECT 1 FROM public.contributors c
        WHERE c.account_owner_id::text = (storage.foldername(name))[1]
          AND c.contributor_user_id = auth.uid()
          AND c.status = 'accepted'
      )
    )
  );
```

Note: This should NOT be added to `memory-safe` or `contact-attachments` — those are owner-only.

---

### Fix S2 (MEDIUM) — Set bucket-level MIME types and file size limits

These must be set via migration, not just frontend validation:

```sql
-- photos bucket: images only, 10MB limit
UPDATE storage.buckets
SET 
  file_size_limit = 10485760, -- 10MB
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
WHERE id = 'photos';

-- videos bucket: video only, 100MB limit
UPDATE storage.buckets
SET
  file_size_limit = 104857600, -- 100MB
  allowed_mime_types = ARRAY['video/mp4', 'video/quicktime', 'video/x-msvideo']
WHERE id = 'videos';

-- documents bucket: documents + images, 25MB limit
UPDATE storage.buckets
SET
  file_size_limit = 26214400, -- 25MB
  allowed_mime_types = ARRAY[
    'application/pdf', 'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg', 'image/png', 'image/webp'
  ]
WHERE id = 'documents';

-- floor-plans: images + pdf, 15MB
UPDATE storage.buckets
SET
  file_size_limit = 15728640,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'application/pdf']
WHERE id = 'floor-plans';

-- memory-safe: mixed, 25MB
UPDATE storage.buckets
SET
  file_size_limit = 26214400,
  allowed_mime_types = ARRAY[
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'video/mp4', 'video/quicktime',
    'application/pdf', 'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
WHERE id = 'memory-safe';

-- contact-attachments: documents + images, 25MB
UPDATE storage.buckets
SET
  file_size_limit = 26214400,
  allowed_mime_types = ARRAY[
    'application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'text/plain'
  ]
WHERE id = 'contact-attachments';
```

---

### Fix S3 (MEDIUM) — Add WITH CHECK to UPDATE policies

```sql
-- Drop and recreate with WITH CHECK (pattern for each bucket):
DROP POLICY IF EXISTS "Users can update their own photos" ON storage.objects;
CREATE POLICY "Users can update their own photos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'photos'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'photos'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );
-- Repeat for: videos, documents, floor-plans, contact-attachments, memory-safe
```

---

### Fix S4 (LOW) — Sanitize filenames to strip address data

In `StorageService.sanitizeFileName`, strip any address-like content or switch to a fully opaque UUID-based filename:

```typescript
private static sanitizeFileName(fileName: string): string {
  // Use only timestamp + random suffix — no original filename in path
  const ext = fileName.split('.').pop()?.toLowerCase() || 'bin';
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
}
```

Existing files are already named; this would apply to new uploads only.

---

### Fix S5 (LOW) — Store `file_path` in `property_files` and regenerate on read; stop storing stale signed URLs

The `file_url` column stores an always-stale 24-hour signed URL. The correct pattern is:
1. Store only `file_path` (already present in the column).
2. On read, always call `createSignedUrls` in batch (already done in `refreshSignedUrls`).
3. Stop setting `file_url` to the signed URL at upload time; set it to the path or `null`.

This prevents `file_url` from ever being used directly without a refresh, eliminating the stale token class of bug.

---

## Summary Count

| Issue | Severity | Affects |
|-------|----------|---------|
| S1: No contributor storage RLS | **HIGH** | Contributor file viewing completely broken |
| S2: No bucket MIME/size limits | **Medium** | Malicious upload type bypass possible |
| S3: UPDATE missing WITH CHECK | **Medium** | File path rename cross-namespace (theoretical) |
| S4: Address in file paths | **Low** | PII leakage via path names in logs/URLs |
| S5: Legacy Locker in `photos` bucket | **Low** | No isolation of high-sensitivity estate files |
| S6: Stale signed URLs in `file_url` | **Low** | Code paths using `file_url` directly fail silently |

The overall bucket posture is solid — all private, correctly enforced at the outer layer. Fix S1 is the only issue that currently breaks a live user-facing feature (contributor access to property media).
