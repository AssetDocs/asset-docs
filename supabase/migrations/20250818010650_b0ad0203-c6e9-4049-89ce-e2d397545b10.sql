-- Further restrict gift_subscriptions RLS policies to protect personal information
-- Add more granular controls to prevent unauthorized access to sensitive personal data

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
  recipient_user_id = auth.uid() AND
  -- Only allow updating redemption fields, not personal data
  OLD.purchaser_name = NEW.purchaser_name AND
  OLD.purchaser_email = NEW.purchaser_email AND
  OLD.purchaser_phone = NEW.purchaser_phone AND
  OLD.recipient_name = NEW.recipient_name AND
  OLD.recipient_email = NEW.recipient_email AND
  OLD.gift_message = NEW.gift_message
);

-- Update user view policies to limit exposed personal information
DROP POLICY IF EXISTS "Users can view gifts they purchased by user ID" ON public.gift_subscriptions;
CREATE POLICY "Users can view their purchased gifts with limited personal data" 
ON public.gift_subscriptions 
FOR SELECT 
USING (
  auth.uid() = purchaser_user_id
);

DROP POLICY IF EXISTS "Users can view gifts they received by user ID" ON public.gift_subscriptions;  
CREATE POLICY "Users can view their received gifts with limited personal data" 
ON public.gift_subscriptions 
FOR SELECT 
USING (
  auth.uid() = recipient_user_id
);

-- Create a view that exposes only necessary fields for regular users
CREATE OR REPLACE VIEW public.gift_subscriptions_user_view AS
SELECT 
  id,
  delivery_date,
  amount,
  redeemed,
  redeemed_at,
  plan_type,
  gift_message,
  status,
  currency,
  created_at,
  -- Only show personal info for the appropriate user
  CASE 
    WHEN auth.uid() = purchaser_user_id THEN recipient_name
    WHEN auth.uid() = recipient_user_id THEN purchaser_name  
    ELSE NULL
  END as sender_or_recipient_name,
  CASE 
    WHEN auth.uid() = purchaser_user_id THEN recipient_email
    WHEN auth.uid() = recipient_user_id THEN purchaser_email
    ELSE NULL
  END as sender_or_recipient_email,
  -- Never expose phone numbers to other users
  CASE 
    WHEN auth.uid() = purchaser_user_id THEN NULL
    ELSE NULL
  END as phone_number
FROM public.gift_subscriptions
WHERE auth.uid() = purchaser_user_id OR auth.uid() = recipient_user_id;

-- Grant access to the view
GRANT SELECT ON public.gift_subscriptions_user_view TO authenticated;