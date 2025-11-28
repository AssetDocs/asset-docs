-- Create voice note attachments table
CREATE TABLE IF NOT EXISTS public.voice_note_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voice_note_id UUID NOT NULL REFERENCES public.legacy_locker_voice_notes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.voice_note_attachments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own voice note attachments"
  ON public.voice_note_attachments
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own voice note attachments"
  ON public.voice_note_attachments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own voice note attachments"
  ON public.voice_note_attachments
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own voice note attachments"
  ON public.voice_note_attachments
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_voice_note_attachments_updated_at
  BEFORE UPDATE ON public.voice_note_attachments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();