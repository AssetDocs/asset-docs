
-- =========================================================================
-- PHASE 1: Workspace scoping for photo_folders & document_folders
-- =========================================================================

-- 1. Add account_id column (nullable initially for backfill)
ALTER TABLE public.photo_folders    ADD COLUMN IF NOT EXISTS account_id uuid;
ALTER TABLE public.document_folders ADD COLUMN IF NOT EXISTS account_id uuid;

-- 2. Safe backfill — abort if any folder has zero or multiple matching accounts
DO $$
DECLARE
  v_unresolved_photo   int;
  v_unresolved_doc     int;
  v_ambiguous_ids      uuid[];
BEGIN
  -- photo_folders: count folders whose user_id does NOT map to exactly one owned account
  SELECT count(*), array_agg(f.id)
    INTO v_unresolved_photo, v_ambiguous_ids
  FROM public.photo_folders f
  WHERE f.account_id IS NULL
    AND (SELECT count(*) FROM public.accounts a WHERE a.owner_user_id = f.user_id) <> 1;

  IF v_unresolved_photo > 0 THEN
    RAISE EXCEPTION
      'Phase 1 abort: % photo_folders row(s) cannot be uniquely matched to an account. Folder IDs: %',
      v_unresolved_photo, v_ambiguous_ids;
  END IF;

  -- document_folders: same check
  SELECT count(*), array_agg(f.id)
    INTO v_unresolved_doc, v_ambiguous_ids
  FROM public.document_folders f
  WHERE f.account_id IS NULL
    AND (SELECT count(*) FROM public.accounts a WHERE a.owner_user_id = f.user_id) <> 1;

  IF v_unresolved_doc > 0 THEN
    RAISE EXCEPTION
      'Phase 1 abort: % document_folders row(s) cannot be uniquely matched to an account. Folder IDs: %',
      v_unresolved_doc, v_ambiguous_ids;
  END IF;

  -- Perform backfill (only unambiguous rows reach here)
  UPDATE public.photo_folders f
     SET account_id = (SELECT a.id FROM public.accounts a WHERE a.owner_user_id = f.user_id)
   WHERE f.account_id IS NULL;

  UPDATE public.document_folders f
     SET account_id = (SELECT a.id FROM public.accounts a WHERE a.owner_user_id = f.user_id)
   WHERE f.account_id IS NULL;
END $$;

-- 3. Lock the column in
ALTER TABLE public.photo_folders    ALTER COLUMN account_id SET NOT NULL;
ALTER TABLE public.document_folders ALTER COLUMN account_id SET NOT NULL;

ALTER TABLE public.photo_folders
  ADD CONSTRAINT photo_folders_account_id_fkey
  FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON DELETE CASCADE;

ALTER TABLE public.document_folders
  ADD CONSTRAINT document_folders_account_id_fkey
  FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS photo_folders_account_id_idx    ON public.photo_folders(account_id);
CREATE INDEX IF NOT EXISTS document_folders_account_id_idx ON public.document_folders(account_id);

-- 4. Ownership-integrity trigger: folder.user_id must equal the linked account's owner
CREATE OR REPLACE FUNCTION public.enforce_folder_account_owner_match()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner uuid;
BEGIN
  SELECT a.owner_user_id INTO v_owner
    FROM public.accounts a
   WHERE a.id = NEW.account_id;

  IF v_owner IS NULL THEN
    RAISE EXCEPTION 'Folder account_id % does not exist', NEW.account_id;
  END IF;

  IF NEW.user_id IS DISTINCT FROM v_owner THEN
    RAISE EXCEPTION 'Folder user_id (%) must match the linked account''s owner_user_id (%)',
      NEW.user_id, v_owner;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_photo_folders_owner_match    ON public.photo_folders;
DROP TRIGGER IF EXISTS trg_document_folders_owner_match ON public.document_folders;

CREATE TRIGGER trg_photo_folders_owner_match
  BEFORE INSERT OR UPDATE OF account_id, user_id ON public.photo_folders
  FOR EACH ROW EXECUTE FUNCTION public.enforce_folder_account_owner_match();

CREATE TRIGGER trg_document_folders_owner_match
  BEFORE INSERT OR UPDATE OF account_id, user_id ON public.document_folders
  FOR EACH ROW EXECUTE FUNCTION public.enforce_folder_account_owner_match();

-- 5. Replace owner-only RLS with workspace policies
-- photo_folders
DROP POLICY IF EXISTS "Users can view their own photo folders"   ON public.photo_folders;
DROP POLICY IF EXISTS "Users can create their own photo folders" ON public.photo_folders;
DROP POLICY IF EXISTS "Users can update their own photo folders" ON public.photo_folders;
DROP POLICY IF EXISTS "Users can delete their own photo folders" ON public.photo_folders;

CREATE POLICY "photo_folders: workspace members can view"
ON public.photo_folders FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.accounts a
    WHERE a.id = photo_folders.account_id
      AND public.has_account_access(auth.uid(), a.owner_user_id, 'read_only')
  )
);

CREATE POLICY "photo_folders: full_access can create"
ON public.photo_folders FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.accounts a
    WHERE a.id = photo_folders.account_id
      AND public.has_account_access(auth.uid(), a.owner_user_id, 'full_access')
  )
);

CREATE POLICY "photo_folders: owner can update"
ON public.photo_folders FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.accounts a
    WHERE a.id = photo_folders.account_id
      AND public.has_account_access(auth.uid(), a.owner_user_id, 'owner')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.accounts a
    WHERE a.id = photo_folders.account_id
      AND public.has_account_access(auth.uid(), a.owner_user_id, 'owner')
  )
);

CREATE POLICY "photo_folders: owner can delete"
ON public.photo_folders FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.accounts a
    WHERE a.id = photo_folders.account_id
      AND public.has_account_access(auth.uid(), a.owner_user_id, 'owner')
  )
);

-- document_folders
DROP POLICY IF EXISTS "Users can view their own document folders"   ON public.document_folders;
DROP POLICY IF EXISTS "Users can create their own document folders" ON public.document_folders;
DROP POLICY IF EXISTS "Users can update their own document folders" ON public.document_folders;
DROP POLICY IF EXISTS "Users can delete their own document folders" ON public.document_folders;

CREATE POLICY "document_folders: workspace members can view"
ON public.document_folders FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.accounts a
    WHERE a.id = document_folders.account_id
      AND public.has_account_access(auth.uid(), a.owner_user_id, 'read_only')
  )
);

CREATE POLICY "document_folders: full_access can create"
ON public.document_folders FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.accounts a
    WHERE a.id = document_folders.account_id
      AND public.has_account_access(auth.uid(), a.owner_user_id, 'full_access')
  )
);

CREATE POLICY "document_folders: owner can update"
ON public.document_folders FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.accounts a
    WHERE a.id = document_folders.account_id
      AND public.has_account_access(auth.uid(), a.owner_user_id, 'owner')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.accounts a
    WHERE a.id = document_folders.account_id
      AND public.has_account_access(auth.uid(), a.owner_user_id, 'owner')
  )
);

CREATE POLICY "document_folders: owner can delete"
ON public.document_folders FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.accounts a
    WHERE a.id = document_folders.account_id
      AND public.has_account_access(auth.uid(), a.owner_user_id, 'owner')
  )
);
