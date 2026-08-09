-- Harden user-controlled UPDATE policies against column smuggling.
--
-- Governing rule:
-- A user may update the state necessary to complete their action, but may
-- never use that update permission to alter the authority, ownership,
-- financial terms, or entitlement terms of the record.

-- Contributors may accept/decline their own invitation, but may not use the
-- self-update policy to change role, owner, identity binding, or invite terms.
CREATE OR REPLACE FUNCTION public.guard_contributor_self_acceptance_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_service boolean := public.is_service_role()
    OR current_setting('role', true) = 'service_role'
    OR public.is_trusted_db_writer();
  v_actor uuid := auth.uid();
BEGIN
  IF v_is_service OR v_actor = OLD.account_owner_id THEN
    RETURN NEW;
  END IF;

  IF v_actor = OLD.contributor_user_id THEN
    IF NEW.id IS DISTINCT FROM OLD.id
       OR NEW.account_owner_id IS DISTINCT FROM OLD.account_owner_id
       OR NEW.contributor_email IS DISTINCT FROM OLD.contributor_email
       OR NEW.contributor_user_id IS DISTINCT FROM OLD.contributor_user_id
       OR NEW.first_name IS DISTINCT FROM OLD.first_name
       OR NEW.last_name IS DISTINCT FROM OLD.last_name
       OR NEW.role IS DISTINCT FROM OLD.role
       OR NEW.invite_token IS DISTINCT FROM OLD.invite_token
       OR NEW.invited_at IS DISTINCT FROM OLD.invited_at
       OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
      RAISE EXCEPTION 'contributors: self-acceptance update cannot change authority or identity columns'
        USING ERRCODE = '42501';
    END IF;

    IF NOT (
      OLD.status = 'pending'
      AND NEW.status IN ('accepted', 'declined')
    ) THEN
      RAISE EXCEPTION 'contributors: self-update may only accept or decline a pending invitation'
        USING ERRCODE = '42501';
    END IF;

    IF NEW.status = 'accepted' AND NEW.accepted_at IS NULL THEN
      NEW.accepted_at := now();
    END IF;

    IF NEW.status = 'declined' AND NEW.accepted_at IS DISTINCT FROM OLD.accepted_at THEN
      RAISE EXCEPTION 'contributors: declining an invitation cannot set accepted_at'
        USING ERRCODE = '42501';
    END IF;

    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'contributors: update not allowed for this actor'
    USING ERRCODE = '42501';
END;
$$;

DROP TRIGGER IF EXISTS guard_contributor_self_acceptance_update ON public.contributors;
CREATE TRIGGER guard_contributor_self_acceptance_update
BEFORE UPDATE ON public.contributors
FOR EACH ROW
EXECUTE FUNCTION public.guard_contributor_self_acceptance_update();

-- Legacy authenticated gift-claim UPDATEs may only mark the claim/redeem state.
-- Plan, term, expiration, amount, purchaser data, delivery/payment state, and
-- account ownership remain service-role controlled.
CREATE OR REPLACE FUNCTION public.guard_gift_subscription_claim_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_service boolean := public.is_service_role()
    OR current_setting('role', true) = 'service_role'
    OR public.is_trusted_db_writer();
  v_actor uuid := auth.uid();
BEGIN
  IF v_is_service THEN
    RETURN NEW;
  END IF;

  IF v_actor IS NULL THEN
    RAISE EXCEPTION 'gift_subscriptions: authentication required for claim update'
      USING ERRCODE = '42501';
  END IF;

  IF OLD.recipient_user_id IS NOT NULL
     OR OLD.redeemed IS TRUE
     OR OLD.status IS DISTINCT FROM 'paid' THEN
    RAISE EXCEPTION 'gift_subscriptions: only an unclaimed paid gift can be claimed by the recipient'
      USING ERRCODE = '42501';
  END IF;

  IF NEW.id IS DISTINCT FROM OLD.id
     OR NEW.gift_code IS DISTINCT FROM OLD.gift_code
     OR NEW.stripe_session_id IS DISTINCT FROM OLD.stripe_session_id
     OR NEW.stripe_checkout_session_id IS DISTINCT FROM OLD.stripe_checkout_session_id
     OR NEW.plan_type IS DISTINCT FROM OLD.plan_type
     OR NEW.term IS DISTINCT FROM OLD.term
     OR NEW.expires_at IS DISTINCT FROM OLD.expires_at
     OR NEW.amount IS DISTINCT FROM OLD.amount
     OR NEW.currency IS DISTINCT FROM OLD.currency
     OR NEW.anonymized_at IS DISTINCT FROM OLD.anonymized_at
     OR NEW.deleted_account_id IS DISTINCT FROM OLD.deleted_account_id
     OR NEW.email_hash IS DISTINCT FROM OLD.email_hash
     OR NEW.failed_at IS DISTINCT FROM OLD.failed_at
     OR NEW.failure_reason IS DISTINCT FROM OLD.failure_reason
     OR NEW.purchaser_deleted_account_id IS DISTINCT FROM OLD.purchaser_deleted_account_id
     OR NEW.purchaser_user_id IS DISTINCT FROM OLD.purchaser_user_id
     OR NEW.purchaser_email IS DISTINCT FROM OLD.purchaser_email
     OR NEW.purchaser_name IS DISTINCT FROM OLD.purchaser_name
     OR NEW.purchaser_phone IS DISTINCT FROM OLD.purchaser_phone
     OR NEW.recipient_deleted_account_id IS DISTINCT FROM OLD.recipient_deleted_account_id
     OR NEW.recipient_email IS DISTINCT FROM OLD.recipient_email
     OR NEW.recipient_email_normalized IS DISTINCT FROM OLD.recipient_email_normalized
     OR NEW.recipient_name IS DISTINCT FROM OLD.recipient_name
     OR NEW.gift_message IS DISTINCT FROM OLD.gift_message
     OR NEW.delivery_date IS DISTINCT FROM OLD.delivery_date
     OR NEW.delivery_method IS DISTINCT FROM OLD.delivery_method
     OR NEW.payment_status IS DISTINCT FROM OLD.payment_status
     OR NEW.delivery_status IS DISTINCT FROM OLD.delivery_status
     OR NEW.delivery_attempted_at IS DISTINCT FROM OLD.delivery_attempted_at
     OR NEW.paid_at IS DISTINCT FROM OLD.paid_at
     OR NEW.delivered_at IS DISTINCT FROM OLD.delivered_at
     OR NEW.first_login_at IS DISTINCT FROM OLD.first_login_at
     OR NEW.recipient_email_sent_at IS DISTINCT FROM OLD.recipient_email_sent_at
     OR NEW.purchaser_email_sent_at IS DISTINCT FROM OLD.purchaser_email_sent_at
     OR NEW.expiration_3_day_email_sent_at IS DISTINCT FROM OLD.expiration_3_day_email_sent_at
     OR NEW.expiration_15_day_email_sent_at IS DISTINCT FROM OLD.expiration_15_day_email_sent_at
     OR NEW.expiration_30_day_email_sent_at IS DISTINCT FROM OLD.expiration_30_day_email_sent_at
     OR NEW.expiration_day_email_sent_at IS DISTINCT FROM OLD.expiration_day_email_sent_at
     OR NEW.reminder_email_sent IS DISTINCT FROM OLD.reminder_email_sent
     OR NEW.reminder_email_sent_at IS DISTINCT FROM OLD.reminder_email_sent_at
     OR NEW.last_delivery_error IS DISTINCT FROM OLD.last_delivery_error
     OR NEW.stripe_payment_intent_id IS DISTINCT FROM OLD.stripe_payment_intent_id
     OR NEW.stripe_subscription_id IS DISTINCT FROM OLD.stripe_subscription_id
     OR NEW.claim_token_hash IS DISTINCT FROM OLD.claim_token_hash
     OR NEW.resend_recipient_email_id IS DISTINCT FROM OLD.resend_recipient_email_id
     OR NEW.resend_purchaser_email_id IS DISTINCT FROM OLD.resend_purchaser_email_id
     OR NEW.success_token_hash IS DISTINCT FROM OLD.success_token_hash
     OR NEW.success_token_expires_at IS DISTINCT FROM OLD.success_token_expires_at
     OR NEW.cancelled_at IS DISTINCT FROM OLD.cancelled_at
     OR NEW.refunded_at IS DISTINCT FROM OLD.refunded_at
     OR NEW.manually_voided_at IS DISTINCT FROM OLD.manually_voided_at
     OR NEW.claimed_account_id IS DISTINCT FROM OLD.claimed_account_id
     OR NEW.claimed_auth_email IS DISTINCT FROM OLD.claimed_auth_email
     OR NEW.recipient_email_verified_at IS DISTINCT FROM OLD.recipient_email_verified_at
     OR NEW.verification_method IS DISTINCT FROM OLD.verification_method
     OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'gift_subscriptions: claim update cannot change financial, ownership, delivery, or entitlement columns'
      USING ERRCODE = '42501';
  END IF;

  IF NEW.recipient_user_id IS DISTINCT FROM v_actor
     OR NEW.redeemed IS DISTINCT FROM true
     OR NEW.redeemed_by_user_id IS DISTINCT FROM v_actor THEN
    RAISE EXCEPTION 'gift_subscriptions: claim update must bind redemption to the authenticated recipient'
      USING ERRCODE = '42501';
  END IF;

  IF NEW.status NOT IN ('paid', 'claimed') THEN
    RAISE EXCEPTION 'gift_subscriptions: claim update cannot set status %', NEW.status
      USING ERRCODE = '42501';
  END IF;

  IF NEW.redemption_status IS DISTINCT FROM OLD.redemption_status
     AND NEW.redemption_status IS DISTINCT FROM 'redeemed' THEN
    RAISE EXCEPTION 'gift_subscriptions: claim update cannot set redemption_status %', NEW.redemption_status
      USING ERRCODE = '42501';
  END IF;

  IF NEW.claim_status IS DISTINCT FROM OLD.claim_status
     AND NEW.claim_status IS DISTINCT FROM 'claimed' THEN
    RAISE EXCEPTION 'gift_subscriptions: claim update cannot set claim_status %', NEW.claim_status
      USING ERRCODE = '42501';
  END IF;

  IF NEW.claimed_by_user_id IS DISTINCT FROM OLD.claimed_by_user_id
     AND NEW.claimed_by_user_id IS DISTINCT FROM v_actor THEN
    RAISE EXCEPTION 'gift_subscriptions: claimed_by_user_id must match authenticated recipient'
      USING ERRCODE = '42501';
  END IF;

  IF NEW.redeemed_at IS NULL THEN
    NEW.redeemed_at := now();
  END IF;

  IF NEW.claim_status = 'claimed' AND NEW.claimed_at IS NULL THEN
    NEW.claimed_at := now();
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_gift_subscription_claim_update ON public.gift_subscriptions;
CREATE TRIGGER guard_gift_subscription_claim_update
BEFORE UPDATE ON public.gift_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.guard_gift_subscription_claim_update();