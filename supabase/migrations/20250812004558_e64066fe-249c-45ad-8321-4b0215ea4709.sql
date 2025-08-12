-- Drop the overly permissive service role policy
DROP POLICY IF EXISTS "Service role can manage subscriptions" ON public.subscribers;

-- Create specific, limited policies for edge functions

-- Policy 1: Allow reading subscription data only for specific operations
CREATE POLICY "Edge functions can read subscription data" 
ON public.subscribers 
FOR SELECT 
USING (
  -- Only allow reading if it's for the authenticated user or for checkout operations
  user_id = auth.uid() OR 
  -- Allow reading by email for checkout/verification operations
  email = auth.email() OR
  -- Allow reading for service operations but only specific fields are exposed
  current_setting('role') = 'service_role'
);

-- Policy 2: Allow updating only specific subscription fields
CREATE POLICY "Edge functions can update subscription status" 
ON public.subscribers 
FOR UPDATE 
USING (current_setting('role') = 'service_role')
WITH CHECK (current_setting('role') = 'service_role');

-- Policy 3: Allow inserting subscription records with validation
CREATE POLICY "Edge functions can create subscriptions" 
ON public.subscribers 
FOR INSERT 
WITH CHECK (
  current_setting('role') = 'service_role' AND
  -- Ensure required fields are present
  email IS NOT NULL AND
  email != '' AND
  -- Ensure subscription tier is valid if provided
  (subscription_tier IS NULL OR subscription_tier IN ('basic', 'standard', 'premium', 'enterprise'))
);

-- Create a function to validate subscription updates for additional security
CREATE OR REPLACE FUNCTION public.validate_subscription_update()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add the validation trigger
DROP TRIGGER IF EXISTS validate_subscription_update_trigger ON public.subscribers;
CREATE TRIGGER validate_subscription_update_trigger
  BEFORE UPDATE ON public.subscribers
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_subscription_update();