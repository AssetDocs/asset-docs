
-- 1. Processing lease column on each in-scope table
ALTER TABLE public.property_files          ADD COLUMN IF NOT EXISTS delete_processing_at timestamptz;
ALTER TABLE public.user_documents          ADD COLUMN IF NOT EXISTS delete_processing_at timestamptz;
ALTER TABLE public.memory_safe_items       ADD COLUMN IF NOT EXISTS delete_processing_at timestamptz;
ALTER TABLE public.family_recipes          ADD COLUMN IF NOT EXISTS delete_processing_at timestamptz;
ALTER TABLE public.notes_traditions        ADD COLUMN IF NOT EXISTS delete_processing_at timestamptz;
ALTER TABLE public.vip_contact_attachments ADD COLUMN IF NOT EXISTS delete_processing_at timestamptz;
ALTER TABLE public.paint_codes             ADD COLUMN IF NOT EXISTS delete_processing_at timestamptz;

-- 2. Guard trigger: only service_role may mutate deletion-control columns.
CREATE OR REPLACE FUNCTION public.guard_deletion_control_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_service boolean;
BEGIN
  -- auth.role() returns 'service_role' when the request is signed with the
  -- service-role JWT (the secure-delete-file edge function). For any other
  -- caller (authenticated user, anon, etc.) we forbid changes to control cols.
  BEGIN
    is_service := (auth.role() = 'service_role');
  EXCEPTION WHEN OTHERS THEN
    is_service := false;
  END;

  IF is_service THEN
    RETURN NEW;
  END IF;

  IF NEW.pending_delete       IS DISTINCT FROM OLD.pending_delete
  OR NEW.pending_delete_at    IS DISTINCT FROM OLD.pending_delete_at
  OR NEW.delete_error         IS DISTINCT FROM OLD.delete_error
  OR NEW.delete_attempts      IS DISTINCT FROM OLD.delete_attempts
  OR NEW.delete_processing_at IS DISTINCT FROM OLD.delete_processing_at THEN
    RAISE EXCEPTION 'deletion control columns are managed by secure-delete-file only'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

-- 3. Attach the trigger to every in-scope table.
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'property_files','user_documents','memory_safe_items','family_recipes',
    'notes_traditions','vip_contact_attachments','paint_codes'
  ] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS guard_deletion_control_%I ON public.%I;', t, t);
    EXECUTE format(
      'CREATE TRIGGER guard_deletion_control_%I
         BEFORE UPDATE ON public.%I
         FOR EACH ROW EXECUTE FUNCTION public.guard_deletion_control_columns();',
      t, t
    );
  END LOOP;
END $$;
