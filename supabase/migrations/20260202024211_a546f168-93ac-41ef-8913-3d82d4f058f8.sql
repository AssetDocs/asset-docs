-- Create dev_team_invitations table for tracking invitations
CREATE TABLE IF NOT EXISTS public.dev_team_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  role public.app_role NOT NULL DEFAULT 'developer',
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  invitation_token TEXT UNIQUE NOT NULL,
  token_expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.dev_team_invitations ENABLE ROW LEVEL SECURITY;

-- Only owners can create/view dev team invitations
CREATE POLICY "Owners can manage dev team invitations"
ON public.dev_team_invitations
FOR ALL
TO authenticated
USING (public.has_app_role(auth.uid(), 'owner') OR public.has_app_role(auth.uid(), 'admin'))
WITH CHECK (public.has_app_role(auth.uid(), 'owner') OR public.has_app_role(auth.uid(), 'admin'));

-- Create function to check if user has dev workspace access
CREATE OR REPLACE FUNCTION public.has_dev_workspace_access(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = _user_id 
    AND role IN ('owner', 'admin', 'dev_lead', 'developer', 'qa')
  );
$$;

-- Create function to check if user has owner workspace access
CREATE OR REPLACE FUNCTION public.has_owner_workspace_access(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = _user_id 
    AND role IN ('owner', 'admin')
  );
$$;

-- Create function to get user's admin role
CREATE OR REPLACE FUNCTION public.get_admin_role(_user_id uuid)
RETURNS public.app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role 
  FROM public.user_roles 
  WHERE user_id = _user_id 
  AND role IN ('owner', 'admin', 'dev_lead', 'developer', 'qa')
  ORDER BY 
    CASE role 
      WHEN 'owner' THEN 1 
      WHEN 'admin' THEN 2 
      WHEN 'dev_lead' THEN 3 
      WHEN 'developer' THEN 4 
      WHEN 'qa' THEN 5 
    END
  LIMIT 1;
$$;

-- Add updated_at trigger
CREATE TRIGGER update_dev_team_invitations_updated_at
  BEFORE UPDATE ON public.dev_team_invitations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();