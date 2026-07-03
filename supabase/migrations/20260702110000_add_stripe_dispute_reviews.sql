ALTER TYPE public.dev_support_type ADD VALUE IF NOT EXISTS 'billing_review';

CREATE TABLE IF NOT EXISTS public.stripe_dispute_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_dispute_id text NOT NULL UNIQUE,
  stripe_charge_id text,
  stripe_payment_intent_id text,
  stripe_customer_id text,
  user_id uuid,
  customer_email text,
  amount integer,
  currency text,
  reason text,
  status text,
  outcome text,
  evidence_due_by timestamp with time zone,
  opened_at timestamp with time zone,
  closed_at timestamp with time zone,
  access_action_status text NOT NULL DEFAULT 'review_required'
    CHECK (access_action_status IN ('review_required', 'no_action', 'read_only_applied', 'resolved')),
  support_issue_id uuid REFERENCES public.dev_support_issues(id) ON DELETE SET NULL,
  latest_event_id text,
  raw_payload jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.stripe_dispute_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages stripe dispute reviews"
  ON public.stripe_dispute_reviews
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can view stripe dispute reviews"
  ON public.stripe_dispute_reviews
  FOR SELECT
  TO authenticated
  USING (public.has_app_role(auth.uid(), 'admin'::public.app_role));

CREATE INDEX IF NOT EXISTS idx_stripe_dispute_reviews_status
  ON public.stripe_dispute_reviews(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_stripe_dispute_reviews_customer
  ON public.stripe_dispute_reviews(stripe_customer_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_stripe_dispute_reviews_user_id
  ON public.stripe_dispute_reviews(user_id, created_at DESC)
  WHERE user_id IS NOT NULL;

DROP TRIGGER IF EXISTS update_stripe_dispute_reviews_updated_at
  ON public.stripe_dispute_reviews;
CREATE TRIGGER update_stripe_dispute_reviews_updated_at
  BEFORE UPDATE ON public.stripe_dispute_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
