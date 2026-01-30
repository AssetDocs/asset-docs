-- Add source column to property_files to track where files came from
ALTER TABLE public.property_files 
ADD COLUMN IF NOT EXISTS source text DEFAULT 'general';

-- Add comment for documentation
COMMENT ON COLUMN public.property_files.source IS 'Source of the file: general, damage_report, upgrade_repair, etc.';

-- Add damage_report_id to link files directly to damage reports
ALTER TABLE public.property_files 
ADD COLUMN IF NOT EXISTS damage_report_id uuid REFERENCES public.damage_reports(id) ON DELETE SET NULL;