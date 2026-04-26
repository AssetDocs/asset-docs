
-- 1) Add admin role guard to CRM analytics RPCs
CREATE OR REPLACE FUNCTION public.get_at_risk_customers()
RETURNS TABLE(email text, plan_id text, last_activity timestamp with time zone)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_owner_workspace_access(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT
    c.email,
    p.plan_id,
    MAX(e.occurred_at) AS last_activity
  FROM profiles p
  JOIN contacts c ON c.user_id = p.user_id
  LEFT JOIN events e ON e.user_id = p.user_id
  WHERE p.plan_status = 'active'
  GROUP BY c.email, p.plan_id
  HAVING COALESCE(MAX(e.occurred_at), '1970-01-01'::timestamptz) < NOW() - INTERVAL '30 days'
  ORDER BY last_activity NULLS FIRST
  LIMIT 50;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_leads_by_source()
RETURNS TABLE(source text, count bigint)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_owner_workspace_access(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT COALESCE(c.source, 'unknown') AS source, COUNT(*) AS count
  FROM contacts c
  WHERE c.created_at >= NOW() - INTERVAL '30 days'
  GROUP BY c.source
  ORDER BY count DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_activation_funnel()
RETURNS TABLE(wk timestamp with time zone, signups bigint, activated bigint, activation_rate_pct numeric)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_owner_workspace_access(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  WITH s AS (
    SELECT user_id, DATE_TRUNC('week', occurred_at) AS wk
    FROM events WHERE event = 'signup'
  ),
  f AS (
    SELECT user_id, MIN(occurred_at) AS first_upload_at
    FROM events WHERE event = 'first_upload'
    GROUP BY user_id
  )
  SELECT
    s.wk,
    COUNT(*) AS signups,
    COUNT(f.user_id) AS activated,
    ROUND(100.0 * COUNT(f.user_id) / NULLIF(COUNT(*), 0), 1) AS activation_rate_pct
  FROM s
  LEFT JOIN f ON f.user_id = s.user_id
  GROUP BY s.wk
  ORDER BY s.wk DESC
  LIMIT 12;
END;
$$;

-- Also harden revenue metrics with same admin gate
CREATE OR REPLACE FUNCTION public.get_revenue_metrics()
RETURNS TABLE(metric_name text, metric_value numeric, metric_period text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_mrr numeric;
  active_subs bigint;
  churned_30d bigint;
  new_subs_30d bigint;
  total_revenue_30d numeric;
BEGIN
  IF NOT public.has_owner_workspace_access(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied' USING ERRCODE = '42501';
  END IF;

  SELECT COALESCE(SUM(
    CASE WHEN pe.event_type = 'invoice.paid' THEN pe.amount ELSE 0 END
  ) / 100, 0)
  INTO total_mrr
  FROM payment_events pe
  WHERE pe.created_at > now() - interval '30 days'
    AND pe.event_type = 'invoice.paid';

  SELECT COUNT(*) INTO active_subs FROM subscribers WHERE subscribed = true;

  SELECT COUNT(*) INTO churned_30d
  FROM payment_events
  WHERE event_type = 'customer.subscription.deleted'
    AND created_at > now() - interval '30 days';

  SELECT COUNT(*) INTO new_subs_30d
  FROM payment_events
  WHERE event_type = 'customer.subscription.created'
    AND created_at > now() - interval '30 days';

  SELECT COALESCE(SUM(amount) / 100, 0) INTO total_revenue_30d
  FROM payment_events
  WHERE event_type IN ('invoice.paid', 'charge.succeeded')
    AND created_at > now() - interval '30 days';

  RETURN QUERY
  SELECT 'mrr'::text, total_mrr, 'monthly'::text
  UNION ALL SELECT 'active_subscriptions'::text, active_subs::numeric, 'current'::text
  UNION ALL SELECT 'churned_30d'::text, churned_30d::numeric, '30_days'::text
  UNION ALL SELECT 'new_subscriptions_30d'::text, new_subs_30d::numeric, '30_days'::text
  UNION ALL SELECT 'revenue_30d'::text, total_revenue_30d, '30_days'::text
  UNION ALL SELECT 'churn_rate'::text,
    CASE WHEN active_subs > 0 THEN ROUND((churned_30d::numeric / active_subs::numeric) * 100, 2) ELSE 0 END,
    '30_days'::text;
END;
$$;

-- 2) Fix contributor INSERT policies to scope role check to specific account
DROP POLICY IF EXISTS "Users can create their own items" ON public.items;
CREATE POLICY "Users can create their own items"
ON public.items
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  OR public.has_contributor_access(auth.uid(), user_id, 'contributor'::contributor_role)
);

DROP POLICY IF EXISTS "Users can create their own properties" ON public.properties;
CREATE POLICY "Users can create their own properties"
ON public.properties
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  OR public.has_contributor_access(auth.uid(), user_id, 'contributor'::contributor_role)
);

DROP POLICY IF EXISTS "Contributors can insert shared events" ON public.calendar_events;
CREATE POLICY "Contributors can insert shared events"
ON public.calendar_events
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  OR (
    public.has_contributor_access(auth.uid(), user_id, 'contributor'::contributor_role)
    AND visibility = 'shared'
  )
);

-- 3) Replace bypassable current_setting('role') checks with auth.role()
DROP POLICY IF EXISTS "Only service role can manage rate limits" ON public.rate_limits;
CREATE POLICY "Only service role can manage rate limits"
ON public.rate_limits
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role manages claim attempts" ON public.gift_claim_attempts;
CREATE POLICY "Service role manages claim attempts"
ON public.gift_claim_attempts
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');
