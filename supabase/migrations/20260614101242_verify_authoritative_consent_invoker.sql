-- M2 follow-up: force the exact Supabase-recommended option form and verify it.
ALTER VIEW public.v_authoritative_consent SET (security_invoker = on);

-- Keep API exposure intentional: authenticated app users and service role only.
REVOKE ALL ON public.v_authoritative_consent FROM anon;
GRANT SELECT ON public.v_authoritative_consent TO authenticated, service_role;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    JOIN LATERAL pg_options_to_table(c.reloptions) opt ON true
    WHERE n.nspname = 'public'
      AND c.relname = 'v_authoritative_consent'
      AND c.relkind = 'v'
      AND opt.option_name = 'security_invoker'
      AND opt.option_value IN ('true', 'on')
  ) THEN
    RAISE EXCEPTION 'public.v_authoritative_consent did not retain security_invoker=true';
  END IF;
END $$;
