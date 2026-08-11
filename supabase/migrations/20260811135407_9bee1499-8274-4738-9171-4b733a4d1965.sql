ALTER TABLE public.notes_traditions
  ADD COLUMN record_type text NOT NULL DEFAULT 'note';

ALTER TABLE public.notes_traditions
  ADD CONSTRAINT notes_traditions_record_type_check
  CHECK (record_type IN ('note', 'tradition'));

ALTER TABLE public.notes_traditions
  ADD CONSTRAINT notes_traditions_tradition_no_folder_check
  CHECK (record_type <> 'tradition' OR folder_id IS NULL);

CREATE INDEX idx_notes_traditions_record_type ON public.notes_traditions(record_type);