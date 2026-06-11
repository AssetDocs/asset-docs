
-- Atomic claim: works for initial deletion AND retry. Returns the lease token
-- on success, or NULL when the row cannot be claimed (already leased by
-- someone else with a live lease).
CREATE OR REPLACE FUNCTION public.claim_property_deletion(
  p_property_id uuid,
  p_caller uuid,
  p_lease_ttl_seconds int DEFAULT 300
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_token uuid := gen_random_uuid();
  v_now timestamptz := now();
  v_returned uuid;
BEGIN
  IF p_caller IS NULL OR p_caller <> auth.uid() THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;

  UPDATE public.properties
  SET
    pending_delete = true,
    pending_delete_at = COALESCE(pending_delete_at, v_now),
    lease_token = v_new_token,
    lease_expires_at = v_now + make_interval(secs => p_lease_ttl_seconds),
    delete_attempts = COALESCE(delete_attempts, 0) + 1,
    last_delete_error = NULL,
    updated_at = v_now
  WHERE id = p_property_id
    AND user_id = p_caller
    AND (
      pending_delete = false
      OR lease_expires_at IS NULL
      OR lease_expires_at < v_now
    )
  RETURNING lease_token INTO v_returned;

  RETURN v_returned; -- NULL when another live lease holds the row
END;
$$;

REVOKE ALL ON FUNCTION public.claim_property_deletion(uuid, uuid, int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_property_deletion(uuid, uuid, int) TO service_role;

-- Lease renewal during long-running batches.
CREATE OR REPLACE FUNCTION public.renew_property_deletion_lease(
  p_property_id uuid,
  p_lease_token uuid,
  p_lease_ttl_seconds int DEFAULT 300
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count int;
BEGIN
  UPDATE public.properties
  SET lease_expires_at = now() + make_interval(secs => p_lease_ttl_seconds),
      updated_at = now()
  WHERE id = p_property_id
    AND lease_token = p_lease_token
    AND pending_delete = true;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count > 0;
END;
$$;

REVOKE ALL ON FUNCTION public.renew_property_deletion_lease(uuid, uuid, int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.renew_property_deletion_lease(uuid, uuid, int) TO service_role;

-- Finalize: verify lease, enable guard GUC, delete the row.
CREATE OR REPLACE FUNCTION public.finalize_property_deletion(
  p_property_id uuid,
  p_lease_token uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.properties%ROWTYPE;
BEGIN
  SELECT * INTO v_row
  FROM public.properties
  WHERE id = p_property_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN false;
  END IF;
  IF v_row.pending_delete IS NOT TRUE THEN
    RAISE EXCEPTION 'not_pending_delete' USING ERRCODE = '22023';
  END IF;
  IF v_row.lease_token IS DISTINCT FROM p_lease_token THEN
    RAISE EXCEPTION 'lease_mismatch' USING ERRCODE = '22023';
  END IF;
  IF v_row.lease_expires_at IS NULL OR v_row.lease_expires_at < now() THEN
    RAISE EXCEPTION 'lease_expired' USING ERRCODE = '22023';
  END IF;

  PERFORM set_config('app.allow_property_delete', 'on', true);
  DELETE FROM public.properties WHERE id = p_property_id AND lease_token = p_lease_token;
  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.finalize_property_deletion(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.finalize_property_deletion(uuid, uuid) TO service_role;

-- Release the lease (mark error, keep pending_delete so cleanup queue can retry).
CREATE OR REPLACE FUNCTION public.release_property_deletion_lease(
  p_property_id uuid,
  p_lease_token uuid,
  p_error text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_count int;
BEGIN
  UPDATE public.properties
  SET lease_token = NULL,
      lease_expires_at = NULL,
      last_delete_error = LEFT(COALESCE(p_error, ''), 500),
      updated_at = now()
  WHERE id = p_property_id
    AND lease_token = p_lease_token;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count > 0;
END;
$$;

REVOKE ALL ON FUNCTION public.release_property_deletion_lease(uuid, uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.release_property_deletion_lease(uuid, uuid, text) TO service_role;
