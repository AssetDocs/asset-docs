-- Fix admin user entitlement: switch from stripe-sourced (inactive) to admin-sourced (active premium)
UPDATE public.entitlements
SET
  entitlement_source = 'admin',
  status = 'active',
  plan = 'premium',
  stripe_subscription_id = NULL,
  stripe_customer_id = NULL,
  stripe_plan_price_id = NULL,
  plan_lookup_key = NULL,
  base_storage_gb = 100,
  updated_at = now()
WHERE user_id = 'e71b4d2e-60d7-45f4-91e6-1480e65fb0f9';

UPDATE public.profiles
SET plan_status = 'active'
WHERE user_id = 'e71b4d2e-60d7-45f4-91e6-1480e65fb0f9';