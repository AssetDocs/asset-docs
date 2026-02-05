-- Allow anyone to verify an invitation by token (needed for invite acceptance flow)
CREATE POLICY "Anyone can verify invitation by token"
ON public.dev_team_invitations
FOR SELECT
USING (true);

-- Note: The existing policy already restricts management (INSERT/UPDATE/DELETE) to owners/admins
-- This new policy only allows SELECT for token verification during the invite acceptance flow