-- Fix security vulnerability in gift_subscriptions RLS policies
-- Remove overly permissive edge function policy and replace with specific service role policies

-- Drop the problematic policy that allows unrestricted access
DROP POLICY IF EXISTS "Edge functions can manage gift subscriptions" ON public.gift_subscriptions;

-- Create more restrictive policies that only allow service role (edge functions) specific operations

-- Policy for edge functions to create gift subscriptions (create-gift-checkout)
CREATE POLICY "Service role can create gift subscriptions" 
ON public.gift_subscriptions 
FOR INSERT 
WITH CHECK (
  current_setting('role'::text) = 'service_role'::text
);

-- Policy for edge functions to read gift subscriptions for processing (send-gift-email, track-gift-login)
CREATE POLICY "Service role can read gift subscriptions for processing" 
ON public.gift_subscriptions 
FOR SELECT 
USING (
  current_setting('role'::text) = 'service_role'::text
);

-- Policy for edge functions to update gift subscriptions (send-gift-email, track-gift-login)
CREATE POLICY "Service role can update gift subscriptions for processing" 
ON public.gift_subscriptions 
FOR UPDATE 
USING (
  current_setting('role'::text) = 'service_role'::text
)
WITH CHECK (
  current_setting('role'::text) = 'service_role'::text
);