
-- =====================================================================
-- AU Invite Hardening — Phase 1: schema + atomic acceptance
-- =====================================================================

-- 1) invites schema additions ---------------------------------------------
ALTER TABLE public.invites
  ADD COLUMN IF NOT EXISTS delivery_status     text NOT NULL DEFAULT 'not_sent',
  ADD COLUMN IF NOT EXISTS delivered_at        timestamptz,
  ADD COLUMN IF NOT EXISTS last_delivery_error text,
  ADD COLUMN IF NOT EXISTS last_sent_at        timestamptz,
  ADD COLUMN IF NOT EXISTS resend_count        integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS accepted_at         timestamptz;

-- Ensure expires_at default exists
ALTER TABLE public.invites
  ALTER COLUMN expires_at SET DEFAULT (now() + interval '7 days');

-- delivery_status CHECK
ALTER TABLE public.invites
  DROP CONSTRAINT IF EXISTS invites_delivery_status_check;
ALTER TABLE public.invites
  ADD CONSTRAINT invites_delivery_status_check
  CHECK (delivery_status IN ('not_sent','sent','failed'));

-- Expand status check to include 'canceled'
ALTER TABLE public.invites
  DROP CONSTRAINT IF EXISTS invites_status_check;
ALTER TABLE public.invites
  ADD CONSTRAINT invites_status_check
  CHECK (status IN ('pending','accepted','expired','canceled'));

-- Unique partial index: one pending invite per (account_id, lower(email))
CREATE UNIQUE INDEX IF NOT EXISTS invites_pending_account_email_uniq
  ON public.invites (account_id, lower(email))
  WHERE status = 'pending';

-- 2) Eligibility helpers --------------------------------------------------
-- Owner can SEND/RESEND invites?
CREATE OR REPLACE FUNCTION public.can_send_au_invite(_account_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner_id      uuid;
  v_owner_state   text;
  v_acct_status   text;
  v_ent_status    text;
BEGIN
  SELECT owner_user_id, owner_state
    INTO v_owner_id, v_owner_state
  FROM public.accounts
  WHERE id = _account_id;

  IF v_owner_id IS NULL THEN
    RETURN false;
  END IF;

  IF v_owner_state IS DISTINCT FROM 'active' THEN
    RETURN false;
  END IF;

  -- Owner's profile-level account status must be writable
  SELECT account_status INTO v_acct_status
  FROM public.profiles
  WHERE user_id = v_owner_id;

  IF v_acct_status IN ('deleted','scheduled_for_deletion','deletion_requested','expired_read_only','inactive') THEN
    RETURN false;
  END IF;

  -- Active subscription/entitlement required (proxy for trusted_contacts)
  SELECT status INTO v_ent_status
  FROM public.entitlements
  WHERE user_id = v_owner_id;

  IF v_ent_status IS NULL OR v_ent_status NOT IN ('active','trialing') THEN
    RETURN false;
  END IF;

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.can_send_au_invite(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.can_send_au_invite(uuid) TO authenticated, service_role;

-- Owner state allows ACCEPTING an outstanding invite?
-- (Does NOT recheck trusted_contacts entitlement — only blocks unavailable accounts)
CREATE OR REPLACE FUNCTION public.can_accept_au_invite(_account_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner_id    uuid;
  v_owner_state text;
  v_acct_status text;
BEGIN
  SELECT owner_user_id, owner_state
    INTO v_owner_id, v_owner_state
  FROM public.accounts
  WHERE id = _account_id;

  IF v_owner_id IS NULL THEN
    RETURN false;
  END IF;

  IF v_owner_state IS DISTINCT FROM 'active' THEN
    RETURN false;
  END IF;

  SELECT account_status INTO v_acct_status
  FROM public.profiles
  WHERE user_id = v_owner_id;

  IF v_acct_status IN ('deleted','scheduled_for_deletion','deletion_requested','expired_read_only','inactive') THEN
    RETURN false;
  END IF;

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.can_accept_au_invite(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.can_accept_au_invite(uuid) TO authenticated, service_role;

-- 3) Atomic acceptance RPC -----------------------------------------------
-- Caller (edge function) verifies JWT, then passes verified user id + email.
-- This function NEVER reads auth.users.
CREATE OR REPLACE FUNCTION public.accept_invite_atomic(
  _token_hash text,
  _user_id    uuid,
  _user_email text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invite      public.invites%ROWTYPE;
  v_now         timestamptz := now();
BEGIN
  IF _token_hash IS NULL OR _user_id IS NULL OR _user_email IS NULL THEN
    RAISE EXCEPTION 'invalid_arguments' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO v_invite
  FROM public.invites
  WHERE token_hash = _token_hash
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'invite_not_found' USING ERRCODE = 'P0002';
  END IF;

  IF v_invite.status = 'accepted' THEN
    RAISE EXCEPTION 'invite_already_used' USING ERRCODE = 'P0001';
  END IF;

  IF v_invite.status IN ('expired','canceled') THEN
    RAISE EXCEPTION 'invite_not_pending' USING ERRCODE = 'P0001';
  END IF;

  IF v_invite.expires_at <= v_now THEN
    UPDATE public.invites SET status = 'expired' WHERE id = v_invite.id;
    RAISE EXCEPTION 'invite_expired' USING ERRCODE = 'P0001';
  END IF;

  IF NOT public.can_accept_au_invite(v_invite.account_id) THEN
    RAISE EXCEPTION 'account_unavailable' USING ERRCODE = 'P0001';
  END IF;

  IF lower(_user_email) <> lower(v_invite.email) THEN
    RAISE EXCEPTION 'email_mismatch' USING ERRCODE = 'P0001';
  END IF;

  -- Upsert membership atomically (reactivates revoked rows)
  INSERT INTO public.account_memberships
    (account_id, user_id, role, status, invited_by, accepted_at, email)
  VALUES
    (v_invite.account_id, _user_id, v_invite.role, 'active',
     v_invite.invited_by, v_now, v_invite.email)
  ON CONFLICT (account_id, user_id) DO UPDATE
    SET role        = EXCLUDED.role,
        status      = 'active',
        accepted_at = v_now,
        email       = EXCLUDED.email;

  UPDATE public.invites
     SET status      = 'accepted',
         accepted_at = v_now
   WHERE id = v_invite.id;

  -- Only last_used_account_id. Do NOT touch password_set / onboarding_complete.
  UPDATE public.profiles
     SET last_used_account_id = v_invite.account_id
   WHERE user_id = _user_id;

  INSERT INTO public.user_activity_logs (
    user_id, actor_user_id, action_type, action_category,
    resource_type, resource_name, details
  ) VALUES (
    (SELECT owner_user_id FROM public.accounts WHERE id = v_invite.account_id),
    _user_id,
    'invite_accepted',
    'authorized_users',
    'account',
    _user_email,
    jsonb_build_object('role', v_invite.role, 'invite_id', v_invite.id)
  );

  RETURN jsonb_build_object(
    'success',    true,
    'account_id', v_invite.account_id,
    'role',       v_invite.role
  );
END;
$$;

REVOKE ALL ON FUNCTION public.accept_invite_atomic(text, uuid, text) FROM public;
GRANT EXECUTE ON FUNCTION public.accept_invite_atomic(text, uuid, text) TO service_role;
