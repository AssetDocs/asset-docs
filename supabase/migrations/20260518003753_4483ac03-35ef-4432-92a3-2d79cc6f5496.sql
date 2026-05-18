-- Add metadata column for structured continuity request data
ALTER TABLE public.account_continuity_requests
  ADD COLUMN IF NOT EXISTS metadata jsonb;

-- Create private bucket for supporting documentation
INSERT INTO storage.buckets (id, name, public)
VALUES ('continuity-documents', 'continuity-documents', false)
ON CONFLICT (id) DO NOTHING;

-- RLS policies on storage.objects for continuity-documents
-- Path convention: {account_id}/{request_id}/{filename}

DROP POLICY IF EXISTS "Legacy admin can upload continuity docs" ON storage.objects;
CREATE POLICY "Legacy admin can upload continuity docs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'continuity-documents'
  AND public.is_active_legacy_admin(auth.uid(), (storage.foldername(name))[1]::uuid)
);

DROP POLICY IF EXISTS "Legacy admin can view continuity docs" ON storage.objects;
CREATE POLICY "Legacy admin can view continuity docs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'continuity-documents'
  AND (
    public.is_active_legacy_admin(auth.uid(), (storage.foldername(name))[1]::uuid)
    OR public.is_account_owner(auth.uid(), (storage.foldername(name))[1]::uuid)
  )
);

DROP POLICY IF EXISTS "Legacy admin can delete own continuity docs" ON storage.objects;
CREATE POLICY "Legacy admin can delete own continuity docs"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'continuity-documents'
  AND public.is_active_legacy_admin(auth.uid(), (storage.foldername(name))[1]::uuid)
  AND owner = auth.uid()
);