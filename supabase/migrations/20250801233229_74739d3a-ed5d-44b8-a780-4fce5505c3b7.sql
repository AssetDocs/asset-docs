-- Fix the security issue by setting search_path
CREATE OR REPLACE FUNCTION public.has_contributor_access(target_user_id UUID, required_role contributor_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.contributors 
    WHERE account_owner_id = target_user_id 
    AND contributor_user_id = auth.uid()
    AND status = 'accepted'
    AND (
      role = 'administrator' OR
      (required_role = 'contributor' AND role IN ('administrator', 'contributor')) OR
      (required_role = 'viewer' AND role IN ('administrator', 'contributor', 'viewer'))
    )
  ) OR target_user_id = auth.uid();
$$;