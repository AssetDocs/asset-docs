-- Fix overly permissive RLS policies for security

-- Update subscribers table policies to be more restrictive
DROP POLICY IF EXISTS "select_own_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "update_own_subscription" ON public.subscribers;

-- Create more secure policies for subscribers table
CREATE POLICY "Users can view their own subscription" 
ON public.subscribers 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription" 
ON public.subscribers 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Update leads table policies to be more restrictive  
DROP POLICY IF EXISTS "Users can view leads" ON public.leads;

-- Create admin-only policy for leads (requires user roles implementation)
-- For now, remove the overly permissive policy and require proper authorization
CREATE POLICY "Authenticated users can view leads" 
ON public.leads 
FOR SELECT 
TO authenticated
USING (false); -- Temporarily disable until proper admin role system is implemented

-- Add security headers and validation triggers
CREATE OR REPLACE FUNCTION public.validate_email_format()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email format';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add email validation to leads table
CREATE TRIGGER validate_leads_email
  BEFORE INSERT OR UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_email_format();

-- Add email validation to subscribers table  
CREATE TRIGGER validate_subscribers_email
  BEFORE INSERT OR UPDATE ON public.subscribers
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_email_format();