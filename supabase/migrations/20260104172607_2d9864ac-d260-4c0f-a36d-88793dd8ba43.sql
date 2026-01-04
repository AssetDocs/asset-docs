-- Function to get user engagement statistics
CREATE OR REPLACE FUNCTION get_user_engagement_stats()
RETURNS TABLE (
  user_id uuid,
  property_count bigint,
  item_count bigint,
  document_count bigint,
  photo_count bigint,
  receipt_count bigint,
  total_item_value numeric,
  total_property_value numeric,
  engagement_score integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.user_id,
    COALESCE((SELECT COUNT(*) FROM properties WHERE properties.user_id = p.user_id), 0) as property_count,
    COALESCE((SELECT COUNT(*) FROM items WHERE items.user_id = p.user_id), 0) as item_count,
    COALESCE((SELECT COUNT(*) FROM user_documents WHERE user_documents.user_id = p.user_id), 0) as document_count,
    COALESCE((SELECT COUNT(*) FROM property_files WHERE property_files.user_id = p.user_id AND property_files.file_type LIKE 'image/%'), 0) as photo_count,
    COALESCE((SELECT COUNT(*) FROM receipts WHERE receipts.user_id = p.user_id), 0) as receipt_count,
    COALESCE((SELECT SUM(estimated_value) FROM items WHERE items.user_id = p.user_id), 0) as total_item_value,
    COALESCE((SELECT SUM(estimated_value) FROM properties WHERE properties.user_id = p.user_id), 0) as total_property_value,
    -- Engagement score: weighted sum (max 100)
    LEAST(100, (
      COALESCE((SELECT COUNT(*) FROM properties WHERE properties.user_id = p.user_id), 0) * 10 +
      COALESCE((SELECT COUNT(*) FROM items WHERE items.user_id = p.user_id), 0) * 2 +
      COALESCE((SELECT COUNT(*) FROM user_documents WHERE user_documents.user_id = p.user_id), 0) * 3 +
      COALESCE((SELECT COUNT(*) FROM property_files WHERE property_files.user_id = p.user_id), 0) * 1 +
      COALESCE((SELECT COUNT(*) FROM receipts WHERE receipts.user_id = p.user_id), 0) * 2
    ))::integer as engagement_score
  FROM profiles p;
END;
$$;

-- Function to get storage statistics per user
CREATE OR REPLACE FUNCTION get_storage_stats()
RETURNS TABLE (
  user_id uuid,
  storage_quota_gb integer,
  total_used_bytes bigint,
  file_count bigint,
  usage_percentage numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.user_id,
    COALESCE(p.storage_quota_gb, 5) as storage_quota_gb,
    COALESCE(su.total_size, 0)::bigint as total_used_bytes,
    COALESCE(su.file_count, 0)::bigint as file_count,
    CASE 
      WHEN COALESCE(p.storage_quota_gb, 5) > 0 
      THEN ROUND((COALESCE(su.total_size, 0)::numeric / (COALESCE(p.storage_quota_gb, 5)::numeric * 1073741824)) * 100, 2)
      ELSE 0
    END as usage_percentage
  FROM profiles p
  LEFT JOIN (
    SELECT 
      storage_usage.user_id,
      SUM(total_size_bytes) as total_size,
      SUM(file_count) as file_count
    FROM storage_usage
    GROUP BY storage_usage.user_id
  ) su ON p.user_id = su.user_id;
END;
$$;

-- Function to get trial users approaching expiration
CREATE OR REPLACE FUNCTION get_trial_management_data()
RETURNS TABLE (
  user_id uuid,
  email text,
  trial_end timestamp with time zone,
  days_remaining integer,
  trial_reminder_sent boolean,
  plan_status text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.user_id,
    s.email,
    s.trial_end,
    GREATEST(0, EXTRACT(DAY FROM (s.trial_end - now()))::integer) as days_remaining,
    COALESCE(s.trial_reminder_sent, false) as trial_reminder_sent,
    COALESCE(p.plan_status, 'inactive') as plan_status
  FROM subscribers s
  LEFT JOIN profiles p ON s.user_id = p.user_id
  WHERE s.trial_end IS NOT NULL
    AND s.trial_end > now() - interval '30 days'
  ORDER BY s.trial_end ASC;
END;
$$;

-- Function to get revenue metrics
CREATE OR REPLACE FUNCTION get_revenue_metrics()
RETURNS TABLE (
  metric_name text,
  metric_value numeric,
  metric_period text
)
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
  -- Calculate MRR from active subscriptions
  SELECT COALESCE(SUM(
    CASE 
      WHEN pe.event_type = 'invoice.paid' THEN pe.amount
      ELSE 0
    END
  ) / 100, 0)
  INTO total_mrr
  FROM payment_events pe
  WHERE pe.created_at > now() - interval '30 days'
    AND pe.event_type = 'invoice.paid';

  -- Active subscriptions
  SELECT COUNT(*)
  INTO active_subs
  FROM subscribers
  WHERE subscribed = true;

  -- Churned in last 30 days
  SELECT COUNT(*)
  INTO churned_30d
  FROM payment_events
  WHERE event_type = 'customer.subscription.deleted'
    AND created_at > now() - interval '30 days';

  -- New subscriptions in last 30 days
  SELECT COUNT(*)
  INTO new_subs_30d
  FROM payment_events
  WHERE event_type = 'customer.subscription.created'
    AND created_at > now() - interval '30 days';

  -- Total revenue last 30 days
  SELECT COALESCE(SUM(amount) / 100, 0)
  INTO total_revenue_30d
  FROM payment_events
  WHERE event_type IN ('invoice.paid', 'charge.succeeded')
    AND created_at > now() - interval '30 days';

  RETURN QUERY
  SELECT 'mrr'::text, total_mrr, 'monthly'::text
  UNION ALL
  SELECT 'active_subscriptions'::text, active_subs::numeric, 'current'::text
  UNION ALL
  SELECT 'churned_30d'::text, churned_30d::numeric, '30_days'::text
  UNION ALL
  SELECT 'new_subscriptions_30d'::text, new_subs_30d::numeric, '30_days'::text
  UNION ALL
  SELECT 'revenue_30d'::text, total_revenue_30d, '30_days'::text
  UNION ALL
  SELECT 'churn_rate'::text, 
    CASE WHEN active_subs > 0 THEN ROUND((churned_30d::numeric / active_subs::numeric) * 100, 2) ELSE 0 END,
    '30_days'::text;
END;
$$;

-- Function to get feature adoption stats
CREATE OR REPLACE FUNCTION get_feature_adoption()
RETURNS TABLE (
  feature_name text,
  users_with_feature bigint,
  total_users bigint,
  adoption_percentage numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total bigint;
BEGIN
  SELECT COUNT(*) INTO total FROM profiles;
  
  RETURN QUERY
  -- Legacy Locker adoption
  SELECT 
    'Legacy Locker'::text,
    (SELECT COUNT(DISTINCT user_id) FROM legacy_locker),
    total,
    CASE WHEN total > 0 THEN ROUND(((SELECT COUNT(DISTINCT user_id) FROM legacy_locker)::numeric / total::numeric) * 100, 1) ELSE 0 END
  UNION ALL
  -- Password Catalog adoption
  SELECT 
    'Password Catalog'::text,
    (SELECT COUNT(DISTINCT user_id) FROM password_catalog),
    total,
    CASE WHEN total > 0 THEN ROUND(((SELECT COUNT(DISTINCT user_id) FROM password_catalog)::numeric / total::numeric) * 100, 1) ELSE 0 END
  UNION ALL
  -- Trust Information adoption
  SELECT 
    'Trust Information'::text,
    (SELECT COUNT(DISTINCT user_id) FROM trust_information),
    total,
    CASE WHEN total > 0 THEN ROUND(((SELECT COUNT(DISTINCT user_id) FROM trust_information)::numeric / total::numeric) * 100, 1) ELSE 0 END
  UNION ALL
  -- Insurance Policies adoption
  SELECT 
    'Insurance Policies'::text,
    (SELECT COUNT(DISTINCT user_id) FROM insurance_policies),
    total,
    CASE WHEN total > 0 THEN ROUND(((SELECT COUNT(DISTINCT user_id) FROM insurance_policies)::numeric / total::numeric) * 100, 1) ELSE 0 END
  UNION ALL
  -- Properties documented
  SELECT 
    'Properties'::text,
    (SELECT COUNT(DISTINCT user_id) FROM properties),
    total,
    CASE WHEN total > 0 THEN ROUND(((SELECT COUNT(DISTINCT user_id) FROM properties)::numeric / total::numeric) * 100, 1) ELSE 0 END
  UNION ALL
  -- Items documented
  SELECT 
    'Items Inventory'::text,
    (SELECT COUNT(DISTINCT user_id) FROM items),
    total,
    CASE WHEN total > 0 THEN ROUND(((SELECT COUNT(DISTINCT user_id) FROM items)::numeric / total::numeric) * 100, 1) ELSE 0 END
  UNION ALL
  -- Contributors configured
  SELECT 
    'Contributors'::text,
    (SELECT COUNT(DISTINCT account_owner_id) FROM contributors WHERE status = 'accepted'),
    total,
    CASE WHEN total > 0 THEN ROUND(((SELECT COUNT(DISTINCT account_owner_id) FROM contributors WHERE status = 'accepted')::numeric / total::numeric) * 100, 1) ELSE 0 END;
END;
$$;

-- Function to get recent audit log activity summary
CREATE OR REPLACE FUNCTION get_recent_activity_summary()
RETURNS TABLE (
  user_id uuid,
  action_date date,
  action_count bigint,
  last_action text,
  last_action_time timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    al.user_id,
    DATE(al.created_at) as action_date,
    COUNT(*) as action_count,
    (SELECT action FROM audit_logs WHERE audit_logs.user_id = al.user_id ORDER BY created_at DESC LIMIT 1) as last_action,
    MAX(al.created_at) as last_action_time
  FROM audit_logs al
  WHERE al.created_at > now() - interval '30 days'
    AND al.user_id IS NOT NULL
  GROUP BY al.user_id, DATE(al.created_at)
  ORDER BY action_date DESC, action_count DESC;
END;
$$;