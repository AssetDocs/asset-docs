-- Fix security vulnerabilities in RLS policies for sensitive data tables

-- 1. SUBSCRIBERS table - Remove overly broad service role policies and strengthen access control
DROP POLICY IF EXISTS "Service role comprehensive access" ON public.subscribers;
DROP POLICY IF EXISTS "Service role operations logging" ON public.subscribers;
DROP POLICY IF EXISTS "Service role webhook access" ON public.subscribers;
DROP POLICY IF EXISTS "Authenticated users blocked from direct access" ON public.subscribers;
DROP POLICY IF EXISTS "Block direct user table access" ON public.subscribers;

-- Create secure policies for subscribers table
CREATE POLICY "Users can only view their own subscription data" 
ON public.subscribers 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own subscription" 
ON public.subscribers 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own subscription" 
ON public.subscribers 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Secure service role access for Stripe webhooks only
CREATE POLICY "Service role webhook operations only" 
ON public.subscribers 
FOR ALL
USING (
  current_setting('role') = 'service_role' AND
  current_setting('request.method', true) = 'POST' AND
  current_setting('request.path', true) LIKE '%webhook%'
)
WITH CHECK (
  current_setting('role') = 'service_role' AND
  current_setting('request.method', true) = 'POST' AND
  current_setting('request.path', true) LIKE '%webhook%'
);

-- 2. GIFT_SUBSCRIPTIONS table - Strengthen policies to prevent data exposure
DROP POLICY IF EXISTS "Service role comprehensive access" ON public.gift_subscriptions;
DROP POLICY IF EXISTS "Authenticated users blocked from direct access" ON public.gift_subscriptions;
DROP POLICY IF EXISTS "Block direct user table access" ON public.gift_subscriptions;

-- Secure access to gift subscriptions
CREATE POLICY "Users can only view gifts they purchased" 
ON public.gift_subscriptions 
FOR SELECT 
USING (auth.uid() = purchaser_user_id);

CREATE POLICY "Users can only view gifts sent to their email" 
ON public.gift_subscriptions 
FOR SELECT 
USING (
  auth.email() = recipient_email AND 
  status = 'paid' AND 
  redeemed = false
);

CREATE POLICY "Service role limited gift operations" 
ON public.gift_subscriptions 
FOR ALL
USING (
  current_setting('role') = 'service_role' AND
  (
    current_setting('request.path', true) LIKE '%webhook%' OR
    current_setting('request.path', true) LIKE '%checkout%' OR
    current_setting('request.path', true) LIKE '%gift%'
  )
)
WITH CHECK (
  current_setting('role') = 'service_role'
);

-- 3. LEADS table - Ensure only authorized roles can access lead data
-- First create app roles if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'sales', 'marketing', 'user');
  END IF;
END $$;

-- Update leads policies to be more restrictive
DROP POLICY IF EXISTS "Only authorized personnel can view leads" ON public.leads;

CREATE POLICY "Only authorized personnel can view leads" 
ON public.leads 
FOR SELECT 
USING (
  has_any_app_role(auth.uid(), ARRAY['admin'::app_role, 'sales'::app_role, 'marketing'::app_role]) OR
  current_setting('role') = 'service_role'
);

-- 4. CONTRIBUTORS table - Ensure email addresses are protected
-- The existing policies are mostly fine, but let's add extra protection
CREATE POLICY "Contributors cannot access other contributors data" 
ON public.contributors 
FOR SELECT 
USING (
  auth.uid() = account_owner_id OR 
  auth.uid() = contributor_user_id OR
  auth.email() = contributor_email
);

-- 5. Add function to validate service role context for sensitive operations
CREATE OR REPLACE FUNCTION public.validate_service_role_context()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only allow service role access from specific edge functions or webhooks
  RETURN current_setting('role') = 'service_role' AND (
    current_setting('request.path', true) LIKE '%webhook%' OR
    current_setting('request.path', true) LIKE '%checkout%' OR
    current_setting('request.path', true) LIKE '%subscription%' OR
    current_setting('request.path', true) LIKE '%gift%'
  );
END;
$$;

-- 6. Create audit log function for sensitive data access
CREATE OR REPLACE FUNCTION public.log_sensitive_data_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log access to sensitive tables for security monitoring
  INSERT INTO auth.audit_log_entries (
    instance_id,
    id,
    payload,
    created_at,
    ip_address
  ) VALUES (
    '00000000-0000-0000-0000-000000000000'::uuid,
    gen_random_uuid(),
    jsonb_build_object(
      'table', TG_TABLE_NAME,
      'operation', TG_OP,
      'user_id', auth.uid(),
      'timestamp', now()
    ),
    now(),
    inet_client_addr()
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Apply audit triggers to sensitive tables
DROP TRIGGER IF EXISTS audit_subscribers_access ON public.subscribers;
CREATE TRIGGER audit_subscribers_access
  AFTER SELECT ON public.subscribers
  FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_data_access();

DROP TRIGGER IF EXISTS audit_gift_subscriptions_access ON public.gift_subscriptions;  
CREATE TRIGGER audit_gift_subscriptions_access
  AFTER SELECT ON public.gift_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_data_access();