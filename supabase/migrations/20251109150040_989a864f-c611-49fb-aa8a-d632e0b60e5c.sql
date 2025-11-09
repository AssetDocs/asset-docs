-- Drop existing restrictive policies that conflict
DROP POLICY IF EXISTS "Account owners can manage their contributors" ON contributors;
DROP POLICY IF EXISTS "Contributors can view relevant invitations" ON contributors;
DROP POLICY IF EXISTS "Contributors can view their own invitations" ON contributors;
DROP POLICY IF EXISTS "Contributors can update their own status" ON contributors;

-- Create new permissive policies that work together
CREATE POLICY "Account owners full access to their contributors"
ON contributors
FOR ALL
USING (auth.uid() = account_owner_id);

CREATE POLICY "Contributors view own invitations"
ON contributors
FOR SELECT
USING (
  auth.uid() = contributor_user_id 
  OR auth.email() = contributor_email
);

CREATE POLICY "Contributors update own acceptance"
ON contributors
FOR UPDATE
USING (
  auth.uid() = contributor_user_id 
  OR auth.email() = contributor_email
)
WITH CHECK (
  auth.uid() = contributor_user_id 
  OR auth.email() = contributor_email
);