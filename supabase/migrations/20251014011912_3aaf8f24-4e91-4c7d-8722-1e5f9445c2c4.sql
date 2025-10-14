-- Fix Contributors Table RLS Policy - Check invitation status
-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Contributors cannot access unauthorized data" ON public.contributors;

-- Create refined policy that checks invitation status
CREATE POLICY "Contributors can view relevant invitations"
ON public.contributors
FOR SELECT
USING (
  (auth.uid() = account_owner_id) OR 
  (auth.uid() = contributor_user_id AND status = 'accepted') OR 
  (auth.email() = contributor_email AND status = 'pending' AND created_at > NOW() - INTERVAL '30 days')
);

-- Improve gift code security by adding attempt tracking table
CREATE TABLE IF NOT EXISTS public.gift_claim_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_code TEXT NOT NULL,
  attempted_email TEXT NOT NULL,
  attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  success BOOLEAN DEFAULT FALSE
);

-- Enable RLS on gift claim attempts
ALTER TABLE public.gift_claim_attempts ENABLE ROW LEVEL SECURITY;

-- Only service role can manage attempt tracking
CREATE POLICY "Service role manages claim attempts"
ON public.gift_claim_attempts
FOR ALL
USING (current_setting('role') = 'service_role')
WITH CHECK (current_setting('role') = 'service_role');

-- Add index for efficient rate limiting queries
CREATE INDEX IF NOT EXISTS idx_gift_claim_attempts_email_time 
ON public.gift_claim_attempts(attempted_email, attempted_at DESC);

-- Create function to check gift claim rate limit
CREATE OR REPLACE FUNCTION public.check_gift_claim_rate_limit(
  p_email TEXT,
  p_gift_code TEXT,
  p_ip_address INET
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_attempts_count INTEGER;
  v_rate_limited BOOLEAN := FALSE;
BEGIN
  -- Count attempts in last hour for this email
  SELECT COUNT(*) INTO v_attempts_count
  FROM public.gift_claim_attempts
  WHERE attempted_email = p_email
    AND attempted_at > NOW() - INTERVAL '1 hour';
  
  -- Rate limit: max 5 attempts per hour per email
  IF v_attempts_count >= 5 THEN
    v_rate_limited := TRUE;
  END IF;
  
  -- Log this attempt
  INSERT INTO public.gift_claim_attempts (gift_code, attempted_email, ip_address, success)
  VALUES (p_gift_code, p_email, p_ip_address, NOT v_rate_limited);
  
  RETURN jsonb_build_object(
    'allowed', NOT v_rate_limited,
    'attempts_remaining', GREATEST(0, 5 - v_attempts_count - 1)
  );
END;
$$;

-- Improve get_claimable_gift to return minimal info initially
CREATE OR REPLACE FUNCTION public.get_claimable_gift_preview(p_gift_code TEXT)
RETURNS TABLE(has_gift BOOLEAN, delivery_date TIMESTAMP WITH TIME ZONE)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    TRUE as has_gift,
    gs.delivery_date
  FROM public.gift_subscriptions gs
  WHERE gs.gift_code = p_gift_code
    AND gs.recipient_email = auth.email()
    AND gs.recipient_user_id IS NULL
    AND gs.status = 'paid'
    AND gs.redeemed = false
  LIMIT 1;
$$;