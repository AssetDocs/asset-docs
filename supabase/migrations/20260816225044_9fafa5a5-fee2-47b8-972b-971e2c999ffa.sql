ALTER TABLE public.content_audit_events
  ADD COLUMN IF NOT EXISTS anonymized_at timestamptz;

CREATE OR REPLACE FUNCTION public.anonymize_content_audit_events(_owner_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_count integer := 0;
BEGIN
  IF _owner_user_id IS NULL THEN
    RETURN 0;
  END IF;

  -- Strip human-readable content, keep the forensic skeleton.
  UPDATE public.content_audit_events
  SET record_label = NULL,
      metadata = '{}'::jsonb,
      anonymized_at = now()
  WHERE owner_user_id = _owner_user_id
    AND anonymized_at IS NULL;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

REVOKE ALL ON FUNCTION public.anonymize_content_audit_events(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.anonymize_content_audit_events(uuid) TO service_role;