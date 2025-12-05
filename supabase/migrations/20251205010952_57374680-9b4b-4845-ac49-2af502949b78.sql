-- Fix storage bucket SELECT policies to verify file ownership

-- Drop existing overly permissive SELECT policies
DROP POLICY IF EXISTS "Photos are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Videos are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Floor plans are publicly accessible" ON storage.objects;

-- Create secure SELECT policies that check ownership
CREATE POLICY "Users can view their own photos"
ON storage.objects FOR SELECT
USING (
  (bucket_id = 'photos') 
  AND (auth.uid()::text = (storage.foldername(name))[1])
);

CREATE POLICY "Users can view their own videos"
ON storage.objects FOR SELECT
USING (
  (bucket_id = 'videos') 
  AND (auth.uid()::text = (storage.foldername(name))[1])
);

CREATE POLICY "Users can view their own floor plans"
ON storage.objects FOR SELECT
USING (
  (bucket_id = 'floor-plans') 
  AND (auth.uid()::text = (storage.foldername(name))[1])
);