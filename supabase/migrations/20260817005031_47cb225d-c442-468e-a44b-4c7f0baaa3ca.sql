-- 1. Deterministic migration marker (schema-level idempotency guard)
ALTER TABLE public.notes_traditions
  ADD COLUMN IF NOT EXISTS migrated_from_user_note_id uuid;

CREATE UNIQUE INDEX IF NOT EXISTS notes_traditions_migrated_from_user_note_id_key
  ON public.notes_traditions (migrated_from_user_note_id)
  WHERE migrated_from_user_note_id IS NOT NULL;

-- 2. Guarded, idempotent data move: Quick Notes -> Notes.
-- Re-running is a no-op because of the unique marker index + NOT EXISTS guard.
INSERT INTO public.notes_traditions (
  user_id,
  title,
  content,
  file_name,
  file_path,
  bucket_name,
  record_type,
  folder_id,
  created_at,
  updated_at,
  migrated_from_user_note_id
)
SELECT
  un.user_id,
  COALESCE(NULLIF(btrim(un.title), ''), 'Quick Note'),
  un.content,
  un.file_name,
  un.file_path,
  un.bucket_name,
  'note',
  NULL,
  un.created_at,
  un.updated_at,
  un.id
FROM public.user_notes un
WHERE NOT EXISTS (
  SELECT 1 FROM public.notes_traditions nt
  WHERE nt.migrated_from_user_note_id = un.id
);