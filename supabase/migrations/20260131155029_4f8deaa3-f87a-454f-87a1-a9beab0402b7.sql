-- Create user_activity_logs table for tracking user actions
CREATE TABLE public.user_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  actor_user_id UUID, -- The user who performed the action (may differ from user_id if contributor)
  action_type TEXT NOT NULL, -- 'upload', 'edit', 'delete', 'login', 'access_vault', 'contributor_access', 'property_update', etc.
  action_category TEXT NOT NULL, -- 'upload', 'contributor', 'vault', 'security', 'property', 'account'
  resource_type TEXT, -- 'photo', 'video', 'document', 'property', 'vault', 'profile', etc.
  resource_id TEXT, -- ID of the affected resource
  resource_name TEXT, -- Human-readable name of the resource
  details JSONB DEFAULT '{}', -- Additional action details
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for efficient querying
CREATE INDEX idx_user_activity_logs_user_id ON public.user_activity_logs(user_id);
CREATE INDEX idx_user_activity_logs_created_at ON public.user_activity_logs(created_at DESC);
CREATE INDEX idx_user_activity_logs_category ON public.user_activity_logs(action_category);

-- Enable Row Level Security
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own activity logs
CREATE POLICY "Users can view their own activity logs"
ON public.user_activity_logs
FOR SELECT
USING (auth.uid() = user_id);

-- Contributors with administrator role can view account owner's activity logs
CREATE POLICY "Admin contributors can view activity logs"
ON public.user_activity_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.contributors c
    WHERE c.contributor_user_id = auth.uid()
    AND c.account_owner_id = user_activity_logs.user_id
    AND c.role = 'administrator'
    AND c.status = 'accepted'
  )
);

-- Service role can insert activity logs (for edge functions and triggers)
CREATE POLICY "Service role can insert activity logs"
ON public.user_activity_logs
FOR INSERT
WITH CHECK (true);

-- Admins can view all activity logs
CREATE POLICY "Admins can view all activity logs"
ON public.user_activity_logs
FOR SELECT
USING (has_app_role(auth.uid(), 'admin'));