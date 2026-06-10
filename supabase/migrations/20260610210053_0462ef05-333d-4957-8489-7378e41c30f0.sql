
-- Phase 4: low-risk constraints
-- 1. Tighten user_documents.file_path (0 nulls confirmed)
ALTER TABLE public.user_documents
  ALTER COLUMN file_path SET NOT NULL;

-- 2. file_size >= 0 CHECK on the 6 tables with file_size, added NOT VALID then validated.
ALTER TABLE public.property_files
  ADD CONSTRAINT property_files_file_size_nonneg_chk
  CHECK (file_size IS NULL OR file_size >= 0) NOT VALID;
ALTER TABLE public.property_files VALIDATE CONSTRAINT property_files_file_size_nonneg_chk;

ALTER TABLE public.user_documents
  ADD CONSTRAINT user_documents_file_size_nonneg_chk
  CHECK (file_size IS NULL OR file_size >= 0) NOT VALID;
ALTER TABLE public.user_documents VALIDATE CONSTRAINT user_documents_file_size_nonneg_chk;

ALTER TABLE public.memory_safe_items
  ADD CONSTRAINT memory_safe_items_file_size_nonneg_chk
  CHECK (file_size IS NULL OR file_size >= 0) NOT VALID;
ALTER TABLE public.memory_safe_items VALIDATE CONSTRAINT memory_safe_items_file_size_nonneg_chk;

ALTER TABLE public.family_recipes
  ADD CONSTRAINT family_recipes_file_size_nonneg_chk
  CHECK (file_size IS NULL OR file_size >= 0) NOT VALID;
ALTER TABLE public.family_recipes VALIDATE CONSTRAINT family_recipes_file_size_nonneg_chk;

ALTER TABLE public.notes_traditions
  ADD CONSTRAINT notes_traditions_file_size_nonneg_chk
  CHECK (file_size IS NULL OR file_size >= 0) NOT VALID;
ALTER TABLE public.notes_traditions VALIDATE CONSTRAINT notes_traditions_file_size_nonneg_chk;

ALTER TABLE public.vip_contact_attachments
  ADD CONSTRAINT vip_contact_attachments_file_size_nonneg_chk
  CHECK (file_size IS NULL OR file_size >= 0) NOT VALID;
ALTER TABLE public.vip_contact_attachments VALIDATE CONSTRAINT vip_contact_attachments_file_size_nonneg_chk;
