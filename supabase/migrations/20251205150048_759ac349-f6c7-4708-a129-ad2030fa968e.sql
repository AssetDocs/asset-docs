-- Drop the insecure SELECT policies that don't have ownership checks
-- These policies allow any authenticated user to view ALL files in these buckets

DROP POLICY IF EXISTS "Users can view photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view floor plans" ON storage.objects;