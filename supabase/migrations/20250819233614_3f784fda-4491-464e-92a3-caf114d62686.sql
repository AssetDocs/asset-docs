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
  (
    current_setting('request.path', true) LIKE '%webhook%' OR
    current_setting('request.path', true) LIKE '%checkout%' OR
    current_setting('request.path', true) LIKE '%subscription%'
  )
)
WITH CHECK (
  current_setting('role') = 'service_role' AND
  (
    current_setting('request.path', true) LIKE '%webhook%' OR
    current_setting('request.path', true) LIKE '%checkout%' OR
    current_setting('request.path', true) LIKE '%subscription%'
  )
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
DROP POLICY IF EXISTS "Only authorized personnel can view leads" ON public.leads;

CREATE POLICY "Only authorized personnel can view leads" 
ON public.leads 
FOR SELECT 
USING (
  has_any_app_role(auth.uid(), ARRAY['admin'::app_role, 'sales'::app_role, 'marketing'::app_role]) OR
  current_setting('role') = 'service_role'
);

-- 4. CONTRIBUTORS table - Ensure email addresses are protected
CREATE POLICY "Contributors cannot access unauthorized data" 
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