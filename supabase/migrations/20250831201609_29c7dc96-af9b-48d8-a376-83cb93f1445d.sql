-- Drop and recreate the RLS policy with optimized auth function calls
DROP POLICY IF EXISTS "Account owners can manage their contributors" ON public.contributors;

-- Recreate policy with subquery optimization for better performance
CREATE POLICY "Account owners can manage their contributors" 
ON public.contributors 
FOR ALL 
USING ((SELECT auth.uid()) = account_owner_id);