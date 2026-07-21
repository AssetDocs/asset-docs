DO $$
DECLARE
  existing_command text;
  existing_secret text;
BEGIN
  SELECT command INTO existing_command FROM cron.job WHERE jobname='check-gift-deliveries-every-15-min' LIMIT 1;
  existing_secret := (regexp_match(existing_command, 'sb_secret_[A-Za-z0-9_-]+'))[1];
  IF existing_secret IS NULL THEN RAISE EXCEPTION 'Scheduler secret not found'; END IF;
  PERFORM net.http_post(
    url := 'https://leotcbfpqiekgkgumecn.supabase.co/functions/v1/check-gift-deliveries',
    headers := jsonb_build_object('Content-Type','application/json','apikey',existing_secret,'Authorization','Bearer ' || existing_secret),
    body := '{}'::jsonb
  );
END
$$;