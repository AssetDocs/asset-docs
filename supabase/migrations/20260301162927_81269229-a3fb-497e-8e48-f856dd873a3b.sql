ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS password_set boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS onboarding_complete boolean NOT NULL DEFAULT false;

UPDATE public.profiles SET password_set = true, onboarding_complete = true
WHERE user_id IN (
  SELECT id FROM auth.users WHERE created_at < now() - interval '1 hour'
);