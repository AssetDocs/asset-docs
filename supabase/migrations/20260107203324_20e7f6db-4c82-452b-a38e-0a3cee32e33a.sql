-- Fix storage_usage SELECT policy to properly verify ownership
DROP POLICY IF EXISTS "Users can view their storage usage" ON public.storage_usage;

CREATE POLICY "Users can view their storage usage" 
ON public.storage_usage 
FOR SELECT 
USING (
  auth.uid() = user_id 
  AND public.has_contributor_access(user_id, 'viewer')
);