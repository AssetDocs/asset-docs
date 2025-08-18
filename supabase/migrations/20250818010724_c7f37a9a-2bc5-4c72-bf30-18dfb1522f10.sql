-- Further restrict gift_subscriptions RLS policies to protect personal information
-- Simplify policies without OLD/NEW references which aren't available in RLS

-- Update the user claim policy to be more restrictive  
DROP POLICY IF EXISTS "Users can claim gifts sent to their email" ON public.gift_subscriptions;
CREATE POLICY "Users can claim gifts sent to their email with verification" 
ON public.gift_subscriptions 
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL AND 
  auth.email() = recipient_email AND 
  recipient_user_id IS NULL AND
  status = 'paid' AND
  redeemed = false
)
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  auth.email() = recipient_email AND 
  recipient_user_id = auth.uid()
);

-- Update user view policies to be more explicit about data access
DROP POLICY IF EXISTS "Users can view their purchased gifts with limited personal data" ON public.gift_subscriptions;
DROP POLICY IF EXISTS "Users can view gifts they purchased by user ID" ON public.gift_subscriptions;
CREATE POLICY "Purchasers can only view their own gift purchases" 
ON public.gift_subscriptions 
FOR SELECT 
USING (
  auth.uid() = purchaser_user_id
);

DROP POLICY IF EXISTS "Users can view their received gifts with limited personal data" ON public.gift_subscriptions;  
DROP POLICY IF EXISTS "Users can view gifts they received by user ID" ON public.gift_subscriptions;
CREATE POLICY "Recipients can only view their own received gifts" 
ON public.gift_subscriptions 
FOR SELECT 
USING (
  auth.uid() = recipient_user_id
);

-- Add additional constraint to prevent users from inserting gifts with other users' data
DROP POLICY IF EXISTS "Users can insert their own gifts" ON public.gift_subscriptions;
-- Users should not be able to directly insert gift subscriptions - only service role can