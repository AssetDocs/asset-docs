-- Add user ID columns for better security
ALTER TABLE public.gift_subscriptions ADD COLUMN IF NOT EXISTS purchaser_user_id UUID;

-- Add foreign key constraint to ensure data integrity
-- Note: We don't add NOT NULL constraint yet to avoid breaking existing data
ALTER TABLE public.gift_subscriptions 
ADD CONSTRAINT fk_purchaser_user_id 
FOREIGN KEY (purchaser_user_id) 
REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add recipient_user_id for when recipients create accounts
ALTER TABLE public.gift_subscriptions ADD COLUMN IF NOT EXISTS recipient_user_id UUID;
ALTER TABLE public.gift_subscriptions 
ADD CONSTRAINT fk_recipient_user_id 
FOREIGN KEY (recipient_user_id) 
REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_gift_subscriptions_purchaser_user_id ON public.gift_subscriptions(purchaser_user_id);
CREATE INDEX IF NOT EXISTS idx_gift_subscriptions_recipient_user_id ON public.gift_subscriptions(recipient_user_id);

-- Remove the insecure email-based policies
DROP POLICY IF EXISTS "Users can view gifts sent to them" ON public.gift_subscriptions;
DROP POLICY IF EXISTS "Users can view gifts they purchased" ON public.gift_subscriptions;

-- Create secure user ID-based policies
CREATE POLICY "Users can view gifts they purchased by user ID" 
ON public.gift_subscriptions 
FOR SELECT 
USING (auth.uid() = purchaser_user_id);

CREATE POLICY "Users can view gifts they received by user ID" 
ON public.gift_subscriptions 
FOR SELECT 
USING (auth.uid() = recipient_user_id);

-- Allow users to claim gifts by matching their email (but only update recipient_user_id)
CREATE POLICY "Users can claim gifts sent to their email" 
ON public.gift_subscriptions 
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL 
  AND auth.email() = recipient_email 
  AND recipient_user_id IS NULL
)
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND auth.email() = recipient_email 
  AND recipient_user_id = auth.uid()
);

-- Policy for edge functions (for creating and managing gifts)
-- This replaces the overly broad "Edge functions can manage gift subscriptions" policy
CREATE POLICY "Service role can manage gift subscriptions" 
ON public.gift_subscriptions 
FOR ALL 
USING (current_setting('role') = 'service_role')
WITH CHECK (current_setting('role') = 'service_role');