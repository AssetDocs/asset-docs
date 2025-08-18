-- Fix security linter warnings - proper dependency handling

-- Drop functions that depend on the views first
DROP FUNCTION IF EXISTS public.get_purchaser_gifts();
DROP FUNCTION IF EXISTS public.get_recipient_gifts();

-- Now drop the views
DROP VIEW IF EXISTS public.purchaser_gift_view CASCADE;
DROP VIEW IF EXISTS public.recipient_gift_view CASCADE;

-- Remove the problematic RLS policies that used application_name
DROP POLICY IF EXISTS "Purchasers restricted access" ON public.gift_subscriptions;
DROP POLICY IF EXISTS "Recipients restricted access" ON public.gift_subscriptions;

-- Create secure functions with proper search_path (no views needed)
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

-- Fix the existing function by adding search_path
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

-- Create secure RLS policies that block direct table access
-- This forces users to use the secure functions instead
CREATE POLICY "Block direct user table access" 
ON public.gift_subscriptions 
FOR SELECT 
TO authenticated
USING (false); -- Completely blocks direct SELECT access

-- Grant proper permissions
GRANT EXECUTE ON FUNCTION public.get_purchaser_gifts() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_recipient_gifts() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_claimable_gift(text) TO authenticated;

-- Add security documentation
COMMENT ON POLICY "Block direct user table access" ON public.gift_subscriptions IS 
'Blocks all direct user access to gift_subscriptions table. Users must use secure functions: get_purchaser_gifts(), get_recipient_gifts(), or get_claimable_gift().';

COMMENT ON FUNCTION public.get_purchaser_gifts() IS 
'Returns limited gift data for purchasers only. Excludes sensitive data like phone numbers and full personal details.';

COMMENT ON FUNCTION public.get_recipient_gifts() IS 
'Returns limited gift data for recipients only. Excludes sensitive purchaser information like phone numbers.';

COMMENT ON FUNCTION public.get_claimable_gift(text) IS 
'Preview gift details for claiming. Only shows essential information needed for gift claiming process.';