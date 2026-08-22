DROP FUNCTION IF EXISTS public.execute_temporary_stewardship(uuid, uuid, jsonb, timestamptz, text);
DROP FUNCTION IF EXISTS public.execute_temporary_stewardship(uuid, uuid, jsonb, timestamp with time zone, text, text);
DROP FUNCTION IF EXISTS public.execute_archive_custodian(uuid, uuid, jsonb, text);
DROP FUNCTION IF EXISTS public.execute_archive_custodian(uuid, uuid, jsonb, text, text);

DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname IN ('execute_temporary_stewardship', 'execute_archive_custodian')
  LOOP
    EXECUTE format('DROP FUNCTION IF EXISTS %s', r.sig);
  END LOOP;
END $$;