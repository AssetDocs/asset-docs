-- Optional Family Archive Important Locations for physical item/document reference.
-- This stores owner-entered location metadata only; sensitive access details
-- should remain in Legacy Locker or Secure Vault.

CREATE TABLE IF NOT EXISTS public.family_important_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  item_name text NOT NULL,
  category text,
  property_id uuid REFERENCES public.properties(id) ON DELETE SET NULL,
  room_area text,
  location_description text,
  related_contact_name text,
  notes text,
  attachment_file_name text,
  pending_delete boolean NOT NULL DEFAULT false,
  pending_delete_at timestamptz,
  delete_processing_at timestamptz,
  delete_error text,
  delete_attempts integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.family_important_locations TO authenticated;

ALTER TABLE public.family_important_locations ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS family_important_locations_user_id_idx
  ON public.family_important_locations (user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS family_important_locations_category_idx
  ON public.family_important_locations (user_id, category, updated_at DESC);

CREATE INDEX IF NOT EXISTS family_important_locations_property_idx
  ON public.family_important_locations (user_id, property_id, updated_at DESC)
  WHERE property_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS family_important_locations_pending_delete_idx
  ON public.family_important_locations (pending_delete)
  WHERE pending_delete = true;

DROP POLICY IF EXISTS "Account members can view family important locations"
  ON public.family_important_locations;
CREATE POLICY "Account members can view family important locations"
  ON public.family_important_locations
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR public.has_account_access(auth.uid(), user_id, 'read_only')
  );

DROP POLICY IF EXISTS "Full access can create family important locations"
  ON public.family_important_locations;
CREATE POLICY "Full access can create family important locations"
  ON public.family_important_locations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    OR public.has_account_access(auth.uid(), user_id, 'full_access')
  );

DROP POLICY IF EXISTS "Full access can update family important locations"
  ON public.family_important_locations;
CREATE POLICY "Full access can update family important locations"
  ON public.family_important_locations
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR public.has_account_access(auth.uid(), user_id, 'full_access')
  )
  WITH CHECK (
    auth.uid() = user_id
    OR public.has_account_access(auth.uid(), user_id, 'full_access')
  );

DROP POLICY IF EXISTS "Full access can delete family important locations"
  ON public.family_important_locations;
CREATE POLICY "Full access can delete family important locations"
  ON public.family_important_locations
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR public.has_account_access(auth.uid(), user_id, 'full_access')
  );

DROP POLICY IF EXISTS "hide_pending_delete_family_important_locations"
  ON public.family_important_locations;
CREATE POLICY "hide_pending_delete_family_important_locations"
  ON public.family_important_locations
  AS RESTRICTIVE
  FOR SELECT
  TO authenticated
  USING (pending_delete = false);

DROP TRIGGER IF EXISTS update_family_important_locations_updated_at
  ON public.family_important_locations;
CREATE TRIGGER update_family_important_locations_updated_at
  BEFORE UPDATE ON public.family_important_locations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.delete_family_important_locations_for_tombstone()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.original_user_id IS NOT NULL THEN
    DELETE FROM public.family_important_locations
    WHERE user_id = NEW.original_user_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS delete_family_important_locations_on_tombstone
  ON public.deleted_accounts;
CREATE TRIGGER delete_family_important_locations_on_tombstone
  AFTER INSERT OR UPDATE OF original_user_id
  ON public.deleted_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.delete_family_important_locations_for_tombstone();
