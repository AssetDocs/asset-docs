-- Create paint_codes table for storing user paint information
CREATE TABLE public.paint_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  paint_brand TEXT NOT NULL,
  paint_name TEXT NOT NULL,
  paint_code TEXT NOT NULL,
  is_interior BOOLEAN NOT NULL DEFAULT true,
  room_location TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.paint_codes ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own paint codes" 
ON public.paint_codes 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own paint codes" 
ON public.paint_codes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own paint codes" 
ON public.paint_codes 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own paint codes" 
ON public.paint_codes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_paint_codes_updated_at
BEFORE UPDATE ON public.paint_codes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();