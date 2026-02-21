
ALTER TABLE public.user_notes
  ADD COLUMN title TEXT,
  ADD COLUMN file_name TEXT,
  ADD COLUMN file_path TEXT,
  ADD COLUMN bucket_name TEXT;
