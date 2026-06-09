
-- Item 1: RLS tighten on recovery_requests
-- Drop redundant SELECT policies, add is_service_role(), replace owner UPDATE,
-- add BEFORE UPDATE trigger guard enforcing canonical status transitions.

-- 1. Service role helper
CREATE OR REPLACE FUNCTION public.is_service_role()
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claim.role', true) = 'service_role'
    OR auth.role() = 'service_role',
    false
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_service_role() TO authenticated, service_role, anon;

-- 2. Drop redundant SELECT policies (keep the consolidated one)
DROP POLICY IF EXISTS "Delegates can view their own recovery requests" ON public.recovery_requests;
DROP POLICY IF EXISTS "Owners can view recovery requests for their account" ON public.recovery_requests;

-- 3. Replace owner UPDATE policy: owner may only act on pending rows, and only
-- to set status to approved/rejected. All other transitions are service-role.
DROP POLICY IF EXISTS "Owners can respond to recovery requests" ON public.recovery_requests;

CREATE POLICY "Owners can respond to pending recovery requests"
ON public.recovery_requests
FOR UPDATE
TO authenticated
USING (auth.uid() = owner_user_id AND status = 'pending')
WITH CHECK (auth.uid() = owner_user_id AND status IN ('approved', 'rejected'));

CREATE POLICY "Service role can manage recovery requests"
ON public.recovery_requests
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 4. Trigger guard: enforce immutable identity columns + canonical status
-- transitions even within an UPDATE the policy permits.
CREATE OR REPLACE FUNCTION public.recovery_requests_update_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_service boolean := public.is_service_role();
BEGIN
  -- Immutable identity columns
  IF NEW.legacy_locker_id IS DISTINCT FROM OLD.legacy_locker_id
     OR NEW.owner_user_id   IS DISTINCT FROM OLD.owner_user_id
     OR NEW.delegate_user_id IS DISTINCT FROM OLD.delegate_user_id
     OR NEW.requested_at    IS DISTINCT FROM OLD.requested_at
     OR NEW.grace_period_ends_at IS DISTINCT FROM OLD.grace_period_ends_at THEN
    RAISE EXCEPTION 'recovery_requests: identity/timeline columns are immutable'
      USING ERRCODE = '42501';
  END IF;

  -- Status transition rules
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF v_is_service THEN
      -- Service role: allow canonical transitions only
      IF NOT (
        (OLD.status = 'pending'  AND NEW.status IN ('approved','rejected','grace_period_expired','revoked')) OR
        (OLD.status = 'approved' AND NEW.status IN ('acknowledged','revoked','grace_period_expired')) OR
        (OLD.status = 'grace_period_expired' AND NEW.status IN ('acknowledged','revoked')) OR
        (OLD.status = 'acknowledged' AND NEW.status = 'revoked')
      ) THEN
        RAISE EXCEPTION 'recovery_requests: illegal status transition % -> %', OLD.status, NEW.status
          USING ERRCODE = '42501';
      END IF;
    ELSE
      -- Authenticated owner (RLS already verified ownership + OLD.status='pending')
      IF NOT (OLD.status = 'pending' AND NEW.status IN ('approved','rejected')) THEN
        RAISE EXCEPTION 'recovery_requests: only service role may set status %', NEW.status
          USING ERRCODE = '42501';
      END IF;
    END IF;
  END IF;

  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS recovery_requests_update_guard ON public.recovery_requests;
CREATE TRIGGER recovery_requests_update_guard
BEFORE UPDATE ON public.recovery_requests
FOR EACH ROW
EXECUTE FUNCTION public.recovery_requests_update_guard();

-- 5. Ensure no DELETE for authenticated; grant baseline privileges
REVOKE DELETE ON public.recovery_requests FROM authenticated;
GRANT SELECT, INSERT, UPDATE ON public.recovery_requests TO authenticated;
GRANT ALL ON public.recovery_requests TO service_role;
