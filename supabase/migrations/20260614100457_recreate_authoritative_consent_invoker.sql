-- M2 follow-up: recreate the view with the invoker option so table RLS applies.
CREATE OR REPLACE VIEW public.v_authoritative_consent
WITH (security_invoker = true) AS
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
