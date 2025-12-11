-- Add property_id and swatch columns to paint_codes table
ALTER TABLE public.paint_codes 
ADD COLUMN property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
ADD COLUMN swatch_image_path TEXT,
ADD COLUMN swatch_image_url TEXT;

-- Create index for property lookup
CREATE INDEX idx_paint_codes_property_id ON public.paint_codes(property_id);