-- Track the one-time first dashboard welcome experience.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS dashboard_welcome_seen_at timestamptz;

COMMENT ON COLUMN public.profiles.dashboard_welcome_seen_at
  IS 'When the user dismissed or acted on the first dashboard welcome experience.';

-- Existing users should not see a newly introduced first-time modal.
UPDATE public.profiles
SET dashboard_welcome_seen_at = COALESCE(updated_at, created_at, now())
WHERE dashboard_welcome_seen_at IS NULL;

NOTIFY pgrst, 'reload schema';
