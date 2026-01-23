
-- Update profile with lifetime premium access for info@assetdocs.net
UPDATE public.profiles
SET 
  plan_id = 'premium_lifetime',
  plan_status = 'active',
  property_limit = 10,
  storage_quota_gb = 50,
  current_period_end = '2099-12-31T23:59:59Z',
  updated_at = NOW()
WHERE user_id = '7f2ee41e-f3be-4921-88d0-b25c6c3f0b8e';

-- Insert subscribers record
INSERT INTO public.subscribers (user_id, email, subscribed, subscription_tier, subscription_end, updated_at)
VALUES (
  '7f2ee41e-f3be-4921-88d0-b25c6c3f0b8e',
  'info@assetdocs.net',
  true,
  'premium',
  '2099-12-31T23:59:59Z',
  NOW()
);
