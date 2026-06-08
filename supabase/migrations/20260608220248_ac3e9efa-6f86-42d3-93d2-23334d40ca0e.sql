
-- mfa_step_up_sessions
CREATE TABLE public.mfa_step_up_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  stepped_up_until timestamptz NOT NULL,
  last_step_up_at timestamptz NOT NULL DEFAULT now(),
  method text NOT NULL CHECK (method IN ('totp','backup_code')),
  ip text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_mfa_step_up_user_recent ON public.mfa_step_up_sessions (user_id, last_step_up_at DESC);
GRANT SELECT ON public.mfa_step_up_sessions TO authenticated;
GRANT ALL ON public.mfa_step_up_sessions TO service_role;
ALTER TABLE public.mfa_step_up_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own step-up sessions" ON public.mfa_step_up_sessions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- mfa_attempt_log (append-only)
CREATE TABLE public.mfa_attempt_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  ip text,
  kind text NOT NULL,
  outcome text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_mfa_attempt_user_recent ON public.mfa_attempt_log (user_id, created_at DESC);
CREATE INDEX idx_mfa_attempt_ip_recent ON public.mfa_attempt_log (ip, created_at DESC);
GRANT SELECT ON public.mfa_attempt_log TO authenticated;
GRANT ALL ON public.mfa_attempt_log TO service_role;
ALTER TABLE public.mfa_attempt_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own MFA attempts" ON public.mfa_attempt_log
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- email_change_requests (service-role only)
CREATE TABLE public.email_change_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  new_email text NOT NULL,
  token_hash text NOT NULL UNIQUE,
  requested_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '15 minutes'),
  confirmed_at timestamptz,
  cancelled_at timestamptz,
  ip text,
  user_agent text
);
CREATE INDEX idx_email_change_user ON public.email_change_requests (user_id);
CREATE UNIQUE INDEX uniq_open_email_change_per_user ON public.email_change_requests (user_id)
  WHERE confirmed_at IS NULL AND cancelled_at IS NULL;
GRANT ALL ON public.email_change_requests TO service_role;
ALTER TABLE public.email_change_requests ENABLE ROW LEVEL SECURITY;
-- No policies for authenticated/anon; all access via service role.

-- backup_codes: hashing-algorithm column
ALTER TABLE public.backup_codes
  ADD COLUMN IF NOT EXISTS code_hash_algo text NOT NULL DEFAULT 'sha256';

-- profiles: idempotent MFA-enabled email gate
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS mfa_enabled_email_sent_at timestamptz;
