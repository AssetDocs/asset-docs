-- RPC-backed property_file delete lease helpers.
-- secure-delete-file uses these for property_files so the Edge Function does
-- not depend on PostgREST's cached table column list for recoverable-delete
-- columns during the claim/release/finalize phases.

CREATE OR REPLACE FUNCTION public.claim_property_file_delete(
  p_file_id uuid,
  p_stale_before timestamptz,
  p_now timestamptz DEFAULT now()
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count int;
BEGIN
  UPDATE public.property_files
     SET pending_delete = true,
         pending_delete_at = COALESCE(pending_delete_at, p_now),
         delete_processing_at = p_now,
         delete_attempts = COALESCE(delete_attempts, 0) + 1,
         delete_error = NULL
   WHERE id = p_file_id
     AND (
       pending_delete = false
       OR delete_processing_at IS NULL
       OR delete_processing_at < p_stale_before
     );

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count > 0;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_property_file_delete(uuid, timestamptz, timestamptz) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_property_file_delete(uuid, timestamptz, timestamptz) TO service_role;

CREATE OR REPLACE FUNCTION public.release_property_file_delete(
  p_file_id uuid,
  p_error text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count int;
BEGIN
  UPDATE public.property_files
     SET delete_processing_at = NULL,
         delete_error = CASE
           WHEN p_error IS NULL THEN NULL
           ELSE left(p_error, 500)
         END
   WHERE id = p_file_id;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count > 0;
END;
$$;

REVOKE ALL ON FUNCTION public.release_property_file_delete(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.release_property_file_delete(uuid, text) TO service_role;

CREATE OR REPLACE FUNCTION public.finalize_property_file_delete(
  p_file_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count int;
BEGIN
  DELETE FROM public.property_files
   WHERE id = p_file_id
     AND pending_delete = true;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count > 0;
END;
$$;

REVOKE ALL ON FUNCTION public.finalize_property_file_delete(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.finalize_property_file_delete(uuid) TO service_role;
