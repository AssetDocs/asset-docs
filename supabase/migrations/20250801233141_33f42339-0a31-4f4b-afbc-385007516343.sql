-- Create enum for contributor roles
CREATE TYPE public.contributor_role AS ENUM ('administrator', 'contributor', 'viewer');

-- Create contributors table
CREATE TABLE public.contributors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  account_owner_id UUID NOT NULL,
  contributor_email TEXT NOT NULL,
  contributor_user_id UUID,
  role contributor_role NOT NULL DEFAULT 'viewer',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  invited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(account_owner_id, contributor_email)
);

-- Enable RLS
ALTER TABLE public.contributors ENABLE ROW LEVEL SECURITY;

-- Create policies for contributors table
CREATE POLICY "Account owners can manage their contributors" 
ON public.contributors 
FOR ALL 
USING (auth.uid() = account_owner_id);

CREATE POLICY "Contributors can view their own invitations" 
ON public.contributors 
FOR SELECT 
USING (auth.uid() = contributor_user_id OR contributor_email = (
  SELECT email FROM auth.users WHERE id = auth.uid()
));

CREATE POLICY "Contributors can update their own status" 
ON public.contributors 
FOR UPDATE 
USING (auth.uid() = contributor_user_id OR contributor_email = (
  SELECT email FROM auth.users WHERE id = auth.uid()
))
WITH CHECK (auth.uid() = contributor_user_id OR contributor_email = (
  SELECT email FROM auth.users WHERE id = auth.uid()
));

-- Create function to check contributor access
CREATE OR REPLACE FUNCTION public.has_contributor_access(target_user_id UUID, required_role contributor_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
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

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_contributors_updated_at
BEFORE UPDATE ON public.contributors
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update storage_usage policies to allow contributor access
DROP POLICY IF EXISTS "Users can view their own storage usage" ON public.storage_usage;
CREATE POLICY "Users and contributors can view storage usage" 
ON public.storage_usage 
FOR SELECT 
USING (public.has_contributor_access(user_id, 'viewer'));

-- Update profiles policies to allow contributor access (for viewing account info)
DROP POLICY IF EXISTS "Profiles are viewable by users themselves" ON public.profiles;
CREATE POLICY "Profiles are viewable by users and contributors" 
ON public.profiles 
FOR SELECT 
USING (public.has_contributor_access(user_id, 'viewer'));