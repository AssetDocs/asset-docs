-- Remove the overly permissive SELECT policy on dev_team_invitations
DROP POLICY IF EXISTS "Anyone can verify invitation by token" ON public.dev_team_invitations;

-- Only admins/owners can read all invitations (for the management UI)
CREATE POLICY "Admins can read dev team invitations"
ON public.dev_team_invitations
FOR SELECT
TO authenticated
USING (
  public.has_owner_workspace_access(auth.uid())
);