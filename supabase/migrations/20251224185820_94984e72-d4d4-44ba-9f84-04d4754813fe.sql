-- Make storage buckets private to prevent direct public access
-- This ensures files can only be accessed via signed URLs with proper authentication

UPDATE storage.buckets
SET public = false
WHERE id IN ('photos', 'videos', 'floor-plans');