-- Fix the "Contributors view profiles" policy that incorrectly exposes profile data
-- The current policy passes the profile's user_id to has_contributor_access(), 
-- but it should check if the current user (auth.uid()) can access that specific profile owner

-- Drop the problematic policy
DROP POLICY IF EXISTS "Contributors view profiles" ON public.profiles;

-- Create a properly scoped policy that allows contributors to view ONLY their account owner's profile
-- A contributor should only see the profile of the account they are contributing to
CREATE POLICY "Contributors view account owner profiles"
ON public.profiles
FOR SELECT
USING (
  -- User can always view their own profile
  auth.uid() = user_id
  OR
  -- Contributors can view the profile of their account owner
  EXISTS (
    SELECT 1 
    FROM public.contributors c
    WHERE c.contributor_user_id = auth.uid()
      AND c.account_owner_id = profiles.user_id
      AND c.status = 'accepted'
  )
);