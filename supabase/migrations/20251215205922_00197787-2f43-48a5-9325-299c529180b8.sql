-- Fix subscription status for user with stripe_customer_id cus_TFAcvqHRR2U13A
-- The webhook race condition caused 'incomplete' to overwrite 'active'

UPDATE public.profiles 
SET plan_status = 'active', updated_at = NOW()
WHERE stripe_customer_id = 'cus_TFAcvqHRR2U13A';

UPDATE public.subscribers 
SET subscribed = true, subscription_tier = 'standard', updated_at = NOW()
WHERE stripe_customer_id = 'cus_TFAcvqHRR2U13A';