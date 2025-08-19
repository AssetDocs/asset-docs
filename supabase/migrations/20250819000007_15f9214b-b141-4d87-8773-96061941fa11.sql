-- Final optimization: Simplify RLS policies for gift_subscriptions

-- Remove the redundant blocking policies
DROP POLICY IF EXISTS "Block direct purchaser access" ON public.gift_subscriptions;
DROP POLICY IF EXISTS "Block direct recipient access" ON public.gift_subscriptions;

-- Create a single, clear, restrictive policy for authenticated users
CREATE POLICY "Authenticated users blocked from direct access"
ON public.gift_subscriptions
FOR SELECT
TO authenticated
USING (false); -- Completely blocks direct table access for all authenticated users

-- Add explicit comment explaining the security model
COMMENT ON POLICY "Authenticated users blocked from direct access" ON public.gift_subscriptions IS 
'Security policy: Blocks all direct table access for regular users. Data access only through secure functions: get_purchaser_gifts(), get_recipient_gifts(), and get_claimable_gift().';

COMMENT ON TABLE public.gift_subscriptions IS 
'SECURITY NOTICE: This table contains highly sensitive customer data. Direct access is completely blocked for regular users. All data access must go through secure functions: get_purchaser_gifts(), get_recipient_gifts(), get_claimable_gift(). Service roles have full access for payment processing and gift management.';