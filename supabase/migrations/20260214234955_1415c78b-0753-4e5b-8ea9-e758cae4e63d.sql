-- Drop the broken policy (the correct one already exists)
DROP POLICY IF EXISTS "Users can view their storage usage" ON public.storage_usage;