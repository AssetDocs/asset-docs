-- Fix critical security vulnerability in subscribers table INSERT policy
-- Replace the overly permissive insert policy with a secure one

DROP POLICY IF EXISTS "insert_subscription" ON public.subscribers;

-- Create secure INSERT policy that only allows authenticated users to create their own subscription records
CREATE POLICY "Users can insert their own subscription" 
ON public.subscribers 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Ensure edge functions can still manage subscriptions by creating a separate policy for service role
-- This policy allows service role operations (used by edge functions) to bypass user restrictions
CREATE POLICY "Service role can manage subscriptions" 
ON public.subscribers 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);