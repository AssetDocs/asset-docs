-- Drop the restrictive foreign key constraint on property_files.folder_id
-- This constraint only references photo_folders but we use video_folders and document_folders too
ALTER TABLE public.property_files 
DROP CONSTRAINT IF EXISTS property_files_folder_id_fkey;

-- Add a comment to explain the folder_id usage
COMMENT ON COLUMN public.property_files.folder_id IS 'References folder ID from photo_folders, video_folders, or document_folders depending on file_type. No FK constraint due to multiple source tables.';