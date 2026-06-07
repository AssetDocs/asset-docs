
-- 1) legal_terms_versions
CREATE TABLE IF NOT EXISTS public.legal_terms_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  current_version text NOT NULL,
  effective_at timestamptz NOT NULL DEFAULT now(),
  notes text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.legal_terms_versions TO anon, authenticated;
GRANT ALL ON public.legal_terms_versions TO service_role;
ALTER TABLE public.legal_terms_versions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read active terms version" ON public.legal_terms_versions;
CREATE POLICY "Anyone can read active terms version"
  ON public.legal_terms_versions FOR SELECT
  USING (is_active = true);
DROP POLICY IF EXISTS "Admins can manage terms versions" ON public.legal_terms_versions;
CREATE POLICY "Admins can manage terms versions"
  ON public.legal_terms_versions FOR ALL
  USING (public.has_app_role(auth.uid(),'admin'::public.app_role))
  WITH CHECK (public.has_app_role(auth.uid(),'admin'::public.app_role));

INSERT INTO public.legal_terms_versions (current_version, notes, is_active)
SELECT '2026-01-01', 'Initial canonical terms version', true
WHERE NOT EXISTS (SELECT 1 FROM public.legal_terms_versions WHERE is_active = true);

-- 2) checkout_fulfillments
CREATE TABLE IF NOT EXISTS public.checkout_fulfillments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_session_id text NOT NULL UNIQUE,
  stripe_subscription_id text,
  stripe_customer_id text,
  user_id uuid,
  email text,
  plan_lookup_key text,
  fulfillment_source text,
  status text NOT NULL DEFAULT 'pending',
  processing_started_at timestamptz,
  magic_link_sent_at timestamptz,
  magic_link_delivery_status text,
  last_email_error text,
  completed_at timestamptz,
  manual_review_reason text,
  manual_review_resolved_at timestamptz,
  manual_review_resolved_by uuid,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.checkout_fulfillments TO authenticated;
GRANT ALL ON public.checkout_fulfillments TO service_role;
ALTER TABLE public.checkout_fulfillments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own fulfillment rows" ON public.checkout_fulfillments;
CREATE POLICY "Users can view own fulfillment rows"
  ON public.checkout_fulfillments FOR SELECT
  USING (auth.uid() = user_id OR public.has_app_role(auth.uid(),'admin'::public.app_role));

CREATE INDEX IF NOT EXISTS idx_checkout_fulfillments_status ON public.checkout_fulfillments(status);
CREATE INDEX IF NOT EXISTS idx_checkout_fulfillments_user_id ON public.checkout_fulfillments(user_id);
CREATE INDEX IF NOT EXISTS idx_checkout_fulfillments_created_at ON public.checkout_fulfillments(created_at DESC);

CREATE OR REPLACE FUNCTION public.tg_checkout_fulfillments_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;
DROP TRIGGER IF EXISTS trg_checkout_fulfillments_updated_at ON public.checkout_fulfillments;
CREATE TRIGGER trg_checkout_fulfillments_updated_at
  BEFORE UPDATE ON public.checkout_fulfillments
  FOR EACH ROW EXECUTE FUNCTION public.tg_checkout_fulfillments_updated_at();

-- 3) checkout_session_audit
CREATE TABLE IF NOT EXISTS public.checkout_session_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  ip text,
  user_agent text,
  email text,
  lookup_key text,
  stripe_session_id text,
  outcome text,
  error_message text
);
GRANT ALL ON public.checkout_session_audit TO service_role;
ALTER TABLE public.checkout_session_audit ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins read checkout audit" ON public.checkout_session_audit;
CREATE POLICY "Admins read checkout audit"
  ON public.checkout_session_audit FOR SELECT
  USING (public.has_app_role(auth.uid(),'admin'::public.app_role));
CREATE INDEX IF NOT EXISTS idx_checkout_session_audit_created_at ON public.checkout_session_audit(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_checkout_session_audit_email ON public.checkout_session_audit(email);
CREATE INDEX IF NOT EXISTS idx_checkout_session_audit_ip ON public.checkout_session_audit(ip);

-- 4) admin_fulfillment_overrides (append-only)
CREATE TABLE IF NOT EXISTS public.admin_fulfillment_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  admin_user_id uuid NOT NULL,
  fulfillment_id uuid,
  stripe_session_id text NOT NULL,
  stripe_customer_id text,
  original_metadata_user_id uuid,
  override_user_id uuid,
  stripe_email text,
  override_user_email text,
  email_matched boolean,
  decision text NOT NULL,
  override_reason text,
  notes text,
  outcome text NOT NULL,
  manual_review_reason_at_decision text
);
GRANT SELECT ON public.admin_fulfillment_overrides TO authenticated;
GRANT ALL ON public.admin_fulfillment_overrides TO service_role;
ALTER TABLE public.admin_fulfillment_overrides ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins read override history" ON public.admin_fulfillment_overrides;
CREATE POLICY "Admins read override history"
  ON public.admin_fulfillment_overrides FOR SELECT
  USING (public.has_app_role(auth.uid(),'admin'::public.app_role));
-- No INSERT/UPDATE/DELETE policies: append-only at application/RPC layer.
CREATE INDEX IF NOT EXISTS idx_admin_overrides_created_at ON public.admin_fulfillment_overrides(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_overrides_fulfillment_id ON public.admin_fulfillment_overrides(fulfillment_id);
CREATE INDEX IF NOT EXISTS idx_admin_overrides_session ON public.admin_fulfillment_overrides(stripe_session_id);

-- 5) stripe_events.status
ALTER TABLE public.stripe_events
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'processed';
CREATE INDEX IF NOT EXISTS idx_stripe_events_status ON public.stripe_events(status);

-- 6) v_authoritative_consent
CREATE OR REPLACE VIEW public.v_authoritative_consent AS
WITH ranked AS (
  SELECT
    user_email,
    consent_type,
    terms_version,
    created_at,
    ip_address,
    CASE consent_type
      WHEN 'post_auth_terms' THEN 3
      WHEN 'post_payment_terms' THEN 2
      WHEN 'pre_checkout_email_typed' THEN 1
      ELSE 0
    END AS strength
  FROM public.user_consents
)
SELECT DISTINCT ON (user_email)
  user_email,
  consent_type,
  terms_version,
  created_at,
  ip_address,
  strength
FROM ranked
ORDER BY user_email, strength DESC, created_at DESC;
GRANT SELECT ON public.v_authoritative_consent TO authenticated, service_role;

-- 7) admin_resolve_manual_review RPC
CREATE OR REPLACE FUNCTION public.admin_resolve_manual_review(
  p_fulfillment_id uuid,
  p_decision text,
  p_override_user_id uuid DEFAULT NULL,
  p_override_reason text DEFAULT NULL,
  p_notes text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin uuid := auth.uid();
  v_row public.checkout_fulfillments%ROWTYPE;
BEGIN
  IF NOT public.has_app_role(v_admin, 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;
  IF p_decision NOT IN ('approve','reject') THEN
    RAISE EXCEPTION 'invalid_decision';
  END IF;

  SELECT * INTO v_row FROM public.checkout_fulfillments WHERE id = p_fulfillment_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'fulfillment_not_found';
  END IF;
  IF v_row.status <> 'manual_review' THEN
    RAISE EXCEPTION 'not_in_manual_review';
  END IF;

  IF p_decision = 'reject' THEN
    UPDATE public.checkout_fulfillments
       SET status = 'rejected',
           manual_review_resolved_at = now(),
           manual_review_resolved_by = v_admin,
           updated_at = now()
     WHERE id = p_fulfillment_id;

    INSERT INTO public.admin_fulfillment_overrides
      (admin_user_id, fulfillment_id, stripe_session_id, stripe_customer_id,
       original_metadata_user_id, override_user_id, decision, override_reason,
       notes, outcome, manual_review_reason_at_decision)
    VALUES
      (v_admin, p_fulfillment_id, v_row.stripe_session_id, v_row.stripe_customer_id,
       NULL, NULL, 'reject', p_override_reason, p_notes, 'rejected',
       v_row.manual_review_reason);

    RETURN jsonb_build_object('status','rejected');
  END IF;

  RETURN jsonb_build_object(
    'status','ready_to_fulfill',
    'fulfillment_id', v_row.id,
    'stripe_session_id', v_row.stripe_session_id,
    'override_user_id', p_override_user_id,
    'override_reason', p_override_reason,
    'notes', p_notes,
    'admin_user_id', v_admin,
    'manual_review_reason', v_row.manual_review_reason
  );
END $$;

GRANT EXECUTE ON FUNCTION public.admin_resolve_manual_review(uuid, text, uuid, text, text)
  TO authenticated;

CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier_created_at
  ON public.rate_limits(identifier, created_at DESC);
