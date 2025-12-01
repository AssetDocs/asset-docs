ALTER TABLE public.legacy_locker
ADD COLUMN delegate_user_id uuid,
ADD COLUMN recovery_grace_period_days integer DEFAULT 14,
ADD COLUMN recovery_status text DEFAULT 'none',
ADD COLUMN recovery_requested_at timestamp with time zone,
ADD COLUMN encryption_key_encrypted_for_user text,
ADD COLUMN encryption_key_encrypted_for_delegate text;

CREATE TABLE public.recovery_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_locker_id uuid NOT NULL,
  delegate_user_id uuid NOT NULL,
  owner_user_id uuid NOT NULL,
  relationship text,
  reason text,
  documentation_url text,
  status text NOT NULL DEFAULT 'pending',
  grace_period_ends_at timestamp with time zone NOT NULL,
  requested_at timestamp with time zone NOT NULL DEFAULT now(),
  responded_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.recovery_requests ENABLE ROW LEVEL SECURITY;