-- =========================================
-- FIX OVERLY PERMISSIVE RLS POLICIES
-- =========================================
-- These "Service role manages..." policies with USING(true) are redundant
-- because service_role bypasses RLS entirely. Removing them improves security
-- by preventing any authenticated user from accessing these operations.

-- 1. DROP redundant service role policies (service role bypasses RLS anyway)

DROP POLICY IF EXISTS "Service role manages verification" ON public.account_verification;
DROP POLICY IF EXISTS "Service role manages entitlements" ON public.entitlements;
DROP POLICY IF EXISTS "Service role webhook access" ON public.gift_subscriptions;
DROP POLICY IF EXISTS "Service role inserts leads" ON public.leads;
DROP POLICY IF EXISTS "Service role manages legal signatures" ON public.legal_agreement_signatures;
DROP POLICY IF EXISTS "Service role manages payment events" ON public.payment_events;
DROP POLICY IF EXISTS "Service role manages stripe events" ON public.stripe_events;
DROP POLICY IF EXISTS "Service role manages subscriptions" ON public.subscribers;
DROP POLICY IF EXISTS "Service role can insert activity logs" ON public.user_activity_logs;

-- 2. Fix events table - require authentication for analytics insert
DROP POLICY IF EXISTS "allow_insert_events" ON public.events;
CREATE POLICY "Authenticated users can insert events"
ON public.events
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 3. Add proper user activity log policy - require authentication
CREATE POLICY "Authenticated users can insert activity logs"
ON public.user_activity_logs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 4. Restrict deleted_accounts SELECT to admins only (currently exposed to anyone)
DROP POLICY IF EXISTS "Anyone can check deleted accounts" ON public.deleted_accounts;
CREATE POLICY "Admins can view deleted accounts"
ON public.deleted_accounts
FOR SELECT
USING (has_app_role(auth.uid(), 'admin'));