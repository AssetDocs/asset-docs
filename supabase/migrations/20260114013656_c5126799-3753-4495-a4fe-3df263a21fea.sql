-- Create storage bucket for contact attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('contact-attachments', 'contact-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Create table for contact attachments (documents, images, voice notes)
CREATE TABLE IF NOT EXISTS public.vip_contact_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID NOT NULL REFERENCES public.vip_contacts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT,
  attachment_type TEXT NOT NULL DEFAULT 'document', -- 'document', 'image', 'voice_note'
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.vip_contact_attachments ENABLE ROW LEVEL SECURITY;

-- Create policies for contact attachments
CREATE POLICY "Users can view their own contact attachments" 
ON public.vip_contact_attachments 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own contact attachments" 
ON public.vip_contact_attachments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contact attachments" 
ON public.vip_contact_attachments 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contact attachments" 
ON public.vip_contact_attachments 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create storage policies for contact-attachments bucket
CREATE POLICY "Users can view their own contact attachments in storage"
ON storage.objects
FOR SELECT
USING (bucket_id = 'contact-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload contact attachments"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'contact-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own contact attachments in storage"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'contact-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own contact attachments in storage"
ON storage.objects
FOR DELETE
USING (bucket_id = 'contact-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_vip_contact_attachments_updated_at
BEFORE UPDATE ON public.vip_contact_attachments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_vip_contact_attachments_contact_id ON public.vip_contact_attachments(contact_id);
CREATE INDEX idx_vip_contact_attachments_user_id ON public.vip_contact_attachments(user_id);