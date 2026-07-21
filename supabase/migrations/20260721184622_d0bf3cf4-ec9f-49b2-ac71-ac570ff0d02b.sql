DO $$
DECLARE
  existing_command text;
  existing_secret text;
  existing_jobid bigint;
  fixed_command text;
BEGIN
  SELECT jobid, command INTO existing_jobid, existing_command
  FROM cron.job
  WHERE jobname = 'check-gift-deliveries-every-15-min'
  LIMIT 1;

  existing_secret := (regexp_match(existing_command, 'sb_secret_[A-Za-z0-9_-]+'))[1];
  IF existing_secret IS NULL THEN
    RAISE EXCEPTION 'Existing check-gift-deliveries scheduler secret was not found';
  END IF;

  fixed_command := format(
    $job$
    select net.http_post(
      url := 'https://leotcbfpqiekgkgumecn.supabase.co/functions/v1/check-gift-deliveries',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'apikey', %L,
        'Authorization', 'Bearer ' || %L
      ),
      body := '{}'::jsonb
    );
    $job$,
    existing_secret,
    existing_secret
  );

  IF existing_jobid IS NOT NULL THEN
    PERFORM cron.unschedule(existing_jobid);
  END IF;
  PERFORM cron.schedule('check-gift-deliveries-every-15-min', '*/15 * * * *', fixed_command);

  PERFORM net.http_post(
    url := 'https://leotcbfpqiekgkgumecn.supabase.co/functions/v1/check-gift-deliveries',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'apikey', existing_secret,
      'Authorization', 'Bearer ' || existing_secret
    ),
    body := '{}'::jsonb
  );
END
$$;