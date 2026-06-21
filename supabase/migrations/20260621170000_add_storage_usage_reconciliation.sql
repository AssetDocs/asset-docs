CREATE TABLE IF NOT EXISTS public.storage_usage_reconciliation_state (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  last_reconciled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_drift_bytes BIGINT NOT NULL DEFAULT 0,
  last_drift_ratio NUMERIC NOT NULL DEFAULT 0,
  last_corrected BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.storage_usage_reconciliation_state ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Dev workspace can view storage usage reconciliation state"
  ON public.storage_usage_reconciliation_state;
CREATE POLICY "Dev workspace can view storage usage reconciliation state"
  ON public.storage_usage_reconciliation_state
  FOR SELECT
  TO authenticated
  USING (public.has_dev_workspace_access(auth.uid()));

DROP TRIGGER IF EXISTS update_storage_usage_reconciliation_state_updated_at
  ON public.storage_usage_reconciliation_state;
CREATE TRIGGER update_storage_usage_reconciliation_state_updated_at
  BEFORE UPDATE ON public.storage_usage_reconciliation_state
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

GRANT SELECT ON public.storage_usage_reconciliation_state TO authenticated;
GRANT ALL ON public.storage_usage_reconciliation_state TO service_role;

CREATE OR REPLACE FUNCTION public.reconcile_storage_usage_drift(
  p_limit INTEGER DEFAULT 100,
  p_min_absolute_bytes BIGINT DEFAULT 52428800,
  p_min_relative_ratio NUMERIC DEFAULT 0.05
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user RECORD;
  v_before_bytes BIGINT;
  v_after_bytes BIGINT;
  v_before_files BIGINT;
  v_after_files BIGINT;
  v_delta_bytes BIGINT;
  v_relative_ratio NUMERIC;
  v_checked INTEGER := 0;
  v_corrected INTEGER := 0;
  v_total_delta_bytes BIGINT := 0;
  v_drift_events JSONB := '[]'::JSONB;
BEGIN
  FOR v_user IN
    WITH usage_rollup AS (
      SELECT
        user_id,
        SUM(total_size_bytes)::BIGINT AS current_bytes,
        SUM(file_count)::BIGINT AS current_files,
        MIN(last_calculated_at) AS oldest_calculated_at
      FROM public.storage_usage
      GROUP BY user_id
    )
    SELECT
      p.user_id,
      COALESCE(u.current_bytes, 0)::BIGINT AS current_bytes,
      COALESCE(u.current_files, 0)::BIGINT AS current_files,
      LEAST(
        COALESCE(u.oldest_calculated_at, 'infinity'::TIMESTAMPTZ),
        COALESCE(s.last_reconciled_at, 'infinity'::TIMESTAMPTZ)
      ) AS last_checked_at
    FROM public.profiles p
    LEFT JOIN usage_rollup u ON u.user_id = p.user_id
    LEFT JOIN public.storage_usage_reconciliation_state s ON s.user_id = p.user_id
    WHERE COALESCE(p.account_status, 'active') <> 'deleted'
    ORDER BY last_checked_at ASC NULLS FIRST, p.user_id
    LIMIT LEAST(GREATEST(COALESCE(p_limit, 100), 1), 1000)
  LOOP
    v_checked := v_checked + 1;
    v_before_bytes := v_user.current_bytes;
    v_before_files := v_user.current_files;

    SELECT
      COALESCE(SUM(total_size_bytes), 0)::BIGINT,
      COALESCE(SUM(file_count), 0)::BIGINT
    INTO v_after_bytes, v_after_files
    FROM public.calculate_user_storage_usage(v_user.user_id);

    v_delta_bytes := v_after_bytes - v_before_bytes;
    v_relative_ratio := CASE
      WHEN GREATEST(v_before_bytes, v_after_bytes) = 0 THEN 0
      ELSE abs(v_delta_bytes)::NUMERIC / GREATEST(v_before_bytes, v_after_bytes)::NUMERIC
    END;

    PERFORM public.update_user_storage_usage(v_user.user_id);

    IF abs(v_delta_bytes) >= p_min_absolute_bytes
       OR v_relative_ratio >= p_min_relative_ratio THEN
      v_corrected := v_corrected + 1;
      v_total_delta_bytes := v_total_delta_bytes + v_delta_bytes;

      v_drift_events := v_drift_events || jsonb_build_array(jsonb_build_object(
        'user_id', v_user.user_id,
        'before_bytes', v_before_bytes,
        'after_bytes', v_after_bytes,
        'delta_bytes', v_delta_bytes,
        'before_files', v_before_files,
        'after_files', v_after_files,
        'relative_ratio', v_relative_ratio
      ));

      INSERT INTO public.audit_logs (
        user_id,
        action,
        table_name,
        old_values,
        new_values
      )
      VALUES (
        v_user.user_id,
        'storage_usage_drift_corrected',
        'storage_usage',
        jsonb_build_object(
          'total_size_bytes', v_before_bytes,
          'file_count', v_before_files
        ),
        jsonb_build_object(
          'total_size_bytes', v_after_bytes,
          'file_count', v_after_files,
          'delta_bytes', v_delta_bytes,
          'relative_ratio', v_relative_ratio
        )
      );
    END IF;

    INSERT INTO public.storage_usage_reconciliation_state (
      user_id,
      last_reconciled_at,
      last_drift_bytes,
      last_drift_ratio,
      last_corrected
    )
    VALUES (
      v_user.user_id,
      now(),
      v_delta_bytes,
      v_relative_ratio,
      abs(v_delta_bytes) >= p_min_absolute_bytes OR v_relative_ratio >= p_min_relative_ratio
    )
    ON CONFLICT (user_id) DO UPDATE
    SET
      last_reconciled_at = EXCLUDED.last_reconciled_at,
      last_drift_bytes = EXCLUDED.last_drift_bytes,
      last_drift_ratio = EXCLUDED.last_drift_ratio,
      last_corrected = EXCLUDED.last_corrected,
      updated_at = now();
  END LOOP;

  RETURN jsonb_build_object(
    'checked', v_checked,
    'corrected', v_corrected,
    'total_delta_bytes', v_total_delta_bytes,
    'drift_events', v_drift_events
  );
END;
$$;

REVOKE ALL ON FUNCTION public.reconcile_storage_usage_drift(INTEGER, BIGINT, NUMERIC)
  FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reconcile_storage_usage_drift(INTEGER, BIGINT, NUMERIC)
  TO service_role;

INSERT INTO public.cron_job_health (
  job_name,
  description,
  expected_interval_minutes,
  warn_after_minutes,
  page_after_minutes
) VALUES (
  'process-storage-usage-drift',
  'Recomputes storage_usage rollups and records material drift corrections',
  60,
  120,
  180
)
ON CONFLICT (job_name) DO UPDATE
SET
  description = EXCLUDED.description,
  expected_interval_minutes = EXCLUDED.expected_interval_minutes,
  warn_after_minutes = EXCLUDED.warn_after_minutes,
  page_after_minutes = EXCLUDED.page_after_minutes,
  updated_at = now();
