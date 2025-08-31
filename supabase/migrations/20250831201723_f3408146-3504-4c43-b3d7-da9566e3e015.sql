-- Drop the conflicting policies
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

-- Create consolidated policies with optimized auth function calls
CREATE POLICY "Users can view accessible roles" 
ON public.user_roles 
FOR SELECT 
USING (
  has_app_role((SELECT auth.uid()), 'admin'::app_role) 
  OR (SELECT auth.uid()) = user_id
);

CREATE POLICY "Admins can manage all roles" 
ON public.user_roles 
FOR INSERT, UPDATE, DELETE 
USING (has_app_role((SELECT auth.uid()), 'admin'::app_role));