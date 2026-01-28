-- Add is_archived column to damage_reports table
ALTER TABLE public.damage_reports 
ADD COLUMN IF NOT EXISTS is_archived boolean NOT NULL DEFAULT false;

-- Add index for faster queries on archived status
CREATE INDEX IF NOT EXISTS idx_damage_reports_archived ON public.damage_reports(user_id, is_archived);

-- Add a comment to clarify archiving behavior
COMMENT ON COLUMN public.damage_reports.is_archived IS 'Archived reports are hidden from the main view but not deleted. Users retain full access to archived reports.';