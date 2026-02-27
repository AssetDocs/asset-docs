
-- ============================================================
-- Fix S1 (HIGH): Add contributor-aware SELECT policies to
-- photos, videos, documents, floor-plans buckets.
-- memory-safe and contact-attachments remain owner-only.
-- ============================================================

-- PHOTOS: drop existing SELECT, add contributor-aware version
DROP POLICY IF EXISTS "Users can view their own photos" ON storage.objects;
CREATE POLICY "Users can view their own photos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'photos'
    AND (
      (auth.uid())::text = (storage.foldername(name))[1]
      OR EXISTS (
        SELECT 1 FROM public.contributors c
        WHERE c.account_owner_id::text = (storage.foldername(name))[1]
          AND c.contributor_user_id = auth.uid()
          AND c.status = 'accepted'
      )
    )
  );

-- VIDEOS: drop existing SELECT, add contributor-aware version
DROP POLICY IF EXISTS "Users can view their own videos" ON storage.objects;
CREATE POLICY "Users can view their own videos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'videos'
    AND (
      (auth.uid())::text = (storage.foldername(name))[1]
      OR EXISTS (
        SELECT 1 FROM public.contributors c
        WHERE c.account_owner_id::text = (storage.foldername(name))[1]
          AND c.contributor_user_id = auth.uid()
          AND c.status = 'accepted'
      )
    )
  );

-- DOCUMENTS: drop existing SELECT, add contributor-aware version
DROP POLICY IF EXISTS "Users can view their own documents" ON storage.objects;
CREATE POLICY "Users can view their own documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'documents'
    AND (
      (auth.uid())::text = (storage.foldername(name))[1]
      OR EXISTS (
        SELECT 1 FROM public.contributors c
        WHERE c.account_owner_id::text = (storage.foldername(name))[1]
          AND c.contributor_user_id = auth.uid()
          AND c.status = 'accepted'
      )
    )
  );

-- FLOOR-PLANS: drop existing SELECT, add contributor-aware version
DROP POLICY IF EXISTS "Users can view their own floor-plans" ON storage.objects;
CREATE POLICY "Users can view their own floor-plans"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'floor-plans'
    AND (
      (auth.uid())::text = (storage.foldername(name))[1]
      OR EXISTS (
        SELECT 1 FROM public.contributors c
        WHERE c.account_owner_id::text = (storage.foldername(name))[1]
          AND c.contributor_user_id = auth.uid()
          AND c.status = 'accepted'
      )
    )
  );

-- ============================================================
-- Fix S2 (MEDIUM): Set bucket-level MIME types and size limits
-- ============================================================

UPDATE storage.buckets
SET
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
WHERE id = 'photos';

UPDATE storage.buckets
SET
  file_size_limit = 104857600,
  allowed_mime_types = ARRAY['video/mp4', 'video/quicktime', 'video/x-msvideo']
WHERE id = 'videos';

UPDATE storage.buckets
SET
  file_size_limit = 26214400,
  allowed_mime_types = ARRAY[
    'application/pdf', 'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg', 'image/png', 'image/webp'
  ]
WHERE id = 'documents';

UPDATE storage.buckets
SET
  file_size_limit = 15728640,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'application/pdf']
WHERE id = 'floor-plans';

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

UPDATE storage.buckets
SET
  file_size_limit = 26214400,
  allowed_mime_types = ARRAY[
    'application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'text/plain'
  ]
WHERE id = 'contact-attachments';

-- ============================================================
-- Fix S3 (MEDIUM): Add WITH CHECK to all UPDATE policies
-- ============================================================

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

DROP POLICY IF EXISTS "Users can update their own videos" ON storage.objects;
CREATE POLICY "Users can update their own videos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'videos'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'videos'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can update their own documents" ON storage.objects;
CREATE POLICY "Users can update their own documents"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'documents'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'documents'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can update their own floor-plans" ON storage.objects;
CREATE POLICY "Users can update their own floor-plans"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'floor-plans'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'floor-plans'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can update their own contact-attachments" ON storage.objects;
CREATE POLICY "Users can update their own contact-attachments"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'contact-attachments'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'contact-attachments'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can update their own memory-safe" ON storage.objects;
CREATE POLICY "Users can update their own memory-safe"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'memory-safe'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'memory-safe'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );
