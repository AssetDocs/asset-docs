ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS account_status TEXT NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS cancellation_notice_sent_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS public.subscription_cancellations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID,
  owner_user_id UUID NOT NULL,
  cancelled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  period_end TIMESTAMPTZ,
  reason TEXT,
  comments TEXT,
  plan TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.subscription_cancellations TO authenticated;
GRANT ALL ON public.subscription_cancellations TO service_role;
ALTER TABLE public.subscription_cancellations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "owner reads own cancellations" ON public.subscription_cancellations;
CREATE POLICY "owner reads own cancellations"
  ON public.subscription_cancellations FOR SELECT
  TO authenticated USING (auth.uid() = owner_user_id);

DROP POLICY IF EXISTS "admins read all cancellations" ON public.subscription_cancellations;
CREATE POLICY "admins read all cancellations"
  ON public.subscription_cancellations FOR SELECT
  TO authenticated
  USING (public.get_admin_role(auth.uid()) IN ('owner'::public.app_role, 'admin'::public.app_role));

CREATE TABLE IF NOT EXISTS public.account_closure_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID,
  owner_user_id UUID NOT NULL,
  request_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  deletion_scheduled_date TIMESTAMPTZ,
  reason TEXT,
  comments TEXT,
  subscription_status TEXT,
  current_period_end TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','scheduled','reversed','completed')),
  reversed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.account_closure_requests TO authenticated;
GRANT ALL ON public.account_closure_requests TO service_role;
ALTER TABLE public.account_closure_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "owner reads own closure requests" ON public.account_closure_requests;
CREATE POLICY "owner reads own closure requests"
  ON public.account_closure_requests FOR SELECT
  TO authenticated USING (auth.uid() = owner_user_id);

DROP POLICY IF EXISTS "admins read all closure requests" ON public.account_closure_requests;
CREATE POLICY "admins read all closure requests"
  ON public.account_closure_requests FOR SELECT
  TO authenticated
  USING (public.get_admin_role(auth.uid()) IN ('owner'::public.app_role, 'admin'::public.app_role));

CREATE INDEX IF NOT EXISTS idx_closure_requests_owner ON public.account_closure_requests(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_closure_requests_status ON public.account_closure_requests(status);

DROP TRIGGER IF EXISTS trg_closure_requests_updated_at ON public.account_closure_requests;
CREATE TRIGGER trg_closure_requests_updated_at
  BEFORE UPDATE ON public.account_closure_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.subscription_email_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID,
  user_id UUID,
  event_type TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT,
  resend_message_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS uniq_subscription_email_events_dedup
  ON public.subscription_email_events (account_id, event_type, recipient_email);
GRANT SELECT ON public.subscription_email_events TO authenticated;
GRANT ALL ON public.subscription_email_events TO service_role;
ALTER TABLE public.subscription_email_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admins read all email events" ON public.subscription_email_events;
CREATE POLICY "admins read all email events"
  ON public.subscription_email_events FOR SELECT
  TO authenticated
  USING (public.get_admin_role(auth.uid()) IN ('owner'::public.app_role, 'admin'::public.app_role));

CREATE OR REPLACE FUNCTION public.is_account_read_only(_user_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = _user_id
      AND account_status IN ('expired_read_only','deletion_requested','scheduled_for_deletion')
  );
$$;
GRANT EXECUTE ON FUNCTION public.is_account_read_only(UUID) TO authenticated, service_role;