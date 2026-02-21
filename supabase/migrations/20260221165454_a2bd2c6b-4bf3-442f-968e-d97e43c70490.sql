DO $$
DECLARE
  target_id uuid := 'b81398f2-ad02-4701-8b13-9c4936f30eb9';
BEGIN
  DELETE FROM public.notification_preferences WHERE user_id = target_id;
  DELETE FROM public.entitlements WHERE user_id = target_id;
  DELETE FROM public.contacts WHERE user_id = target_id;
  DELETE FROM public.profiles WHERE user_id = target_id;
  DELETE FROM auth.users WHERE id = target_id;
END $$;