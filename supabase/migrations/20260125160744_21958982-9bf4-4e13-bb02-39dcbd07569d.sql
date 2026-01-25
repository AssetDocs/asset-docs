-- =============================================
-- PHASE 1: Create entitlements as single source of truth
-- =============================================

-- 1. Create entitlements table
CREATE TABLE public.entitlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  plan text NOT NULL DEFAULT 'free',
  status text NOT NULL DEFAULT 'inactive',
  current_period_end timestamp with time zone,
  source_event_id text,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  
  CONSTRAINT valid_plan CHECK (plan IN ('free', 'standard', 'premium')),
  CONSTRAINT valid_status CHECK (status IN ('active', 'past_due', 'canceled', 'inactive', 'trialing'))
);

-- 2. Create stripe_events table for webhook idempotency
CREATE TABLE public.stripe_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id text NOT NULL UNIQUE,
  event_type text NOT NULL,
  processed_at timestamp with time zone NOT NULL DEFAULT now(),
  outcome text DEFAULT 'pending',
  error_message text,
  payload jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  
  CONSTRAINT valid_outcome CHECK (outcome IN ('pending', 'success', 'skipped', 'error'))
);

-- 3. Create index for faster lookups
CREATE INDEX idx_entitlements_user_id ON public.entitlements(user_id);
CREATE INDEX idx_entitlements_status ON public.entitlements(status);
CREATE INDEX idx_stripe_events_event_id ON public.stripe_events(stripe_event_id);
CREATE INDEX idx_stripe_events_created_at ON public.stripe_events(created_at DESC);

-- 4. Enable RLS on both tables
ALTER TABLE public.entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_events ENABLE ROW LEVEL SECURITY;

-- 5. RLS policies for entitlements
-- Users can view their own entitlements
CREATE POLICY "Users can view own entitlements"
ON public.entitlements
FOR SELECT
USING (auth.uid() = user_id);

-- Service role can manage all entitlements (for webhooks)
CREATE POLICY "Service role manages entitlements"
ON public.entitlements
FOR ALL
USING (true)
WITH CHECK (true);

-- Admins can view all entitlements
CREATE POLICY "Admins can view all entitlements"
ON public.entitlements
FOR SELECT
USING (has_app_role(auth.uid(), 'admin'::app_role));

-- 6. RLS policies for stripe_events (admin/service only)
CREATE POLICY "Service role manages stripe events"
ON public.stripe_events
FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Admins can view stripe events"
ON public.stripe_events
FOR SELECT
USING (has_app_role(auth.uid(), 'admin'::app_role));

-- 7. Create helper function to check entitlement status
CREATE OR REPLACE FUNCTION public.has_active_entitlement(target_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.entitlements
    WHERE user_id = target_user_id
      AND status IN ('active', 'trialing')
  );
$$;

-- 8. Create helper function to get user's plan
CREATE OR REPLACE FUNCTION public.get_user_plan(target_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT plan FROM public.entitlements WHERE user_id = target_user_id AND status IN ('active', 'trialing')),
    'free'
  );
$$;

-- 9. Migrate existing subscription data from profiles to entitlements
INSERT INTO public.entitlements (user_id, plan, status, current_period_end, updated_at)
SELECT 
  p.user_id,
  CASE 
    WHEN p.plan_id ILIKE '%premium%' OR p.plan_id ILIKE '%professional%' THEN 'premium'
    WHEN p.plan_id ILIKE '%standard%' OR p.plan_id ILIKE '%homeowner%' THEN 'standard'
    ELSE 'free'
  END as plan,
  CASE 
    WHEN p.plan_status = 'active' THEN 'active'
    WHEN p.plan_status = 'trialing' THEN 'trialing'
    WHEN p.plan_status = 'past_due' THEN 'past_due'
    WHEN p.plan_status = 'canceled' OR p.plan_status = 'canceling' THEN 'canceled'
    ELSE 'inactive'
  END as status,
  p.current_period_end,
  now()
FROM public.profiles p
WHERE p.user_id IS NOT NULL
ON CONFLICT (user_id) DO UPDATE SET
  plan = EXCLUDED.plan,
  status = EXCLUDED.status,
  current_period_end = EXCLUDED.current_period_end,
  updated_at = now();

-- 10. Create trigger to auto-update updated_at
CREATE TRIGGER update_entitlements_updated_at
BEFORE UPDATE ON public.entitlements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 11. Create trigger to create entitlement row for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_entitlement()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.entitlements (user_id, plan, status)
  VALUES (NEW.id, 'free', 'inactive')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_entitlement
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user_entitlement();