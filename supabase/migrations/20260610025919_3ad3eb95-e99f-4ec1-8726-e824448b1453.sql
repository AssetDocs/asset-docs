-- Phase 2 (DB only): support normalized storage paths alongside legacy paths.
-- Adds a resolver that returns the implied account owner from a storage object name
-- and rewrites the account-shared bucket policies to use it. No data is moved.

-- ============================================================
-- 1. Path resolver
-- ============================================================
CREATE OR REPLACE FUNCTION public._storage_path_owner(_name text)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, storage
AS $$
  SELECT CASE
    WHEN (storage.foldername(_name))[1] = 'accounts'
      THEN (
        SELECT a.owner_user_id
        FROM public.accounts a
        WHERE a.id = public._safe_uuid((storage.foldername(_name))[2])
      )
    ELSE public._safe_uuid((storage.foldername(_name))[1])
  END;
$$;

REVOKE ALL ON FUNCTION public._storage_path_owner(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public._storage_path_owner(text) TO authenticated, anon, service_role;

-- ============================================================
-- 2. Replace policies for the 4 account-shared buckets.
--    Behavior is preserved (owner-only delete; full_access upload/update;
--    read_only view) — the only change is HOW the owner is derived from the
--    path, which now supports both 'accounts/{accountId}/...' and the
--    legacy '{ownerUserId}/...' formats.
-- ============================================================

-- Drop existing policies (names are exactly as currently defined)
DROP POLICY IF EXISTS "Account members can view shared photos"      ON storage.objects;
DROP POLICY IF EXISTS "Account members can upload shared photos"    ON storage.objects;
DROP POLICY IF EXISTS "Account members can update shared photos"    ON storage.objects;
DROP POLICY IF EXISTS "Account owners can delete shared photos"     ON storage.objects;

DROP POLICY IF EXISTS "Account members can view shared videos"      ON storage.objects;
DROP POLICY IF EXISTS "Account members can upload shared videos"    ON storage.objects;
DROP POLICY IF EXISTS "Account members can update shared videos"    ON storage.objects;
DROP POLICY IF EXISTS "Account owners can delete shared videos"     ON storage.objects;

DROP POLICY IF EXISTS "Account members can view shared documents"   ON storage.objects;
DROP POLICY IF EXISTS "Account members can upload shared documents" ON storage.objects;
DROP POLICY IF EXISTS "Account members can update shared documents" ON storage.objects;
DROP POLICY IF EXISTS "Account owners can delete shared documents"  ON storage.objects;

DROP POLICY IF EXISTS "Account members can view shared floor-plans"   ON storage.objects;
DROP POLICY IF EXISTS "Account members can upload shared floor-plans" ON storage.objects;
DROP POLICY IF EXISTS "Account members can update shared floor-plans" ON storage.objects;
DROP POLICY IF EXISTS "Account owners can delete shared floor-plans"  ON storage.objects;

-- Helper macro implemented as explicit policies per bucket.

-- ---------- photos ----------
CREATE POLICY "Account members can view shared photos"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'photos'
  AND public._storage_path_owner(name) IS NOT NULL
  AND public.has_account_access(auth.uid(), public._storage_path_owner(name), 'read_only')
);

CREATE POLICY "Account members can upload shared photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'photos'
  AND public._storage_path_owner(name) IS NOT NULL
  AND public.has_account_access(auth.uid(), public._storage_path_owner(name), 'full_access')
);

CREATE POLICY "Account members can update shared photos"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'photos'
  AND public._storage_path_owner(name) IS NOT NULL
  AND public.has_account_access(auth.uid(), public._storage_path_owner(name), 'full_access')
)
WITH CHECK (
  bucket_id = 'photos'
  AND public._storage_path_owner(name) IS NOT NULL
  AND public.has_account_access(auth.uid(), public._storage_path_owner(name), 'full_access')
);

CREATE POLICY "Account owners can delete shared photos"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'photos'
  AND public._storage_path_owner(name) IS NOT NULL
  AND public.has_account_access(auth.uid(), public._storage_path_owner(name), 'owner')
);

-- ---------- videos ----------
CREATE POLICY "Account members can view shared videos"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'videos'
  AND public._storage_path_owner(name) IS NOT NULL
  AND public.has_account_access(auth.uid(), public._storage_path_owner(name), 'read_only')
);

CREATE POLICY "Account members can upload shared videos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'videos'
  AND public._storage_path_owner(name) IS NOT NULL
  AND public.has_account_access(auth.uid(), public._storage_path_owner(name), 'full_access')
);

CREATE POLICY "Account members can update shared videos"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'videos'
  AND public._storage_path_owner(name) IS NOT NULL
  AND public.has_account_access(auth.uid(), public._storage_path_owner(name), 'full_access')
)
WITH CHECK (
  bucket_id = 'videos'
  AND public._storage_path_owner(name) IS NOT NULL
  AND public.has_account_access(auth.uid(), public._storage_path_owner(name), 'full_access')
);

CREATE POLICY "Account owners can delete shared videos"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'videos'
  AND public._storage_path_owner(name) IS NOT NULL
  AND public.has_account_access(auth.uid(), public._storage_path_owner(name), 'owner')
);

-- ---------- documents ----------
CREATE POLICY "Account members can view shared documents"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'documents'
  AND public._storage_path_owner(name) IS NOT NULL
  AND public.has_account_access(auth.uid(), public._storage_path_owner(name), 'read_only')
);

CREATE POLICY "Account members can upload shared documents"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'documents'
  AND public._storage_path_owner(name) IS NOT NULL
  AND public.has_account_access(auth.uid(), public._storage_path_owner(name), 'full_access')
);

CREATE POLICY "Account members can update shared documents"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'documents'
  AND public._storage_path_owner(name) IS NOT NULL
  AND public.has_account_access(auth.uid(), public._storage_path_owner(name), 'full_access')
)
WITH CHECK (
  bucket_id = 'documents'
  AND public._storage_path_owner(name) IS NOT NULL
  AND public.has_account_access(auth.uid(), public._storage_path_owner(name), 'full_access')
);

CREATE POLICY "Account owners can delete shared documents"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'documents'
  AND public._storage_path_owner(name) IS NOT NULL
  AND public.has_account_access(auth.uid(), public._storage_path_owner(name), 'owner')
);

-- ---------- floor-plans ----------
CREATE POLICY "Account members can view shared floor-plans"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'floor-plans'
  AND public._storage_path_owner(name) IS NOT NULL
  AND public.has_account_access(auth.uid(), public._storage_path_owner(name), 'read_only')
);

CREATE POLICY "Account members can upload shared floor-plans"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'floor-plans'
  AND public._storage_path_owner(name) IS NOT NULL
  AND public.has_account_access(auth.uid(), public._storage_path_owner(name), 'full_access')
);

CREATE POLICY "Account members can update shared floor-plans"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'floor-plans'
  AND public._storage_path_owner(name) IS NOT NULL
  AND public.has_account_access(auth.uid(), public._storage_path_owner(name), 'full_access')
)
WITH CHECK (
  bucket_id = 'floor-plans'
  AND public._storage_path_owner(name) IS NOT NULL
  AND public.has_account_access(auth.uid(), public._storage_path_owner(name), 'full_access')
);

CREATE POLICY "Account owners can delete shared floor-plans"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'floor-plans'
  AND public._storage_path_owner(name) IS NOT NULL
  AND public.has_account_access(auth.uid(), public._storage_path_owner(name), 'owner')
);