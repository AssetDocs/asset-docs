
-- Step 1: Add entitlement_source column
ALTER TABLE public.entitlements 
ADD COLUMN entitlement_source TEXT NOT NULL DEFAULT 'stripe';

-- Add CHECK constraint
ALTER TABLE public.entitlements 
ADD CONSTRAINT entitlements_source_check 
CHECK (entitlement_source IN ('stripe', 'lifetime', 'admin'));

-- Step 2: Backfill existing records
UPDATE public.entitlements 
SET entitlement_source = 'stripe' 
WHERE stripe_subscription_id IS NOT NULL;

UPDATE public.entitlements 
SET entitlement_source = 'admin' 
WHERE plan != 'free' AND stripe_subscription_id IS NULL;

-- Step 3: Fix user 5950acba's storage (premium with 0GB -> 100GB)
-- total_storage_gb is a generated column, so we only set base_storage_gb
UPDATE public.entitlements 
SET base_storage_gb = 100
WHERE user_id = '5950acba-e4ae-45c8-92e7-413a2efcc5d6' 
  AND plan = 'premium' 
  AND base_storage_gb = 0;

-- Step 4: Create validation trigger
CREATE OR REPLACE FUNCTION public.validate_entitlement_source()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Stripe source safety: active/trialing Stripe entitlements must have all Stripe IDs
  IF NEW.entitlement_source = 'stripe' AND NEW.status IN ('active', 'trialing') THEN
    IF NEW.stripe_subscription_id IS NULL 
       OR NEW.stripe_customer_id IS NULL 
       OR NEW.stripe_plan_price_id IS NULL 
       OR NEW.plan_lookup_key IS NULL THEN
      RAISE EXCEPTION 'Stripe-sourced active entitlement requires stripe_subscription_id, stripe_customer_id, stripe_plan_price_id, and plan_lookup_key to all be non-null';
    END IF;
  END IF;

  -- Normalize admin/lifetime storage defaults
  IF NEW.entitlement_source IN ('admin', 'lifetime') THEN
    IF NEW.plan = 'standard' THEN
      NEW.base_storage_gb := 25;
    ELSIF NEW.plan = 'premium' THEN
      NEW.base_storage_gb := 100;
    END IF;
    -- total_storage_gb is a generated column, no need to set it
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_entitlement_source_trigger
BEFORE INSERT OR UPDATE ON public.entitlements
FOR EACH ROW
EXECUTE FUNCTION public.validate_entitlement_source();
