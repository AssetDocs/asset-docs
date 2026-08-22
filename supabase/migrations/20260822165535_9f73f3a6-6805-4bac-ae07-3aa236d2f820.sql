ALTER TABLE public.legacy_locker
  DROP COLUMN IF EXISTS continuity_preferences,
  DROP COLUMN IF EXISTS continuity_preferences_version,
  DROP COLUMN IF EXISTS continuity_preferences_reviewed_at,
  DROP COLUMN IF EXISTS continuity_annual_reminder;

DROP FUNCTION IF EXISTS public.compute_continuity_readiness(uuid);