
CREATE OR REPLACE FUNCTION public._safe_uuid(_text text)
RETURNS uuid LANGUAGE plpgsql IMMUTABLE AS $$
BEGIN
  RETURN _text::uuid;
EXCEPTION WHEN others THEN
  RETURN NULL;
END;
$$;

-- photos
CREATE POLICY "Account members can view shared photos"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'photos'
  AND public._safe_uuid((storage.foldername(name))[1]) IS NOT NULL
  AND public.has_account_access(auth.uid(), public._safe_uuid((storage.foldername(name))[1]), 'read_only')
);
CREATE POLICY "Account members can upload shared photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'photos'
  AND public._safe_uuid((storage.foldername(name))[1]) IS NOT NULL
  AND public.has_account_access(auth.uid(), public._safe_uuid((storage.foldername(name))[1]), 'full_access')
);
CREATE POLICY "Account members can update shared photos"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'photos'
  AND public._safe_uuid((storage.foldername(name))[1]) IS NOT NULL
  AND public.has_account_access(auth.uid(), public._safe_uuid((storage.foldername(name))[1]), 'full_access')
);
CREATE POLICY "Account owners can delete shared photos"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'photos'
  AND public._safe_uuid((storage.foldername(name))[1]) IS NOT NULL
  AND public._safe_uuid((storage.foldername(name))[1]) = auth.uid()
);

-- videos
CREATE POLICY "Account members can view shared videos"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'videos'
  AND public._safe_uuid((storage.foldername(name))[1]) IS NOT NULL
  AND public.has_account_access(auth.uid(), public._safe_uuid((storage.foldername(name))[1]), 'read_only')
);
CREATE POLICY "Account members can upload shared videos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'videos'
  AND public._safe_uuid((storage.foldername(name))[1]) IS NOT NULL
  AND public.has_account_access(auth.uid(), public._safe_uuid((storage.foldername(name))[1]), 'full_access')
);
CREATE POLICY "Account members can update shared videos"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'videos'
  AND public._safe_uuid((storage.foldername(name))[1]) IS NOT NULL
  AND public.has_account_access(auth.uid(), public._safe_uuid((storage.foldername(name))[1]), 'full_access')
);
CREATE POLICY "Account owners can delete shared videos"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'videos'
  AND public._safe_uuid((storage.foldername(name))[1]) IS NOT NULL
  AND public._safe_uuid((storage.foldername(name))[1]) = auth.uid()
);

-- documents
CREATE POLICY "Account members can view shared documents"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'documents'
  AND public._safe_uuid((storage.foldername(name))[1]) IS NOT NULL
  AND public.has_account_access(auth.uid(), public._safe_uuid((storage.foldername(name))[1]), 'read_only')
);
CREATE POLICY "Account members can upload shared documents"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'documents'
  AND public._safe_uuid((storage.foldername(name))[1]) IS NOT NULL
  AND public.has_account_access(auth.uid(), public._safe_uuid((storage.foldername(name))[1]), 'full_access')
);
CREATE POLICY "Account members can update shared documents"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'documents'
  AND public._safe_uuid((storage.foldername(name))[1]) IS NOT NULL
  AND public.has_account_access(auth.uid(), public._safe_uuid((storage.foldername(name))[1]), 'full_access')
);
CREATE POLICY "Account owners can delete shared documents"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'documents'
  AND public._safe_uuid((storage.foldername(name))[1]) IS NOT NULL
  AND public._safe_uuid((storage.foldername(name))[1]) = auth.uid()
);

-- floor-plans
CREATE POLICY "Account members can view shared floor-plans"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'floor-plans'
  AND public._safe_uuid((storage.foldername(name))[1]) IS NOT NULL
  AND public.has_account_access(auth.uid(), public._safe_uuid((storage.foldername(name))[1]), 'read_only')
);
CREATE POLICY "Account members can upload shared floor-plans"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'floor-plans'
  AND public._safe_uuid((storage.foldername(name))[1]) IS NOT NULL
  AND public.has_account_access(auth.uid(), public._safe_uuid((storage.foldername(name))[1]), 'full_access')
);
CREATE POLICY "Account members can update shared floor-plans"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'floor-plans'
  AND public._safe_uuid((storage.foldername(name))[1]) IS NOT NULL
  AND public.has_account_access(auth.uid(), public._safe_uuid((storage.foldername(name))[1]), 'full_access')
);
CREATE POLICY "Account owners can delete shared floor-plans"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'floor-plans'
  AND public._safe_uuid((storage.foldername(name))[1]) IS NOT NULL
  AND public._safe_uuid((storage.foldername(name))[1]) = auth.uid()
);

-- Legacy compatibility (read-only via shared DB rows)
CREATE POLICY "Members can view shared objects referenced by property_files"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id IN ('photos','videos','documents','floor-plans')
  AND EXISTS (
    SELECT 1 FROM public.property_files pf
    WHERE pf.bucket_name = storage.objects.bucket_id
      AND pf.file_path = storage.objects.name
      AND public.has_account_access(auth.uid(), pf.user_id, 'read_only')
  )
);
CREATE POLICY "Members can view shared objects referenced by user_documents"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'documents'
  AND EXISTS (
    SELECT 1 FROM public.user_documents ud
    WHERE ud.file_path = storage.objects.name
      AND public.has_account_access(auth.uid(), ud.user_id, 'read_only')
  )
);
