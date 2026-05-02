-- 1. Allow users to read their own legal agreement signatures by email
CREATE POLICY "Users can view their own legal signatures"
ON public.legal_agreement_signatures
FOR SELECT
TO authenticated
USING (signer_email = auth.email());

-- 2. Tighten storage contributor access to require contributor-or-higher role
DROP POLICY IF EXISTS "Users can view their own documents" ON storage.objects;
CREATE POLICY "Users can view their own documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'documents'
  AND (
    (auth.uid())::text = (storage.foldername(name))[1]
    OR EXISTS (
      SELECT 1 FROM public.contributors c
      WHERE (c.account_owner_id)::text = (storage.foldername(objects.name))[1]
        AND c.contributor_user_id = auth.uid()
        AND c.status = 'accepted'
        AND c.role IN ('contributor', 'administrator')
    )
  )
);

DROP POLICY IF EXISTS "Users can view their own floor-plans" ON storage.objects;
CREATE POLICY "Users can view their own floor-plans"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'floor-plans'
  AND (
    (auth.uid())::text = (storage.foldername(name))[1]
    OR EXISTS (
      SELECT 1 FROM public.contributors c
      WHERE (c.account_owner_id)::text = (storage.foldername(objects.name))[1]
        AND c.contributor_user_id = auth.uid()
        AND c.status = 'accepted'
        AND c.role IN ('contributor', 'administrator')
    )
  )
);

DROP POLICY IF EXISTS "Users can view their own photos" ON storage.objects;
CREATE POLICY "Users can view their own photos"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'photos'
  AND (
    (auth.uid())::text = (storage.foldername(name))[1]
    OR EXISTS (
      SELECT 1 FROM public.contributors c
      WHERE (c.account_owner_id)::text = (storage.foldername(objects.name))[1]
        AND c.contributor_user_id = auth.uid()
        AND c.status = 'accepted'
        AND c.role IN ('contributor', 'administrator')
    )
  )
);

DROP POLICY IF EXISTS "Users can view their own videos" ON storage.objects;
CREATE POLICY "Users can view their own videos"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'videos'
  AND (
    (auth.uid())::text = (storage.foldername(name))[1]
    OR EXISTS (
      SELECT 1 FROM public.contributors c
      WHERE (c.account_owner_id)::text = (storage.foldername(objects.name))[1]
        AND c.contributor_user_id = auth.uid()
        AND c.status = 'accepted'
        AND c.role IN ('contributor', 'administrator')
    )
  )
);