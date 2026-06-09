-- Step 5 (retry): Locker-scoped voice-note storage paths, ownership-bound helper, and vault storage policies.

-- 1) Schema additions.
ALTER TABLE public.legacy_locker_voice_notes
  ADD COLUMN IF NOT EXISTS legacy_locker_id uuid REFERENCES public.legacy_locker(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS is_encrypted boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS storage_bucket text NOT NULL DEFAULT 'documents';

ALTER TABLE public.voice_note_attachments
  ADD COLUMN IF NOT EXISTS legacy_locker_id uuid REFERENCES public.legacy_locker(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS is_encrypted boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS storage_bucket text NOT NULL DEFAULT 'documents';

CREATE INDEX IF NOT EXISTS idx_legacy_locker_voice_notes_locker
  ON public.legacy_locker_voice_notes(legacy_locker_id);
CREATE INDEX IF NOT EXISTS idx_voice_note_attachments_locker
  ON public.voice_note_attachments(legacy_locker_id);

-- 2) Ownership-bound storage helper. legacy_locker.user_id is the owner.
CREATE OR REPLACE FUNCTION public.can_access_vault_path(_owner uuid, _locker uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.legacy_locker ll
    WHERE ll.id = _locker
      AND ll.user_id = _owner
      AND (
        auth.uid() = _owner
        OR EXISTS (
          SELECT 1
          FROM public.recovery_requests rr
          WHERE rr.legacy_locker_id = _locker
            AND rr.owner_user_id   = _owner
            AND rr.delegate_user_id = auth.uid()
            AND rr.status = 'acknowledged'
        )
      )
  )
$$;

REVOKE ALL ON FUNCTION public.can_access_vault_path(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_access_vault_path(uuid, uuid)
  TO authenticated, service_role;

-- 3) Vault-scoped storage policies on the `documents` bucket.
--    Path layout: legacy-locker/<owner_user_id>/<legacy_locker_id>/<filename>
--    The existing general-document policies don't match this prefix because
--    `_safe_uuid('legacy-locker')` is NULL and the per-user policies compare
--    `auth.uid()::text` to path[1] (which is the literal 'legacy-locker').

DROP POLICY IF EXISTS "Vault: read locker objects"   ON storage.objects;
DROP POLICY IF EXISTS "Vault: upload locker objects" ON storage.objects;
DROP POLICY IF EXISTS "Vault: update locker objects" ON storage.objects;
DROP POLICY IF EXISTS "Vault: delete locker objects" ON storage.objects;

CREATE POLICY "Vault: read locker objects"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] = 'legacy-locker'
  AND public._safe_uuid((storage.foldername(name))[2]) IS NOT NULL
  AND public._safe_uuid((storage.foldername(name))[3]) IS NOT NULL
  AND public.can_access_vault_path(
        public._safe_uuid((storage.foldername(name))[2]),
        public._safe_uuid((storage.foldername(name))[3])
      )
);

CREATE POLICY "Vault: upload locker objects"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] = 'legacy-locker'
  AND public._safe_uuid((storage.foldername(name))[2]) = auth.uid()
  AND public._safe_uuid((storage.foldername(name))[3]) IS NOT NULL
  AND public.can_access_vault_path(
        auth.uid(),
        public._safe_uuid((storage.foldername(name))[3])
      )
);

CREATE POLICY "Vault: update locker objects"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] = 'legacy-locker'
  AND public._safe_uuid((storage.foldername(name))[2]) = auth.uid()
  AND public.can_access_vault_path(
        auth.uid(),
        public._safe_uuid((storage.foldername(name))[3])
      )
)
WITH CHECK (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] = 'legacy-locker'
  AND public._safe_uuid((storage.foldername(name))[2]) = auth.uid()
  AND public.can_access_vault_path(
        auth.uid(),
        public._safe_uuid((storage.foldername(name))[3])
      )
);

CREATE POLICY "Vault: delete locker objects"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] = 'legacy-locker'
  AND public._safe_uuid((storage.foldername(name))[2]) = auth.uid()
  AND public.can_access_vault_path(
        auth.uid(),
        public._safe_uuid((storage.foldername(name))[3])
      )
);