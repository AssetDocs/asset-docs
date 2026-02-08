
-- Add description, tags, and item_values columns to property_files
ALTER TABLE public.property_files
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS item_values jsonb DEFAULT '[]';

-- item_values stores an array of {name, value} objects, e.g.:
-- [{"name": "Sofa", "value": 1200}, {"name": "Coffee Table", "value": 350}]
