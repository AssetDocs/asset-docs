-- Support the account-deletion tombstone model used by retained billing,
-- legal, consent, and audit records.

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

ALTER TABLE public.deleted_accounts
  ADD COLUMN IF NOT EXISTS email_hash text,
  ADD COLUMN IF NOT EXISTS former_user_id_hash text,
  ADD COLUMN IF NOT EXISTS deletion_status text NOT NULL DEFAULT 'completed',
  ADD COLUMN IF NOT EXISTS deletion_reason text,
  ADD COLUMN IF NOT EXISTS legal_hold boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS retention_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS stripe_customer_id text;

UPDATE public.deleted_accounts
SET
  email_hash = COALESCE(email_hash, encode(extensions.digest(lower(email), 'sha256'), 'hex')),
  former_user_id_hash = COALESCE(
    former_user_id_hash,
    CASE
      WHEN original_user_id IS NULL THEN NULL
      ELSE encode(extensions.digest(original_user_id::text, 'sha256'), 'hex')
    END
  )
WHERE email_hash IS NULL
  OR (original_user_id IS NOT NULL AND former_user_id_hash IS NULL);

CREATE INDEX IF NOT EXISTS idx_deleted_accounts_email_hash
  ON public.deleted_accounts(email_hash);

CREATE INDEX IF NOT EXISTS idx_deleted_accounts_retention_expires_at
  ON public.deleted_accounts(retention_expires_at)
  WHERE retention_expires_at IS NOT NULL;

ALTER TABLE public.subscribers
  ALTER COLUMN user_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS deleted_account_id uuid REFERENCES public.deleted_accounts(id),
  ADD COLUMN IF NOT EXISTS email_hash text,
  ADD COLUMN IF NOT EXISTS anonymized_at timestamptz;

ALTER TABLE public.payment_events
  ADD COLUMN IF NOT EXISTS deleted_account_id uuid REFERENCES public.deleted_accounts(id),
  ADD COLUMN IF NOT EXISTS email_hash text,
  ADD COLUMN IF NOT EXISTS anonymized_at timestamptz;

ALTER TABLE public.audit_logs
  ADD COLUMN IF NOT EXISTS deleted_account_id uuid REFERENCES public.deleted_accounts(id),
  ADD COLUMN IF NOT EXISTS email_hash text,
  ADD COLUMN IF NOT EXISTS anonymized_at timestamptz;

ALTER TABLE public.user_activity_logs
  ALTER COLUMN user_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS deleted_account_id uuid REFERENCES public.deleted_accounts(id),
  ADD COLUMN IF NOT EXISTS email_hash text,
  ADD COLUMN IF NOT EXISTS anonymized_at timestamptz;

ALTER TABLE public.checkout_fulfillments
  ADD COLUMN IF NOT EXISTS deleted_account_id uuid REFERENCES public.deleted_accounts(id),
  ADD COLUMN IF NOT EXISTS email_hash text,
  ADD COLUMN IF NOT EXISTS anonymized_at timestamptz;

ALTER TABLE public.checkout_session_audit
  ADD COLUMN IF NOT EXISTS deleted_account_id uuid REFERENCES public.deleted_accounts(id),
  ADD COLUMN IF NOT EXISTS email_hash text,
  ADD COLUMN IF NOT EXISTS anonymized_at timestamptz;

ALTER TABLE public.subscription_cancellations
  ALTER COLUMN owner_user_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS deleted_account_id uuid REFERENCES public.deleted_accounts(id),
  ADD COLUMN IF NOT EXISTS email_hash text,
  ADD COLUMN IF NOT EXISTS anonymized_at timestamptz;

ALTER TABLE public.account_closure_requests
  ALTER COLUMN owner_user_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS deleted_account_id uuid REFERENCES public.deleted_accounts(id),
  ADD COLUMN IF NOT EXISTS email_hash text,
  ADD COLUMN IF NOT EXISTS anonymized_at timestamptz;

ALTER TABLE public.account_deletion_requests
  ALTER COLUMN account_owner_id DROP NOT NULL,
  ALTER COLUMN requester_user_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS deleted_account_id uuid REFERENCES public.deleted_accounts(id),
  ADD COLUMN IF NOT EXISTS email_hash text,
  ADD COLUMN IF NOT EXISTS anonymized_at timestamptz;

ALTER TABLE public.gift_subscriptions
  ADD COLUMN IF NOT EXISTS deleted_account_id uuid REFERENCES public.deleted_accounts(id),
  ADD COLUMN IF NOT EXISTS email_hash text,
  ADD COLUMN IF NOT EXISTS anonymized_at timestamptz;

ALTER TABLE public.legal_agreement_signatures
  ADD COLUMN IF NOT EXISTS deleted_account_id uuid REFERENCES public.deleted_accounts(id),
  ADD COLUMN IF NOT EXISTS email_hash text,
  ADD COLUMN IF NOT EXISTS anonymized_at timestamptz;

ALTER TABLE public.user_consents
  ADD COLUMN IF NOT EXISTS deleted_account_id uuid REFERENCES public.deleted_accounts(id),
  ADD COLUMN IF NOT EXISTS email_hash text,
  ADD COLUMN IF NOT EXISTS anonymized_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_subscribers_deleted_account_id ON public.subscribers(deleted_account_id);
CREATE INDEX IF NOT EXISTS idx_payment_events_deleted_account_id ON public.payment_events(deleted_account_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_deleted_account_id ON public.audit_logs(deleted_account_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_deleted_account_id ON public.user_activity_logs(deleted_account_id);
CREATE INDEX IF NOT EXISTS idx_checkout_fulfillments_deleted_account_id ON public.checkout_fulfillments(deleted_account_id);
CREATE INDEX IF NOT EXISTS idx_checkout_session_audit_deleted_account_id ON public.checkout_session_audit(deleted_account_id);
CREATE INDEX IF NOT EXISTS idx_subscription_cancellations_deleted_account_id ON public.subscription_cancellations(deleted_account_id);
CREATE INDEX IF NOT EXISTS idx_account_closure_requests_deleted_account_id ON public.account_closure_requests(deleted_account_id);
CREATE INDEX IF NOT EXISTS idx_account_deletion_requests_deleted_account_id ON public.account_deletion_requests(deleted_account_id);
CREATE INDEX IF NOT EXISTS idx_gift_subscriptions_deleted_account_id ON public.gift_subscriptions(deleted_account_id);
CREATE INDEX IF NOT EXISTS idx_legal_agreement_signatures_deleted_account_id ON public.legal_agreement_signatures(deleted_account_id);
CREATE INDEX IF NOT EXISTS idx_user_consents_deleted_account_id ON public.user_consents(deleted_account_id);
