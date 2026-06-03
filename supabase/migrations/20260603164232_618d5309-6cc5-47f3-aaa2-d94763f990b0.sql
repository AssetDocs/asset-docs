
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS payment_failed_at timestamptz,
  ADD COLUMN IF NOT EXISTS grace_period_ends_at timestamptz;

CREATE OR REPLACE FUNCTION public.expire_grace_periods()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  affected integer;
BEGIN
  UPDATE public.profiles
  SET account_status = 'expired_read_only',
      updated_at = now()
  WHERE account_status = 'active'
    AND grace_period_ends_at IS NOT NULL
    AND grace_period_ends_at < now();
  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected;
END;
$$;

REVOKE ALL ON FUNCTION public.expire_grace_periods() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.expire_grace_periods() TO service_role;
