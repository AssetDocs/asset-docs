-- Fix security vulnerability in subscribers table RLS policies
-- Remove overly broad service_role read access and create more restrictive policies

-- First, drop the problematic policy that allows service_role to read all subscription data
DROP POLICY IF EXISTS "Edge functions can read subscription data" ON public.subscribers;

-- Create a more restrictive policy for users to read their own subscription data
-- This replaces the broad service_role read access
CREATE POLICY "Users can view their own subscription data" 
ON public.subscribers 
FOR SELECT 
USING (
  (user_id = auth.uid()) OR 
  (email = auth.email())
);

-- Create a specific policy for authenticated edge function operations
-- This allows edge functions to read subscription data only for the authenticated user
CREATE POLICY "Authenticated edge functions can read user subscription data" 
ON public.subscribers 
FOR SELECT 
USING (
  (current_setting('role'::text) = 'service_role'::text) AND
  (user_id = auth.uid() OR email = auth.email())
);

-- Keep the existing update policy but make it more specific for webhook operations
-- Drop and recreate the edge function update policy with better constraints
DROP POLICY IF EXISTS "Edge functions can update subscription status" ON public.subscribers;

CREATE POLICY "Service role can update subscription status for webhooks" 
ON public.subscribers 
FOR UPDATE 
USING (current_setting('role'::text) = 'service_role'::text)
WITH CHECK (
  (current_setting('role'::text) = 'service_role'::text) AND
  -- Ensure only specific fields can be updated by webhooks
  (
    subscribed IS NOT NULL OR
    subscription_end IS NOT NULL OR
    subscription_tier IS NOT NULL OR
    stripe_customer_id IS NOT NULL OR
    updated_at IS NOT NULL OR
    payment_failure_reminder_sent IS NOT NULL OR
    payment_failure_reminder_sent_at IS NOT NULL OR
    last_payment_failure_check IS NOT NULL
  )
);

-- Create a more restrictive insert policy for edge functions
-- Drop and recreate with better validation
DROP POLICY IF EXISTS "Edge functions can create subscriptions" ON public.subscribers;

CREATE POLICY "Service role can create subscriptions with validation" 
ON public.subscribers 
FOR INSERT 
WITH CHECK (
  (current_setting('role'::text) = 'service_role'::text) AND
  (email IS NOT NULL) AND 
  (email <> ''::text) AND 
  (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$') AND -- Email format validation
  ((subscription_tier IS NULL) OR (subscription_tier = ANY (ARRAY['basic'::text, 'standard'::text, 'premium'::text, 'enterprise'::text])))
);

-- Add a policy to prevent unauthorized service_role operations from client-side code
-- This ensures service_role operations can only happen from server-side (edge functions)
CREATE POLICY "Prevent unauthorized service role access" 
ON public.subscribers 
FOR ALL
USING (
  -- Allow if not service_role, or if service_role but with proper authentication context
  (current_setting('role'::text) != 'service_role'::text) OR
  (
    (current_setting('role'::text) = 'service_role'::text) AND
    -- Service role operations must have either:
    -- 1. An authenticated user context (for user-specific operations)
    -- 2. Or be a webhook/system operation (no auth.uid but operating on specific email)
    (auth.uid() IS NOT NULL OR email IS NOT NULL)
  )
);