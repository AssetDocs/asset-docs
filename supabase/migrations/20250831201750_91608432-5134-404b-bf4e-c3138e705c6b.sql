-- Drop the conflicting policies
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

-- Create consolidated SELECT policy 
CREATE POLICY "Users can view accessible roles" 
ON public.user_roles 
FOR SELECT 
USING (
  has_app_role((SELECT auth.uid()), 'admin'::app_role) 
  OR (SELECT auth.uid()) = user_id
);

-- Create separate policies for INSERT, UPDATE, DELETE
CREATE POLICY "Admins can insert roles" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (has_app_role((SELECT auth.uid()), 'admin'::app_role));

CREATE POLICY "Admins can update roles" 
ON public.user_roles 
FOR UPDATE 
USING (has_app_role((SELECT auth.uid()), 'admin'::app_role));

CREATE POLICY "Admins can delete roles" 
ON public.user_roles 
FOR DELETE 
USING (has_app_role((SELECT auth.uid()), 'admin'::app_role));