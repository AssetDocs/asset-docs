
-- Fix user 5950acba's storage with correct UUID
UPDATE public.entitlements 
SET base_storage_gb = 100
WHERE user_id = '5950acba-3bbb-4b30-ad7f-b5a63b8d8c45' 
  AND plan = 'premium';
