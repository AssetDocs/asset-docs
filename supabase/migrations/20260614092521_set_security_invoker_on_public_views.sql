-- M2 launch fix: public views must run with caller privileges so table RLS applies.
ALTER VIEW public.v_authoritative_consent SET (security_invoker = true);

-- Legacy view may not exist in all environments; keep this idempotent.
ALTER VIEW IF EXISTS public.gift_subscriptions_user_view SET (security_invoker = true);
