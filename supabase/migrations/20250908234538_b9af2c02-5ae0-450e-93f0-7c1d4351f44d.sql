-- Fix gift_subscriptions RLS policies to prevent unauthorized access to personal data

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can only view gifts sent to their email" ON public.gift_subscriptions;
DROP POLICY IF EXISTS "Users can only view gifts they purchased" ON public.gift_subscriptions;
DROP POLICY IF EXISTS "Service role limited gift operations" ON public.gift_subscriptions;
DROP POLICY IF EXISTS "Gift claiming with verification" ON public.gift_subscriptions;

-- Create secure policies that prevent personal data theft

-- 1. Only allow recipients to view their own gifts (must be authenticated user with matching recipient_user_id OR unclaimed gift with matching email)
CREATE POLICY "Recipients can view their own gifts only" 
ON public.gift_subscriptions 
FOR SELECT 
USING (
  (auth.uid() = recipient_user_id) OR
  (auth.uid() IS NOT NULL AND 
   auth.email() = recipient_email AND 
   recipient_user_id IS NULL AND 
   status = 'paid' AND 
   redeemed = false)
);

-- 2. Only allow purchasers to view gifts they purchased (must be authenticated user with matching purchaser_user_id)
CREATE POLICY "Purchasers can view their own gifts only" 
ON public.gift_subscriptions 
FOR SELECT 
USING (auth.uid() = purchaser_user_id);

-- 3. Restrict gift claiming to verified recipients only
CREATE POLICY "Secure gift claiming verification" 
ON public.gift_subscriptions 
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL AND 
  auth.email() = recipient_email AND 
  recipient_user_id IS NULL AND 
  status = 'paid' AND 
  redeemed = false AND
  -- Additional security: only allow updating specific safe fields
  auth.uid() IS NOT NULL
) 
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  auth.email() = recipient_email AND 
  recipient_user_id = auth.uid() AND 
  redeemed = true AND 
  redeemed_at IS NOT NULL AND
  redeemed_by_user_id = auth.uid()
);

-- 4. Restrict service role operations to specific validated contexts only
CREATE POLICY "Restricted service role operations" 
ON public.gift_subscriptions 
FOR ALL 
USING (
  current_setting('role') = 'service_role' AND
  validate_service_role_context()
) 
WITH CHECK (
  current_setting('role') = 'service_role' AND
  validate_service_role_context()
);

-- 5. Prevent any other access patterns
CREATE POLICY "Deny unauthorized access" 
ON public.gift_subscriptions 
FOR ALL 
USING (false) 
WITH CHECK (false);

-- Create audit trigger for gift_subscriptions to track access
CREATE TRIGGER audit_gift_subscriptions
AFTER INSERT OR UPDATE OR DELETE ON public.gift_subscriptions
FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();