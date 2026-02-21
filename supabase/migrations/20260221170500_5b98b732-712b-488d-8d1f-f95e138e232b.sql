
DO $$
DECLARE
  target_id uuid := '1e8b7935-298f-4a8b-846d-3a3857bd8d3d';
BEGIN
  DELETE FROM public.notification_preferences WHERE user_id = target_id;
  DELETE FROM public.entitlements WHERE user_id = target_id;
  DELETE FROM public.contacts WHERE user_id = target_id;
  DELETE FROM public.profiles WHERE user_id = target_id;
  DELETE FROM public.deleted_accounts WHERE email = 'photography4mls@gmail.com';
  DELETE FROM auth.users WHERE id = target_id;
END $$;
