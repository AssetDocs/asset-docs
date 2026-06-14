-- M5 launch fix: ensure billing grace periods actually transition to read-only.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'expire-subscription-grace-periods-hourly') THEN
    PERFORM cron.unschedule('expire-subscription-grace-periods-hourly');
  END IF;
END $$;

SELECT cron.schedule(
  'expire-subscription-grace-periods-hourly',
  '17 * * * *',
  $$SELECT public.expire_grace_periods();$$
);
