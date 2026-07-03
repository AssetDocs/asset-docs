-- Add 'billing_review' to dev_support_type enum (idempotent)
ALTER TYPE public.dev_support_type ADD VALUE IF NOT EXISTS 'billing_review';

-- Create stripe_refund_reviews table
CREATE TABLE IF NOT EXISTS public.stripe_refund_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_refund_id text NOT NULL UNIQUE,
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
  manual_review_status text NOT NULL DEFAULT 'needs_review'
    CHECK (manual_review_status IN ('needs_review', 'reviewed', 'no_action_required')),
  access_action_status text NOT NULL DEFAULT 'review_required'
    CHECK (access_action_status IN ('review_required', 'no_action', 'read_only_applied', 'resolved')),
  support_issue_id uuid REFERENCES public.dev_support_issues(id) ON DELETE SET NULL,
  latest_event_id text,
  raw_payload jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- REQUIRED grants (missing from the original migration file)
GRANT SELECT ON public.stripe_refund_reviews TO authenticated;
GRANT ALL    ON public.stripe_refund_reviews TO service_role;

-- Enable RLS
ALTER TABLE public.stripe_refund_reviews ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Service role manages stripe refund reviews" ON public.stripe_refund_reviews;
CREATE POLICY "Service role manages stripe refund reviews"
  ON public.stripe_refund_reviews
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view stripe refund reviews" ON public.stripe_refund_reviews;
CREATE POLICY "Admins can view stripe refund reviews"
  ON public.stripe_refund_reviews
  FOR SELECT
  TO authenticated
  USING (public.has_app_role(auth.uid(), 'admin'::public.app_role));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_stripe_refund_reviews_status
  ON public.stripe_refund_reviews(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_stripe_refund_reviews_customer
  ON public.stripe_refund_reviews(stripe_customer_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_stripe_refund_reviews_user_id
  ON public.stripe_refund_reviews(user_id, created_at DESC)
  WHERE user_id IS NOT NULL;

-- updated_at trigger
DROP TRIGGER IF EXISTS update_stripe_refund_reviews_updated_at
  ON public.stripe_refund_reviews;
CREATE TRIGGER update_stripe_refund_reviews_updated_at
  BEFORE UPDATE ON public.stripe_refund_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();