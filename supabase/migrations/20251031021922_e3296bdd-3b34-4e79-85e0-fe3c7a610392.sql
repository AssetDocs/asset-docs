-- Fix security vulnerabilities by tightening RLS policies

-- 1. Fix gift_subscriptions policies - ensure proper data isolation
DROP POLICY IF EXISTS "Deny unauthorized access" ON public.gift_subscriptions;
DROP POLICY IF EXISTS "Purchasers can view their own gifts only" ON public.gift_subscriptions;
DROP POLICY IF EXISTS "Recipients can view their own gifts only" ON public.gift_subscriptions;
DROP POLICY IF EXISTS "Restricted service role operations" ON public.gift_subscriptions;
DROP POLICY IF EXISTS "Secure gift claiming verification" ON public.gift_subscriptions;

-- Purchasers can only view their own purchased gifts
CREATE POLICY "Purchasers view own gifts"
ON public.gift_subscriptions
FOR SELECT
TO authenticated
USING (auth.uid() = purchaser_user_id);

-- Recipients can view gifts assigned to them
CREATE POLICY "Recipients view assigned gifts"
ON public.gift_subscriptions
FOR SELECT
TO authenticated
USING (
  auth.uid() = recipient_user_id 
  OR (
    auth.email() = recipient_email 
    AND recipient_user_id IS NULL 
    AND status = 'paid' 
    AND redeemed = false
  )
);

-- Only authenticated users can claim their own gifts
CREATE POLICY "Users can claim own gifts"
ON public.gift_subscriptions
FOR UPDATE
TO authenticated
USING (
  auth.email() = recipient_email 
  AND recipient_user_id IS NULL 
  AND status = 'paid' 
  AND redeemed = false
)
WITH CHECK (
  auth.uid() = recipient_user_id 
  AND redeemed = true 
  AND redeemed_by_user_id = auth.uid()
);

-- Service role can manage for webhooks
CREATE POLICY "Service role webhook access"
ON public.gift_subscriptions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 2. Fix subscribers policies - ensure only user can see their own subscription
DROP POLICY IF EXISTS "Service role can create subscriptions with validation" ON public.subscribers;
DROP POLICY IF EXISTS "Service role can update subscription status for webhooks" ON public.subscribers;
DROP POLICY IF EXISTS "Service role webhook operations only" ON public.subscribers;
DROP POLICY IF EXISTS "Users can insert their own subscription" ON public.subscribers;
DROP POLICY IF EXISTS "Users can only insert their own subscription" ON public.subscribers;
DROP POLICY IF EXISTS "Users can only update their own subscription" ON public.subscribers;
DROP POLICY IF EXISTS "Users can only view their own subscription data" ON public.subscribers;
DROP POLICY IF EXISTS "Users can update their own subscription" ON public.subscribers;
DROP POLICY IF EXISTS "Users can view own subscription by user_id" ON public.subscribers;
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.subscribers;

-- Users can only view their own subscription
CREATE POLICY "Users view own subscription"
ON public.subscribers
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own subscription
CREATE POLICY "Users insert own subscription"
ON public.subscribers
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own subscription
CREATE POLICY "Users update own subscription"
ON public.subscribers
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Service role can manage for webhooks
CREATE POLICY "Service role manages subscriptions"
ON public.subscribers
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 3. Fix leads policies - only admins should see leads
DROP POLICY IF EXISTS "Only admins can view leads" ON public.leads;
DROP POLICY IF EXISTS "Only edge functions can insert leads" ON public.leads;

-- Only admins can view leads
CREATE POLICY "Admins view leads"
ON public.leads
FOR SELECT
TO authenticated
USING (has_app_role(auth.uid(), 'admin'::app_role));

-- Service role can insert leads
CREATE POLICY "Service role inserts leads"
ON public.leads
FOR INSERT
TO service_role
WITH CHECK (true);

-- 4. Fix profiles policies - ensure account numbers are protected
DROP POLICY IF EXISTS "Profiles are viewable by users and contributors" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Users can view their own profile
CREATE POLICY "Users view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Contributors with viewer access can view profiles
CREATE POLICY "Contributors view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (has_contributor_access(user_id, 'viewer'::contributor_role));

-- Users can insert their own profile
CREATE POLICY "Users insert own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 5. Ensure payment_events are properly secured
DROP POLICY IF EXISTS "Only service role can manage payment events" ON public.payment_events;

CREATE POLICY "Service role manages payment events"
ON public.payment_events
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);