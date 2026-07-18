-- Let the admin user directory see Authorized User relationships without making
-- admins members of every customer account. This is read-only and scoped to
-- authenticated users with the app admin role.

GRANT SELECT ON public.accounts TO authenticated;
GRANT SELECT ON public.account_memberships TO authenticated;

DROP POLICY IF EXISTS "Admins can view all accounts" ON public.accounts;
CREATE POLICY "Admins can view all accounts"
  ON public.accounts
  FOR SELECT
  TO authenticated
  USING (public.has_app_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins can view all account memberships" ON public.account_memberships;
CREATE POLICY "Admins can view all account memberships"
  ON public.account_memberships
  FOR SELECT
  TO authenticated
  USING (public.has_app_role(auth.uid(), 'admin'::public.app_role));

NOTIFY pgrst, 'reload schema';
