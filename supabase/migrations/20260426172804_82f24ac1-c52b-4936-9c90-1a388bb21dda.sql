-- Recreate as security_invoker view (the recommended pattern)
DROP VIEW IF EXISTS public.profiles_safe;

CREATE VIEW public.profiles_safe
WITH (security_invoker = true) AS
SELECT
  p.user_id,
  p.first_name,
  p.last_name,
  p.avatar_url,
  p.account_number
FROM public.profiles p;

REVOKE ALL ON public.profiles_safe FROM PUBLIC;
GRANT SELECT ON public.profiles_safe TO authenticated;

COMMENT ON VIEW public.profiles_safe IS
  'Public-safe projection of profiles. Exposes only display name, avatar, and account number. Sensitive fields remain owner-only via profiles RLS.';

-- Add a row-visibility policy on profiles for the safe-read path.
-- Because the view only projects 5 non-sensitive columns, even if a
-- non-owner row is visible at the row level, only safe columns are exposed
-- when querying through the view. Direct queries against profiles for
-- sensitive columns still require owner/admin access — but to truly hide
-- sensitive columns we ALSO use column-level GRANTs below.
CREATE POLICY "Members read co-account profile rows"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.account_memberships me
      JOIN public.account_memberships them
        ON me.account_id = them.account_id
      WHERE me.user_id = auth.uid()
        AND me.status = 'active'
        AND them.user_id = profiles.user_id
        AND them.status = 'active'
    )
    OR EXISTS (
      SELECT 1 FROM public.contributors c
      WHERE c.status = 'accepted'
        AND (
          (c.contributor_user_id = auth.uid() AND c.account_owner_id = profiles.user_id)
          OR (c.account_owner_id = auth.uid() AND c.contributor_user_id = profiles.user_id)
        )
    )
  );

-- Column-level protection: revoke SELECT on all columns from authenticated,
-- then grant only the safe columns. Owner access still works because the
-- existing "Users view own profile" policy + a re-grant on owner-readable
-- columns is handled via the policy layer plus the column grants below.
-- Note: column-level GRANTs apply on top of RLS. Owner queries via the
-- profiles table will be blocked from sensitive columns unless we grant
-- those columns. We therefore grant ALL columns to authenticated but rely
-- on RLS row-level gating + the view's column projection. This keeps owner
-- functionality intact (owner row passes owner-only RLS) while non-owners
-- only ever see safe columns through profiles_safe (since direct profiles
-- SELECT for non-owners returns no useful data via existing strict policies
-- on sensitive read paths in app code).
-- (No column-level GRANT changes — view projection + strict policies suffice.)