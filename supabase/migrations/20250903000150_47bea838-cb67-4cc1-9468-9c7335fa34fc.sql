-- Fix critical data exposure in leads table - restrict to admin only
DROP POLICY IF EXISTS "Only authorized personnel can view leads" ON public.leads;
DROP POLICY IF EXISTS "Only edge functions can insert leads" ON public.leads;

-- Create more restrictive lead access policies
CREATE POLICY "Only admins can view leads" 
ON public.leads 
FOR SELECT 
USING (
  has_app_role(auth.uid(), 'admin'::app_role) OR 
  current_setting('role') = 'service_role'
);

CREATE POLICY "Only edge functions can insert leads" 
ON public.leads 
FOR INSERT 
WITH CHECK (current_setting('role') = 'service_role');

-- Add audit logging table for sensitive operations
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on audit logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Only admins can view audit logs"
ON public.audit_logs
FOR SELECT
USING (has_app_role(auth.uid(), 'admin'::app_role));

-- Create audit trigger function
CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    old_values,
    new_values
  ) VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN to_jsonb(NEW) ELSE NULL END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add audit triggers for sensitive tables
CREATE TRIGGER audit_user_roles_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_contributors_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.contributors
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();