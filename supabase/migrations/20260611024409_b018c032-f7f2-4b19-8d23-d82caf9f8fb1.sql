
-- C5: Asset Values RPC with deterministic 1-based ordinal cursor.
-- Read-only. SECURITY DEFINER. Authorization is membership-based (no row locks).

CREATE OR REPLACE FUNCTION public.get_asset_values_page(
  p_account_id uuid,
  p_limit int DEFAULT 100,
  p_cursor_ordinal bigint DEFAULT 0,
  p_cursor_id text DEFAULT NULL
)
RETURNS TABLE (
  item_ordinal bigint,
  entry_id text,
  entry_name text,
  parent_name text,
  value numeric,
  source text,
  category text,
  entry_date timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller uuid := auth.uid();
  v_owner uuid;
  v_limit int := LEAST(GREATEST(COALESCE(p_limit, 100), 1), 500);
  v_cursor bigint := GREATEST(COALESCE(p_cursor_ordinal, 0), 0);
BEGIN
  IF v_caller IS NULL THEN
    RAISE EXCEPTION 'unauthenticated' USING ERRCODE = '28000';
  END IF;

  -- Authorization preflight (no row locks; read-only RPC)
  SELECT a.owner_user_id INTO v_owner
  FROM public.account_memberships m
  JOIN public.accounts a ON a.id = m.account_id
  LEFT JOIN public.profiles p ON p.user_id = a.owner_user_id
  LEFT JOIN public.deleted_accounts d ON d.original_user_id = a.owner_user_id
  WHERE m.account_id = p_account_id
    AND m.user_id    = v_caller
    AND m.status     = 'active'
    AND m.revoked_at IS NULL
    AND a.owner_state = 'active'
    AND a.memorialized = false
    AND a.account_freeze_status IS NULL
    AND COALESCE(p.account_status, 'active') = 'active'
    AND d.id IS NULL;

  IF v_owner IS NULL THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  WITH unified AS (
    SELECT
      ('prop-' || prop.id::text)                    AS entry_id,
      COALESCE(NULLIF(prop.name, ''), NULLIF(prop.address, ''), 'Unnamed Property') AS entry_name,
      NULL::text                                    AS parent_name,
      prop.estimated_value::numeric                 AS value,
      'property'::text                              AS source,
      'Real Estate'::text                           AS category,
      prop.created_at                               AS entry_date
    FROM public.properties prop
    WHERE prop.user_id = v_owner
      AND COALESCE(prop.estimated_value, 0) > 0

    UNION ALL
    SELECT
      ('item-' || it.id::text),
      COALESCE(it.name, 'Unnamed Item'),
      NULL::text,
      it.estimated_value::numeric,
      'item'::text,
      COALESCE(it.category, 'Other'),
      it.created_at
    FROM public.items it
    WHERE it.user_id = v_owner
      AND COALESCE(it.estimated_value, 0) > 0

    UNION ALL
    SELECT
      ('fv-' || pf.id::text || '-' || (iv.ordinality)::text),
      COALESCE(NULLIF((iv.value->>'name'), ''), 'Unnamed Value'),
      pf.file_name,
      COALESCE(NULLIF(iv.value->>'value','')::numeric, 0),
      'file_value'::text,
      'File Documented Values'::text,
      pf.created_at
    FROM public.property_files pf
    CROSS JOIN LATERAL jsonb_array_elements(
      CASE WHEN jsonb_typeof(pf.item_values) = 'array' THEN pf.item_values ELSE '[]'::jsonb END
    ) WITH ORDINALITY AS iv(value, ordinality)
    WHERE pf.user_id = v_owner
      AND pf.item_values IS NOT NULL
      AND COALESCE(NULLIF(iv.value->>'value','')::numeric, 0) > 0
  ),
  ordered AS (
    SELECT
      row_number() OVER (ORDER BY u.entry_date DESC NULLS LAST, u.entry_id ASC) AS item_ordinal,
      u.*
    FROM unified u
  )
  SELECT
    o.item_ordinal,
    o.entry_id,
    o.entry_name,
    o.parent_name,
    o.value,
    o.source,
    o.category,
    o.entry_date
  FROM ordered o
  WHERE o.item_ordinal > v_cursor
  ORDER BY o.item_ordinal ASC
  LIMIT v_limit;
END;
$$;

REVOKE ALL ON FUNCTION public.get_asset_values_page(uuid, int, bigint, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_asset_values_page(uuid, int, bigint, text) TO authenticated;
