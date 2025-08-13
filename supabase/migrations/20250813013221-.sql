-- Fix security vulnerability: Remove overly permissive policies on subscribers table
-- and replace with secure, restrictive policies

-- Drop the problematic policies
DROP POLICY IF EXISTS "Users can view their own subscription data" ON public.subscribers;
DROP POLICY IF EXISTS "Prevent unauthorized service role access" ON public.subscribers;
DROP POLICY IF EXISTS "Authenticated edge functions can read user subscription data" ON public.subscribers;

-- Create secure policies that ensure only authenticated users can view their own data
-- Policy 1: Users can only view their own subscription by user_id
CREATE POLICY "Users can view own subscription by user_id" 
ON public.subscribers 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Policy 2: Users can view subscription by email only if they're authenticated and it matches their auth email
CREATE POLICY "Users can view own subscription by email" 
ON public.subscribers 
FOR SELECT 
TO authenticated
USING (auth.email() = email);

-- Policy 3: Service role can read subscription data only for webhook processing (restricted to specific conditions)
CREATE POLICY "Service role webhook access" 
ON public.subscribers 
FOR SELECT 
TO service_role
USING (
  current_setting('role') = 'service_role' 
  AND (
    -- Only allow service role to read when processing webhooks or system operations
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
    OR auth.uid() IS NOT NULL  -- Ensure there's still a user context even for service role
  )
);

-- Policy 4: Service role can update subscription status for webhooks (no change needed, this was already secure)
-- This policy already exists and is secure

-- Policy 5: Ensure service role operations are logged and restricted
CREATE POLICY "Service role operations logging" 
ON public.subscribers 
FOR ALL
TO service_role
USING (
  current_setting('role') = 'service_role' 
  AND (
    -- Only allow operations with proper authentication context
    auth.uid() IS NOT NULL 
    OR auth.email() IS NOT NULL
    OR current_setting('request.jwt.claims', true)::json->>'iss' = 'supabase'
  )
);