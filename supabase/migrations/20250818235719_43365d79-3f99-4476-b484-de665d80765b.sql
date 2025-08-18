-- Fix security linter warnings from previous migration

-- Drop the problematic security definer views
DROP VIEW IF EXISTS public.purchaser_gift_view;
DROP VIEW IF EXISTS public.recipient_gift_view;

-- Fix the functions by adding proper search_path settings
CREATE OR REPLACE FUNCTION public.get_purchaser_gifts()
RETURNS TABLE(
  id uuid,
  delivery_date timestamptz,
  amount integer,
  redeemed boolean,
  redeemed_at timestamptz,
  created_at timestamptz,
  plan_type text,
  recipient_name text,
  recipient_email text,
  gift_message text,
  status text,
  currency text
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT 
    gs.id,
    gs.delivery_date,
    gs.amount,
    gs.redeemed,
    gs.redeemed_at,
    gs.created_at,
    gs.plan_type,
    gs.recipient_name,
    gs.recipient_email,
    gs.gift_message,
    gs.status,
    gs.currency
  FROM public.gift_subscriptions gs
  WHERE auth.uid() = gs.purchaser_user_id;
$$;

CREATE OR REPLACE FUNCTION public.get_recipient_gifts()
RETURNS TABLE(
  id uuid,
  delivery_date timestamptz,
  amount integer,
  created_at timestamptz,
  plan_type text,
  purchaser_name text,
  gift_message text,
  status text,
  gift_code text,
  redeemed boolean,
  redeemed_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT 
    gs.id,
    gs.delivery_date,
    gs.amount,
    gs.created_at,
    gs.plan_type,
    gs.purchaser_name,
    gs.gift_message,
    gs.status,
    gs.gift_code,
    gs.redeemed,
    gs.redeemed_at
  FROM public.gift_subscriptions gs
  WHERE auth.uid() = gs.recipient_user_id 
  OR (
    auth.email() = gs.recipient_email 
    AND gs.recipient_user_id IS NULL 
    AND gs.status = 'paid' 
    AND gs.redeemed = false
  );
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
SET search_path = public
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

-- Remove the application_name based restrictions from RLS policies and simplify
DROP POLICY IF EXISTS "Purchasers restricted access" ON public.gift_subscriptions;
DROP POLICY IF EXISTS "Recipients restricted access" ON public.gift_subscriptions;

-- Create simpler, more secure policies that block direct table access
CREATE POLICY "Block direct purchaser access" 
ON public.gift_subscriptions 
FOR SELECT 
TO authenticated
USING (false); -- Blocks all direct access, forces use of functions

CREATE POLICY "Block direct recipient access"
ON public.gift_subscriptions
FOR SELECT
TO authenticated 
USING (false); -- Blocks all direct access, forces use of functions

-- Service role and gift claiming policies remain the same
-- They were already secure in the previous migration

-- Update function permissions
REVOKE ALL ON FUNCTION public.get_purchaser_gifts() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_recipient_gifts() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_claimable_gift(text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.get_purchaser_gifts() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_recipient_gifts() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_claimable_gift(text) TO authenticated;

-- Add documentation
COMMENT ON FUNCTION public.get_purchaser_gifts() IS 
'Secure function that returns limited gift purchase data for authenticated purchasers. Uses SECURITY DEFINER with restricted search_path for safety.';

COMMENT ON FUNCTION public.get_recipient_gifts() IS 
'Secure function that returns limited gift recipient data for authenticated recipients. Uses SECURITY DEFINER with restricted search_path for safety.';

COMMENT ON FUNCTION public.get_claimable_gift(text) IS 
'Secure function to preview gift details during claiming with email verification. Uses SECURITY DEFINER with restricted search_path for safety.';