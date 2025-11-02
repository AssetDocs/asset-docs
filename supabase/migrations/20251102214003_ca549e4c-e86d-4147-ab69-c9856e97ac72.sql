-- Add subscription-related columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS plan_id TEXT,
ADD COLUMN IF NOT EXISTS plan_status TEXT DEFAULT 'inactive',
ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS property_limit INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS storage_quota_gb INTEGER DEFAULT 5;

-- Create an index on stripe_customer_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer ON public.profiles(stripe_customer_id);

-- Create an index on plan_status for filtering active users
CREATE INDEX IF NOT EXISTS idx_profiles_plan_status ON public.profiles(plan_status);

-- Add constraint to ensure valid plan statuses
ALTER TABLE public.profiles
ADD CONSTRAINT check_plan_status 
CHECK (plan_status IN ('active', 'trialing', 'past_due', 'canceled', 'inactive', 'unpaid'));

COMMENT ON COLUMN public.profiles.stripe_customer_id IS 'Stripe customer ID for billing';
COMMENT ON COLUMN public.profiles.plan_id IS 'Current Stripe price ID (e.g., standard_25gb_month)';
COMMENT ON COLUMN public.profiles.plan_status IS 'Subscription status from Stripe';
COMMENT ON COLUMN public.profiles.current_period_end IS 'When the current billing period ends';
COMMENT ON COLUMN public.profiles.property_limit IS 'Maximum number of properties (3 for standard, unlimited=-1 for premium)';
COMMENT ON COLUMN public.profiles.storage_quota_gb IS 'Storage quota in GB (25 for standard, 100 for premium)';