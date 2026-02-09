
-- Add is_high_value flag to property_files
ALTER TABLE public.property_files ADD COLUMN is_high_value boolean NOT NULL DEFAULT false;

-- Index for quick lookups
CREATE INDEX idx_property_files_high_value ON public.property_files (user_id, is_high_value) WHERE is_high_value = true;
