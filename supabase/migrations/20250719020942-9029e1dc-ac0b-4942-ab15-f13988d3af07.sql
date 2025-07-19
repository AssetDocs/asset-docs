-- Create storage buckets for different file types
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('photos', 'photos', true),
  ('videos', 'videos', true),
  ('documents', 'documents', false),
  ('floor-plans', 'floor-plans', true);

-- Create RLS policies for photos bucket
CREATE POLICY "Users can view photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'photos');

CREATE POLICY "Users can upload their own photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own photos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own photos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create RLS policies for videos bucket
CREATE POLICY "Users can view videos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'videos');

CREATE POLICY "Users can upload their own videos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own videos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own videos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create RLS policies for documents bucket (private)
CREATE POLICY "Users can view their own documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own documents" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own documents" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create RLS policies for floor-plans bucket
CREATE POLICY "Users can view floor plans" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'floor-plans');

CREATE POLICY "Users can upload their own floor plans" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'floor-plans' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own floor plans" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'floor-plans' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own floor plans" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'floor-plans' AND auth.uid()::text = (storage.foldername(name))[1]);