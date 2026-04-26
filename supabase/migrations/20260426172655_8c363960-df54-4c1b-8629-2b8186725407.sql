-- 1. Drop the over-permissive contributor policy on profiles
DROP POLICY IF EXISTS "Contributors view account owner profiles" ON public.profiles;

-- 2. Ensure strict owner-only SELECT remains (admin policy already exists separately)
-- "Users view own profile" already exists; no change needed.

-- 3. Create the public-safe view as SECURITY DEFINER (owned by postgres)
--    The view itself enforces row visibility via its WHERE clause, and only
--    projects non-sensitive columns.
DROP VIEW IF EXISTS public.profiles_safe;

CREATE VIEW public.profiles_safe
WITH (security_invoker = false) AS
SELECT
  p.user_id,
  p.first_name,
  p.last_name,
  p.avatar_url,
  p.account_number
FROM public.profiles p
WHERE
  -- Owner can always see their own safe row
  p.user_id = auth.uid()
  -- Admins can see all
  OR public.has_app_role(auth.uid(), 'admin'::app_role)
  -- Co-members on the same account (via account_memberships)
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

-- 4. Grant access
REVOKE ALL ON public.profiles_safe FROM PUBLIC;
GRANT SELECT ON public.profiles_safe TO authenticated;

COMMENT ON VIEW public.profiles_safe IS
  'Public-safe projection of profiles. Exposes only display name, avatar, and account number to authorized users on the same account. Sensitive fields (billing, plan, phone, household income, etc.) remain owner-only via the profiles table RLS.';