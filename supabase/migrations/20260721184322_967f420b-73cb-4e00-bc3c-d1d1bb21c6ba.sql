DO $$
DECLARE
  existing_command text;
  existing_secret text;
  existing_jobid bigint;
BEGIN
  SELECT jobid, command INTO existing_jobid, existing_command
  FROM cron.job
  WHERE jobname = 'check-gift-deliveries-every-15-min'
  LIMIT 1;

  existing_secret := (regexp_match(existing_command, 'sb_secret_[A-Za-z0-9_-]+'))[1];
  IF existing_secret IS NULL THEN
    RAISE EXCEPTION 'Existing check-gift-deliveries scheduler secret was not found';
  END IF;

  IF existing_jobid IS NOT NULL THEN
    PERFORM cron.unschedule(existing_jobid);
  END IF;

  PERFORM cron.schedule(
    'check-gift-deliveries-every-15-min',
    '*/15 * * * *',
    format(
      $job$
      select net.http_post(
        url := 'https://leotcbfpqiekgkgumecn.supabase.co/functions/v1/check-gift-deliveries',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'x-internal-secret', %L
        ),
        body := '{}'::jsonb
      );
      $job$,
      existing_secret
    )
  );

  PERFORM net.http_post(
    url := 'https://leotcbfpqiekgkgumecn.supabase.co/functions/v1/check-gift-deliveries',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-internal-secret', existing_secret
    ),
    body := '{}'::jsonb
  );
END
$$;