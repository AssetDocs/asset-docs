CREATE TABLE public.notes_tradition_folders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  folder_name text NOT NULL,
  description text,
  gradient_color text NOT NULL DEFAULT 'bg-blue-500',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.notes_tradition_folders TO authenticated;
GRANT ALL ON public.notes_tradition_folders TO service_role;

ALTER TABLE public.notes_tradition_folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own notes tradition folders"
ON public.notes_tradition_folders FOR ALL TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_notes_tradition_folders_updated_at
BEFORE UPDATE ON public.notes_tradition_folders
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.notes_traditions
  ADD COLUMN folder_id uuid REFERENCES public.notes_tradition_folders(id) ON DELETE SET NULL;

CREATE INDEX idx_notes_traditions_folder_id ON public.notes_traditions(folder_id);
CREATE INDEX idx_notes_tradition_folders_user_id ON public.notes_tradition_folders(user_id);