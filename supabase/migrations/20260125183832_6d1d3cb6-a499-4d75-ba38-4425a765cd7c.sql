-- Create account_verification table
CREATE TABLE public.account_verification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  verified_at TIMESTAMPTZ,
  
  -- Track individual criteria for transparency
  email_verified BOOLEAN NOT NULL DEFAULT false,
  account_age_met BOOLEAN NOT NULL DEFAULT false,
  upload_count_met BOOLEAN NOT NULL DEFAULT false,
  upload_count INTEGER NOT NULL DEFAULT 0,
  profile_complete BOOLEAN NOT NULL DEFAULT false,
  has_property BOOLEAN NOT NULL DEFAULT false,
  
  -- Audit fields
  last_checked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS policies
ALTER TABLE public.account_verification ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own verification status"
ON public.account_verification FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Service role manages verification"
ON public.account_verification FOR ALL
USING (true) WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX idx_account_verification_user_id ON public.account_verification(user_id);

-- Create function to compute verification status
CREATE OR REPLACE FUNCTION public.compute_user_verification(target_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email_verified BOOLEAN := false;
  v_account_age_met BOOLEAN := false;
  v_upload_count_met BOOLEAN := false;
  v_profile_complete BOOLEAN := false;
  v_has_property BOOLEAN := false;
  v_upload_count INT := 0;
  v_account_created TIMESTAMPTZ;
BEGIN
  -- 1. Check email verification (from auth.users)
  SELECT (email_confirmed_at IS NOT NULL) INTO v_email_verified
  FROM auth.users WHERE id = target_user_id;

  -- 2. Check account age (2 weeks = 14 days)
  SELECT created_at INTO v_account_created
  FROM public.profiles WHERE user_id = target_user_id;
  
  IF v_account_created IS NOT NULL THEN
    v_account_age_met := (v_account_created <= now() - INTERVAL '14 days');
  END IF;

  -- 3. Count uploads across all media tables
  SELECT 
    COALESCE((SELECT COUNT(*) FROM property_files WHERE user_id = target_user_id), 0) +
    COALESCE((SELECT COUNT(*) FROM items WHERE user_id = target_user_id AND photo_path IS NOT NULL), 0) +
    COALESCE((SELECT COUNT(*) FROM legacy_locker_voice_notes WHERE user_id = target_user_id), 0) +
    COALESCE((SELECT COUNT(*) FROM legacy_locker_files WHERE user_id = target_user_id), 0)
  INTO v_upload_count;
  
  v_upload_count_met := (v_upload_count >= 10);

  -- 4. Check profile completeness (first name, last name required)
  SELECT (first_name IS NOT NULL AND first_name <> '' 
          AND last_name IS NOT NULL AND last_name <> '')
  INTO v_profile_complete
  FROM public.profiles WHERE user_id = target_user_id;

  -- 5. Check for at least 1 property
  SELECT EXISTS(SELECT 1 FROM properties WHERE user_id = target_user_id)
  INTO v_has_property;

  -- Return all criteria
  RETURN jsonb_build_object(
    'email_verified', COALESCE(v_email_verified, false),
    'account_age_met', COALESCE(v_account_age_met, false),
    'upload_count_met', COALESCE(v_upload_count_met, false),
    'upload_count', COALESCE(v_upload_count, 0),
    'profile_complete', COALESCE(v_profile_complete, false),
    'has_property', COALESCE(v_has_property, false),
    'is_verified', (
      COALESCE(v_email_verified, false) AND 
      COALESCE(v_account_age_met, false) AND 
      COALESCE(v_upload_count_met, false) AND 
      COALESCE(v_profile_complete, false) AND 
      COALESCE(v_has_property, false)
    )
  );
END;
$$;

-- Create trigger to update updated_at
CREATE TRIGGER update_account_verification_updated_at
BEFORE UPDATE ON public.account_verification
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();