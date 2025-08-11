-- Fix critical security vulnerability: Restrict leads access to authorized personnel only
-- Create proper role-based access control system

-- Create enum for organizational roles
CREATE TYPE public.app_role AS ENUM ('admin', 'sales', 'marketing', 'viewer');

-- Create user roles table for organizational access control
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_app_role(target_user_id UUID, required_role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = target_user_id 
    AND role = required_role
  );
$$;

-- Create function to check if user has any of the allowed roles
CREATE OR REPLACE FUNCTION public.has_any_app_role(target_user_id UUID, allowed_roles app_role[])
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = target_user_id 
    AND role = ANY(allowed_roles)
  );
$$;

-- RLS policies for user_roles table
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" 
ON public.user_roles 
FOR ALL 
USING (public.has_app_role(auth.uid(), 'admin'));

-- Update the leads table RLS policy to restrict access to authorized personnel only
DROP POLICY IF EXISTS "Authenticated users can view leads" ON public.leads;

CREATE POLICY "Only authorized personnel can view leads" 
ON public.leads 
FOR SELECT 
USING (
  public.has_any_app_role(
    auth.uid(), 
    ARRAY['admin', 'sales', 'marketing']::app_role[]
  )
);

-- Create trigger for timestamp updates on user_roles
CREATE TRIGGER update_user_roles_updated_at
    BEFORE UPDATE ON public.user_roles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();