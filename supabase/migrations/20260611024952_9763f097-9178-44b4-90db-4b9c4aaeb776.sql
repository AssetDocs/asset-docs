
-- C6: Property deletion columns, guard trigger, and restrictive visibility policy.

ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS pending_delete boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS pending_delete_at timestamptz,
  ADD COLUMN IF NOT EXISTS lease_token uuid,
  ADD COLUMN IF NOT EXISTS lease_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS delete_attempts int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_delete_error text;

CREATE INDEX IF NOT EXISTS properties_pending_delete_idx
  ON public.properties (user_id, pending_delete_at)
  WHERE pending_delete = true;

-- Guard trigger: block direct DELETE unless the secure-delete-property
-- edge function has set the session GUC app.allow_property_delete='on'.
CREATE OR REPLACE FUNCTION public.guard_property_delete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_allow text;
BEGIN
  BEGIN
    v_allow := current_setting('app.allow_property_delete', true);
  EXCEPTION WHEN OTHERS THEN
    v_allow := NULL;
  END;
  IF v_allow IS DISTINCT FROM 'on' THEN
    RAISE EXCEPTION 'direct property deletion is not allowed; use secure-delete-property'
      USING ERRCODE = '42501';
  END IF;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS guard_property_delete_trg ON public.properties;
CREATE TRIGGER guard_property_delete_trg
  BEFORE DELETE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.guard_property_delete();

-- Restrictive visibility policy: hide pending-delete rows from normal
-- client SELECTs. Edge functions using service_role bypass RLS and can
-- still read them (e.g. /account/cleanup).
DROP POLICY IF EXISTS "Hide pending-delete properties" ON public.properties;
CREATE POLICY "Hide pending-delete properties"
  ON public.properties
  AS RESTRICTIVE
  FOR SELECT
  TO authenticated
  USING (pending_delete = false);
