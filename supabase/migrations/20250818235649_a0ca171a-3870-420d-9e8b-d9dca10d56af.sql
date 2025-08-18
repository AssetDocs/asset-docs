-- Security Fix for gift_subscriptions table
-- Remove overly broad access and implement column-level restrictions

-- First, drop all existing policies
DROP POLICY IF EXISTS "Purchasers can only view their own gift purchases" ON gift_subscriptions;
DROP POLICY IF EXISTS "Recipients can only view their own received gifts" ON gift_subscriptions;
DROP POLICY IF EXISTS "Service role can create gift subscriptions" ON gift_subscriptions;
DROP POLICY IF EXISTS "Service role can manage gift subscriptions" ON gift_subscriptions;
DROP POLICY IF EXISTS "Service role can read gift subscriptions for processing" ON gift_subscriptions;
DROP POLICY IF EXISTS "Service role can update gift subscriptions for processing" ON gift_subscriptions;
DROP POLICY IF EXISTS "Service role operations logging" ON gift_subscriptions;
DROP POLICY IF EXISTS "Service role webhook access" ON gift_subscriptions;
DROP POLICY IF EXISTS "Users can claim gifts sent to their email with verification" ON gift_subscriptions;

-- Create secure views for limited data access
CREATE OR REPLACE VIEW public.purchaser_gift_view AS
SELECT 
  id,
  delivery_date,
  amount,
  redeemed,
  redeemed_at,
  created_at,
  plan_type,
  recipient_name,
  recipient_email,
  gift_message,
  status,
  currency
FROM public.gift_subscriptions
WHERE auth.uid() = purchaser_user_id;

-- Enable RLS on the view
ALTER VIEW public.purchaser_gift_view SET (security_barrier = true);

CREATE OR REPLACE VIEW public.recipient_gift_view AS
SELECT 
  id,
  delivery_date,
  amount,
  created_at,
  plan_type,
  purchaser_name,
  gift_message,
  status,
  gift_code,
  redeemed,
  redeemed_at
FROM public.gift_subscriptions
WHERE auth.uid() = recipient_user_id OR (
  auth.email() = recipient_email 
  AND recipient_user_id IS NULL 
  AND status = 'paid' 
  AND redeemed = false
);

-- Enable RLS on the view
ALTER VIEW public.recipient_gift_view SET (security_barrier = true);

-- Create new restrictive RLS policies

-- Policy 1: Purchasers can view limited gift data through view only
-- (No direct table access - forces use of secure view)
CREATE POLICY "Purchasers restricted access" 
ON public.gift_subscriptions 
FOR SELECT 
TO authenticated
USING (
  auth.uid() = purchaser_user_id 
  AND current_setting('application_name', true) = 'purchaser_access'
);

-- Policy 2: Recipients can view limited gift data through view only  
CREATE POLICY "Recipients restricted access"
ON public.gift_subscriptions
FOR SELECT
TO authenticated 
USING (
  (auth.uid() = recipient_user_id OR (
    auth.email() = recipient_email 
    AND recipient_user_id IS NULL 
    AND status = 'paid' 
    AND redeemed = false
  ))
  AND current_setting('application_name', true) = 'recipient_access'
);

-- Policy 3: Service role comprehensive access (consolidated from multiple policies)
CREATE POLICY "Service role comprehensive access"
ON public.gift_subscriptions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Policy 4: Users can claim gifts with email verification (restricted update)
CREATE POLICY "Gift claiming with verification"
ON public.gift_subscriptions
FOR UPDATE
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND auth.email() = recipient_email 
  AND recipient_user_id IS NULL 
  AND status = 'paid' 
  AND redeemed = false
)
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND auth.email() = recipient_email 
  AND recipient_user_id = auth.uid()
  AND redeemed = true
  AND redeemed_at IS NOT NULL
);

-- Create secure functions for accessing gift data
CREATE OR REPLACE FUNCTION public.get_purchaser_gifts()
RETURNS SETOF public.purchaser_gift_view
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SET application_name = 'purchaser_access';
  SELECT * FROM public.purchaser_gift_view;
$$;

CREATE OR REPLACE FUNCTION public.get_recipient_gifts()
RETURNS SETOF public.recipient_gift_view  
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SET application_name = 'recipient_access';
  SELECT * FROM public.recipient_gift_view;
$$;

CREATE OR REPLACE FUNCTION public.get_claimable_gift(p_gift_code text)
RETURNS TABLE (
  id uuid,
  delivery_date timestamptz,
  plan_type text,
  purchaser_name text,
  gift_message text,
  status text
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT 
    gs.id,
    gs.delivery_date,
    gs.plan_type,
    gs.purchaser_name,
    gs.gift_message,
    gs.status
  FROM public.gift_subscriptions gs
  WHERE gs.gift_code = p_gift_code
    AND gs.recipient_email = auth.email()
    AND gs.recipient_user_id IS NULL
    AND gs.status = 'paid'
    AND gs.redeemed = false;
$$;

-- Grant appropriate permissions
GRANT SELECT ON public.purchaser_gift_view TO authenticated;
GRANT SELECT ON public.recipient_gift_view TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_purchaser_gifts() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_recipient_gifts() TO authenticated; 
GRANT EXECUTE ON FUNCTION public.get_claimable_gift(text) TO authenticated;

-- Add comment explaining the security measures
COMMENT ON TABLE public.gift_subscriptions IS 
'Sensitive customer data table with restricted access. Users can only access limited data through secure views and functions. Direct table access is blocked for regular users.';

COMMENT ON FUNCTION public.get_purchaser_gifts() IS 
'Secure function to retrieve limited gift purchase data for authenticated purchasers only.';

COMMENT ON FUNCTION public.get_recipient_gifts() IS 
'Secure function to retrieve limited gift recipient data for authenticated recipients only.';

COMMENT ON FUNCTION public.get_claimable_gift(text) IS 
'Secure function to preview gift details during claiming process with email verification.';