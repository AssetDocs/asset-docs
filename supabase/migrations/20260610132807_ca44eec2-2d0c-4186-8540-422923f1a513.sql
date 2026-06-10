
-- 1. pending_delete tracking columns on each in-scope table
ALTER TABLE public.property_files
  ADD COLUMN pending_delete       boolean NOT NULL DEFAULT false,
  ADD COLUMN pending_delete_at    timestamptz,
  ADD COLUMN delete_error         text,
  ADD COLUMN delete_attempts      integer NOT NULL DEFAULT 0;
CREATE INDEX property_files_pending_delete_idx ON public.property_files (pending_delete) WHERE pending_delete = true;

ALTER TABLE public.user_documents
  ADD COLUMN pending_delete       boolean NOT NULL DEFAULT false,
  ADD COLUMN pending_delete_at    timestamptz,
  ADD COLUMN delete_error         text,
  ADD COLUMN delete_attempts      integer NOT NULL DEFAULT 0;
CREATE INDEX user_documents_pending_delete_idx ON public.user_documents (pending_delete) WHERE pending_delete = true;

ALTER TABLE public.memory_safe_items
  ADD COLUMN pending_delete       boolean NOT NULL DEFAULT false,
  ADD COLUMN pending_delete_at    timestamptz,
  ADD COLUMN delete_error         text,
  ADD COLUMN delete_attempts      integer NOT NULL DEFAULT 0;
CREATE INDEX memory_safe_items_pending_delete_idx ON public.memory_safe_items (pending_delete) WHERE pending_delete = true;

ALTER TABLE public.family_recipes
  ADD COLUMN pending_delete       boolean NOT NULL DEFAULT false,
  ADD COLUMN pending_delete_at    timestamptz,
  ADD COLUMN delete_error         text,
  ADD COLUMN delete_attempts      integer NOT NULL DEFAULT 0;
CREATE INDEX family_recipes_pending_delete_idx ON public.family_recipes (pending_delete) WHERE pending_delete = true;

ALTER TABLE public.notes_traditions
  ADD COLUMN pending_delete       boolean NOT NULL DEFAULT false,
  ADD COLUMN pending_delete_at    timestamptz,
  ADD COLUMN delete_error         text,
  ADD COLUMN delete_attempts      integer NOT NULL DEFAULT 0;
CREATE INDEX notes_traditions_pending_delete_idx ON public.notes_traditions (pending_delete) WHERE pending_delete = true;

ALTER TABLE public.vip_contact_attachments
  ADD COLUMN pending_delete       boolean NOT NULL DEFAULT false,
  ADD COLUMN pending_delete_at    timestamptz,
  ADD COLUMN delete_error         text,
  ADD COLUMN delete_attempts      integer NOT NULL DEFAULT 0;
CREATE INDEX vip_contact_attachments_pending_delete_idx ON public.vip_contact_attachments (pending_delete) WHERE pending_delete = true;

ALTER TABLE public.paint_codes
  ADD COLUMN pending_delete       boolean NOT NULL DEFAULT false,
  ADD COLUMN pending_delete_at    timestamptz,
  ADD COLUMN delete_error         text,
  ADD COLUMN delete_attempts      integer NOT NULL DEFAULT 0;
CREATE INDEX paint_codes_pending_delete_idx ON public.paint_codes (pending_delete) WHERE pending_delete = true;

-- 2. NOT NULL guardrails (verified zero NULLs above)
ALTER TABLE public.property_files          ALTER COLUMN bucket_name SET NOT NULL;
ALTER TABLE public.property_files          ALTER COLUMN file_path   SET NOT NULL;
ALTER TABLE public.user_documents          ALTER COLUMN file_path   SET NOT NULL;
ALTER TABLE public.memory_safe_items       ALTER COLUMN file_path   SET NOT NULL;
ALTER TABLE public.vip_contact_attachments ALTER COLUMN file_path   SET NOT NULL;

-- 3. Restrictive policies to hide pending_delete rows from all non-service callers.
--    These AND with existing permissive policies, so we don't need to modify per-table policies.
CREATE POLICY "hide_pending_delete_property_files"
  ON public.property_files AS RESTRICTIVE FOR SELECT TO authenticated
  USING (pending_delete = false);

CREATE POLICY "hide_pending_delete_user_documents"
  ON public.user_documents AS RESTRICTIVE FOR SELECT TO authenticated
  USING (pending_delete = false);

CREATE POLICY "hide_pending_delete_memory_safe_items"
  ON public.memory_safe_items AS RESTRICTIVE FOR SELECT TO authenticated
  USING (pending_delete = false);

CREATE POLICY "hide_pending_delete_family_recipes"
  ON public.family_recipes AS RESTRICTIVE FOR SELECT TO authenticated
  USING (pending_delete = false);

CREATE POLICY "hide_pending_delete_notes_traditions"
  ON public.notes_traditions AS RESTRICTIVE FOR SELECT TO authenticated
  USING (pending_delete = false);

CREATE POLICY "hide_pending_delete_vip_contact_attachments"
  ON public.vip_contact_attachments AS RESTRICTIVE FOR SELECT TO authenticated
  USING (pending_delete = false);

CREATE POLICY "hide_pending_delete_paint_codes"
  ON public.paint_codes AS RESTRICTIVE FOR SELECT TO authenticated
  USING (pending_delete = false);
