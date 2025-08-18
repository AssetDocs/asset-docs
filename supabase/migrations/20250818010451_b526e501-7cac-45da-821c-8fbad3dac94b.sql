-- Fix security vulnerability in gift_subscriptions RLS policies
-- Remove overly permissive edge function policy and replace with specific policies

-- Drop the problematic policy that allows unrestricted access
DROP POLICY IF EXISTS "Edge functions can manage gift subscriptions" ON public.gift_subscriptions;

-- Create specific policies for edge functions with proper restrictions

-- Policy for gift creation (create-gift-checkout function)
CREATE POLICY "Service role can create gift subscriptions" 
ON public.gift_subscriptions 
FOR INSERT 
WITH CHECK (
  current_setting('role'::text) = 'service_role'::text
);

-- Policy for gift email sending (send-gift-email function)
CREATE POLICY "Service role can read gifts for email delivery" 
ON public.gift_subscriptions 
FOR SELECT 
USING (
  current_setting('role'::text) = 'service_role'::text
);

-- Policy for gift email status updates (send-gift-email function)
CREATE POLICY "Service role can update gift delivery status" 
ON public.gift_subscriptions 
FOR UPDATE 
USING (
  current_setting('role'::text) = 'service_role'::text AND
  -- Only allow updates to delivery-related fields
  OLD.gift_code = NEW.gift_code AND
  OLD.purchaser_email = NEW.purchaser_email AND
  OLD.recipient_email = NEW.recipient_email
)
WITH CHECK (
  current_setting('role'::text) = 'service_role'::text AND
  -- Only allow updates to delivery-related fields
  OLD.gift_code = NEW.gift_code AND
  OLD.purchaser_email = NEW.purchaser_email AND
  OLD.recipient_email = NEW.recipient_email
);

-- Policy for gift login tracking (track-gift-login function)  
CREATE POLICY "Service role can update gift login tracking" 
ON public.gift_subscriptions 
FOR UPDATE 
USING (
  current_setting('role'::text) = 'service_role'::text AND
  -- Only allow updates to login tracking fields
  OLD.gift_code = NEW.gift_code AND
  OLD.recipient_email = NEW.recipient_email AND
  redeemed = true
)
WITH CHECK (
  current_setting('role'::text) = 'service_role'::text AND
  -- Only allow updates to login tracking fields
  OLD.gift_code = NEW.gift_code AND
  OLD.recipient_email = NEW.recipient_email
);