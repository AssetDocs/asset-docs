CREATE TABLE IF NOT EXISTS public.account_export_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  account_id UUID,
  export_type TEXT NOT NULL DEFAULT 'complete_asset_summary'
    CHECK (export_type IN ('complete_asset_summary', 'asset_summary_pdf', 'asset_zip')),
  status TEXT NOT NULL DEFAULT 'started'
    CHECK (status IN ('started', 'succeeded', 'failed')),
  file_count INTEGER CHECK (file_count IS NULL OR file_count >= 0),
  signed_url_ttl_seconds INTEGER CHECK (signed_url_ttl_seconds IS NULL OR signed_url_ttl_seconds > 0),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.account_export_audit ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own account export audit"
  ON public.account_export_audit;
CREATE POLICY "Users can view own account export audit"
  ON public.account_export_audit
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Dev workspace can view account export audit"
  ON public.account_export_audit;
CREATE POLICY "Dev workspace can view account export audit"
  ON public.account_export_audit
  FOR SELECT
  TO authenticated
  USING (public.has_dev_workspace_access(auth.uid()));

DROP TRIGGER IF EXISTS update_account_export_audit_updated_at
  ON public.account_export_audit;
CREATE TRIGGER update_account_export_audit_updated_at
  BEFORE UPDATE ON public.account_export_audit
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_account_export_audit_user_started
  ON public.account_export_audit(user_id, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_account_export_audit_status_started
  ON public.account_export_audit(status, started_at DESC);

CREATE OR REPLACE FUNCTION public.log_account_export_audit(
  p_export_type TEXT DEFAULT 'complete_asset_summary',
  p_status TEXT DEFAULT 'started',
  p_file_count INTEGER DEFAULT NULL,
  p_signed_url_ttl_seconds INTEGER DEFAULT NULL,
  p_error_message TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_account_id UUID;
  v_audit_id UUID;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'not_authenticated' USING ERRCODE = '28000';
  END IF;

  IF p_status NOT IN ('started', 'succeeded', 'failed') THEN
    RAISE EXCEPTION 'invalid_export_status' USING ERRCODE = '22023';
  END IF;

  SELECT id
  INTO v_account_id
  FROM public.accounts
  WHERE owner_user_id = v_user_id
  ORDER BY created_at ASC
  LIMIT 1;

  INSERT INTO public.account_export_audit (
    user_id,
    account_id,
    export_type,
    status,
    file_count,
    signed_url_ttl_seconds,
    completed_at,
    error_message,
    metadata
  )
  VALUES (
    v_user_id,
    v_account_id,
    COALESCE(p_export_type, 'complete_asset_summary'),
    p_status,
    p_file_count,
    p_signed_url_ttl_seconds,
    CASE WHEN p_status IN ('succeeded', 'failed') THEN now() ELSE NULL END,
    CASE WHEN p_status = 'failed' THEN left(COALESCE(p_error_message, 'export_failed'), 1000) ELSE NULL END,
    COALESCE(p_metadata, '{}'::JSONB)
  )
  RETURNING id INTO v_audit_id;

  RETURN v_audit_id;
END;
$$;

REVOKE ALL ON FUNCTION public.log_account_export_audit(TEXT, TEXT, INTEGER, INTEGER, TEXT, JSONB)
  FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.log_account_export_audit(TEXT, TEXT, INTEGER, INTEGER, TEXT, JSONB)
  TO authenticated;
