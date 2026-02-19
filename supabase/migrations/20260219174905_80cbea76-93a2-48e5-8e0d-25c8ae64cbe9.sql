
-- Create table for photographer interest form submissions
CREATE TABLE public.photographer_interest (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  business_name text,
  email text NOT NULL,
  phone text NOT NULL,
  city_state text NOT NULL,
  primary_service_area text NOT NULL,
  website_url text,
  years_experience text NOT NULL,
  currently_active boolean NOT NULL DEFAULT true,
  additional_notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.photographer_interest ENABLE ROW LEVEL SECURITY;

-- Only admins/owners can read submissions
CREATE POLICY "Admin users can read photographer interest"
  ON public.photographer_interest FOR SELECT
  USING (public.has_any_app_role(auth.uid(), ARRAY['owner','admin']::app_role[]));

-- Anyone authenticated can submit (the form is private but accessible)
CREATE POLICY "Authenticated users can submit photographer interest"
  ON public.photographer_interest FOR INSERT
  WITH CHECK (true);
