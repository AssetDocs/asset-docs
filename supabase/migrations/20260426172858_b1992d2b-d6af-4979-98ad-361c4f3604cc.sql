-- Roll back the permissive row policy added in the previous migration
DROP POLICY IF EXISTS "Members read co-account profile rows" ON public.profiles;

-- Drop the invoker view (it can't read other rows under strict RLS anyway)
DROP VIEW IF EXISTS public.profiles_safe;

-- Create a SECURITY DEFINER function that returns only safe fields
-- and enforces row visibility itself.
CREATE OR REPLACE FUNCTION public.get_profiles_safe()
RETURNS TABLE (
  user_id uuid,
  first_name text,
  last_name text,
  avatar_url text,
  account_number text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.user_id,
    p.first_name,
    p.last_name,
    p.avatar_url,
    p.account_number
  FROM public.profiles p
  WHERE
    -- Self
    p.user_id = auth.uid()
    -- Admins
    OR public.has_app_role(auth.uid(), 'admin'::app_role)
    -- Co-members on the same account
    OR EXISTS (
      SELECT 1
      FROM public.account_memberships me
      JOIN public.account_memberships them
        ON me.account_id = them.account_id
      WHERE me.user_id = auth.uid()
        AND me.status = 'active'
        AND them.user_id = p.user_id
        AND them.status = 'active'
    )
    -- Legacy contributor relationships (either direction)
    OR EXISTS (
      SELECT 1 FROM public.contributors c
      WHERE c.status = 'accepted'
        AND (
          (c.contributor_user_id = auth.uid() AND c.account_owner_id = p.user_id)
          OR (c.account_owner_id = auth.uid() AND c.contributor_user_id = p.user_id)
        )
    );
$$;

REVOKE ALL ON FUNCTION public.get_profiles_safe() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_profiles_safe() TO authenticated;

-- Recreate profiles_safe as a view over the function so client code can
-- continue to use the familiar `.from('profiles_safe').select(...)` API.
CREATE VIEW public.profiles_safe
WITH (security_invoker = true) AS
SELECT * FROM public.get_profiles_safe();

REVOKE ALL ON public.profiles_safe FROM PUBLIC;
GRANT SELECT ON public.profiles_safe TO authenticated;

COMMENT ON VIEW public.profiles_safe IS
  'Public-safe profile projection. Backed by SECURITY DEFINER function that enforces row visibility and exposes only display name, avatar, and account number.';