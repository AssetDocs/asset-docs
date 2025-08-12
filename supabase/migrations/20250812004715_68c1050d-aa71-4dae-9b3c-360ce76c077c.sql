-- Fix the search path security issue by setting it properly on the validation function
CREATE OR REPLACE FUNCTION public.validate_subscription_update()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path TO 'public'
AS $$
BEGIN
  -- Prevent unauthorized modification of critical fields
  IF TG_OP = 'UPDATE' THEN
    IF OLD.email IS DISTINCT FROM NEW.email AND OLD.email IS NOT NULL THEN
      RAISE EXCEPTION 'Email address cannot be modified once set';
    END IF;
    
    -- Validate subscription tier changes
    IF NEW.subscription_tier IS NOT NULL AND 
       NEW.subscription_tier NOT IN ('basic', 'standard', 'premium', 'enterprise') THEN
      RAISE EXCEPTION 'Invalid subscription tier: %', NEW.subscription_tier;
    END IF;
    
    -- Validate subscription end date logic
    IF NEW.subscribed = true AND NEW.subscription_end IS NOT NULL AND NEW.subscription_end < NOW() THEN
      RAISE EXCEPTION 'Cannot set active subscription with past end date';
    END IF;
    
    -- Automatically update the updated_at timestamp
    NEW.updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$;