-- ============================================================
-- 1. Close the three updated_at gaps
-- ============================================================
ALTER TABLE public.property_files ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.legacy_locker_files ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.account_memberships ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

UPDATE public.property_files SET updated_at = created_at WHERE updated_at > created_at;
UPDATE public.legacy_locker_files SET updated_at = created_at WHERE updated_at > created_at;
UPDATE public.account_memberships SET updated_at = created_at WHERE updated_at > created_at;

DROP TRIGGER IF EXISTS update_property_files_updated_at ON public.property_files;
CREATE TRIGGER update_property_files_updated_at
  BEFORE UPDATE ON public.property_files
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_legacy_locker_files_updated_at ON public.legacy_locker_files;
CREATE TRIGGER update_legacy_locker_files_updated_at
  BEFORE UPDATE ON public.legacy_locker_files
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_account_memberships_updated_at ON public.account_memberships;
CREATE TRIGGER update_account_memberships_updated_at
  BEFORE UPDATE ON public.account_memberships
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- 2. Enums
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'audit_actor_type') THEN
    CREATE TYPE public.audit_actor_type AS ENUM ('owner','authorized_user','admin','service_role','system','cron');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'audit_event_source') THEN
    CREATE TYPE public.audit_event_source AS ENUM ('browser','edge_function','service_role','database_trigger','admin','system');
  END IF;
END $$;

-- ============================================================
-- 3. Allow-list field policy (default deny)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.content_audit_field_policy (
  table_name text PRIMARY KEY,
  label_columns text[] NOT NULL DEFAULT '{}',
  metadata_columns text[] NOT NULL DEFAULT '{}',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.content_audit_field_policy TO authenticated;
GRANT ALL ON public.content_audit_field_policy TO service_role;
ALTER TABLE public.content_audit_field_policy ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read audit field policy" ON public.content_audit_field_policy;
CREATE POLICY "Admins can read audit field policy"
  ON public.content_audit_field_policy FOR SELECT TO authenticated
  USING (public.has_dev_workspace_access(auth.uid()) OR public.has_app_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS update_content_audit_field_policy_updated_at ON public.content_audit_field_policy;
CREATE TRIGGER update_content_audit_field_policy_updated_at
  BEFORE UPDATE ON public.content_audit_field_policy
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- 4. Content audit events table (append-only)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.content_audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid,
  owner_user_id uuid,
  actor_user_id uuid,
  actor_type public.audit_actor_type NOT NULL DEFAULT 'system',
  event_source public.audit_event_source NOT NULL DEFAULT 'database_trigger',
  table_name text NOT NULL,
  record_id uuid,
  operation text NOT NULL CHECK (operation IN ('INSERT','UPDATE','DELETE')),
  changed_fields text[] NOT NULL DEFAULT '{}',
  record_label text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  request_id uuid,
  occurred_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_content_audit_events_account_time
  ON public.content_audit_events (account_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_audit_events_actor_time
  ON public.content_audit_events (actor_user_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_audit_events_record
  ON public.content_audit_events (table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_content_audit_events_request
  ON public.content_audit_events (request_id);
CREATE INDEX IF NOT EXISTS idx_content_audit_events_occurred_at
  ON public.content_audit_events (occurred_at DESC);

-- Read-only for app roles; no INSERT/UPDATE/DELETE grants to authenticated.
GRANT SELECT ON public.content_audit_events TO authenticated;
GRANT ALL ON public.content_audit_events TO service_role;
ALTER TABLE public.content_audit_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read content audit events" ON public.content_audit_events;
CREATE POLICY "Admins can read content audit events"
  ON public.content_audit_events FOR SELECT TO authenticated
  USING (public.has_dev_workspace_access(auth.uid()) OR public.has_app_role(auth.uid(), 'admin'));

-- Immutability guard: only trusted internal writers may mutate/remove evidence.
CREATE OR REPLACE FUNCTION public.guard_content_audit_immutability()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_role text;
BEGIN
  BEGIN
    v_role := auth.jwt() ->> 'role';
  EXCEPTION WHEN OTHERS THEN
    v_role := NULL;
  END;

  IF public.is_trusted_db_writer() OR v_role = 'service_role' THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  RAISE EXCEPTION 'content_audit_events is append-only';
END;
$$;

DROP TRIGGER IF EXISTS guard_content_audit_events_immutable ON public.content_audit_events;
CREATE TRIGGER guard_content_audit_events_immutable
  BEFORE UPDATE OR DELETE ON public.content_audit_events
  FOR EACH ROW EXECUTE FUNCTION public.guard_content_audit_immutability();

-- ============================================================
-- 5. Correlation id: stable per transaction, header override allowed
-- ============================================================
CREATE OR REPLACE FUNCTION public.current_audit_request_id()
RETURNS uuid
LANGUAGE plpgsql
STABLE
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_header text;
  v_id uuid;
BEGIN
  BEGIN
    v_header := nullif(current_setting('request.header.x-request-id', true), '');
  EXCEPTION WHEN OTHERS THEN
    v_header := NULL;
  END;

  v_id := public._safe_uuid(v_header);
  IF v_id IS NOT NULL THEN
    RETURN v_id;
  END IF;

  -- Group every row written by the same transaction under one correlation id.
  RETURN md5('txn:' || txid_current()::text)::uuid;
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;
END;
$$;

-- ============================================================
-- 6. Generic content audit trigger
-- ============================================================
CREATE OR REPLACE FUNCTION public.content_audit_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_old jsonb;
  v_new jsonb;
  v_row jsonb;
  v_account_id uuid;
  v_owner_user_id uuid;
  v_actor uuid;
  v_actor_type public.audit_actor_type;
  v_source public.audit_event_source;
  v_jwt jsonb;
  v_jwt_role text;
  v_changed text[] := '{}';
  v_key text;
  v_policy record;
  v_label text;
  v_metadata jsonb := '{}'::jsonb;
  v_col text;
  v_val text;
BEGIN
  IF TG_OP <> 'INSERT' THEN v_old := to_jsonb(OLD); END IF;
  IF TG_OP <> 'DELETE' THEN v_new := to_jsonb(NEW); END IF;
  -- Cascade-safe: OLD is still available here, so account scope resolves on delete.
  v_row := COALESCE(v_new, v_old);

  -- ---------- account scope ----------
  IF v_row ? 'account_id' THEN
    v_account_id := public._safe_uuid(v_row ->> 'account_id');
  END IF;
  IF v_row ? 'user_id' THEN
    v_owner_user_id := public._safe_uuid(v_row ->> 'user_id');
  END IF;
  IF v_account_id IS NULL AND v_owner_user_id IS NOT NULL THEN
    BEGIN
      v_account_id := public.get_user_account_id(v_owner_user_id);
    EXCEPTION WHEN OTHERS THEN
      v_account_id := NULL;
    END;
  END IF;

  -- ---------- actor + source ----------
  BEGIN
    v_actor := auth.uid();
  EXCEPTION WHEN OTHERS THEN
    v_actor := NULL;
  END;
  BEGIN
    v_jwt := auth.jwt();
  EXCEPTION WHEN OTHERS THEN
    v_jwt := NULL;
  END;
  v_jwt_role := v_jwt ->> 'role';

  IF v_actor IS NOT NULL THEN
    v_source := 'browser';
    BEGIN
      IF v_account_id IS NOT NULL AND public.is_account_owner(v_actor, v_account_id) THEN
        v_actor_type := 'owner';
      ELSIF v_account_id IS NOT NULL AND public.is_account_member(v_actor, v_account_id) THEN
        v_actor_type := 'authorized_user';
      ELSIF public.has_app_role(v_actor, 'admin') THEN
        v_actor_type := 'admin';
        v_source := 'admin';
      ELSIF v_owner_user_id IS NOT NULL AND v_owner_user_id = v_actor THEN
        v_actor_type := 'owner';
      ELSE
        v_actor_type := 'system';
      END IF;
    EXCEPTION WHEN OTHERS THEN
      v_actor_type := 'system';
    END;
  ELSIF v_jwt_role = 'service_role' THEN
    -- Edge functions and admin jobs using the service role carry no auth.uid().
    v_actor_type := 'service_role';
    v_source := 'service_role';
  ELSE
    -- Direct SQL, cron jobs, cascaded database operations.
    v_actor_type := 'system';
    v_source := 'database_trigger';
  END IF;

  -- ---------- changed fields (names only, no values) ----------
  IF TG_OP = 'UPDATE' THEN
    FOR v_key IN SELECT jsonb_object_keys(v_new) LOOP
      IF v_key NOT IN ('updated_at', 'created_at')
         AND (v_old -> v_key) IS DISTINCT FROM (v_new -> v_key) THEN
        v_changed := array_append(v_changed, v_key);
      END IF;
    END LOOP;

    -- Nothing meaningful changed (e.g. touch-only write): skip the noise.
    IF array_length(v_changed, 1) IS NULL THEN
      RETURN COALESCE(NEW, OLD);
    END IF;
  END IF;

  -- ---------- allow-list label + metadata (default: capture nothing) ----------
  SELECT * INTO v_policy
  FROM public.content_audit_field_policy
  WHERE table_name = TG_TABLE_NAME;

  IF v_policy.table_name IS NOT NULL THEN
    FOREACH v_col IN ARRAY v_policy.label_columns LOOP
      IF v_label IS NULL AND v_row ? v_col THEN
        v_val := nullif(btrim(v_row ->> v_col), '');
        IF v_val IS NOT NULL THEN
          v_label := left(v_val, 120);
        END IF;
      END IF;
    END LOOP;

    FOREACH v_col IN ARRAY v_policy.metadata_columns LOOP
      IF v_row ? v_col THEN
        v_metadata := v_metadata || jsonb_build_object(v_col, left(coalesce(v_row ->> v_col, ''), 120));
      END IF;
    END LOOP;
  END IF;

  INSERT INTO public.content_audit_events (
    account_id, owner_user_id, actor_user_id, actor_type, event_source,
    table_name, record_id, operation, changed_fields, record_label, metadata, request_id
  ) VALUES (
    v_account_id, v_owner_user_id, v_actor, v_actor_type, v_source,
    TG_TABLE_NAME, public._safe_uuid(v_row ->> 'id'), TG_OP, v_changed, v_label, v_metadata,
    public.current_audit_request_id()
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- ============================================================
-- 7. Seed the allow-list (labels/metadata only from approved, non-sensitive fields)
-- ============================================================
INSERT INTO public.content_audit_field_policy (table_name, label_columns, metadata_columns, notes) VALUES
  ('properties',                  ARRAY['name','address'],           ARRAY[]::text[], 'Property identity is safe to label.'),
  ('property_files',              ARRAY['file_name'],                ARRAY['property_id'], NULL),
  ('items',                       ARRAY['name'],                     ARRAY['category','property_id'], NULL),
  ('user_documents',              ARRAY['document_name','file_name'],ARRAY['category','property_id'], 'File name only; never contents.'),
  ('photo_folders',               ARRAY['folder_name'],              ARRAY[]::text[], NULL),
  ('video_folders',               ARRAY['folder_name'],              ARRAY[]::text[], NULL),
  ('document_folders',            ARRAY['folder_name'],              ARRAY[]::text[], NULL),
  ('memory_safe_folders',         ARRAY['folder_name'],              ARRAY[]::text[], NULL),
  ('memory_safe_items',           ARRAY['title','file_name'],        ARRAY[]::text[], NULL),
  ('notes_tradition_folders',     ARRAY['folder_name'],              ARRAY[]::text[], NULL),
  ('notes_traditions',            ARRAY['title'],                    ARRAY['record_type'], 'Title only; note body is excluded.'),
  ('user_notes',                  ARRAY['title'],                    ARRAY[]::text[], 'Title only; note body is excluded.'),
  ('family_recipes',              ARRAY['recipe_name'],              ARRAY[]::text[], NULL),
  ('family_important_locations',  ARRAY['item_name'],                ARRAY['category'], NULL),
  ('legacy_locker_folders',       ARRAY['folder_name'],              ARRAY[]::text[], NULL),
  ('legacy_locker_files',         ARRAY['file_name'],                ARRAY[]::text[], NULL),
  ('legacy_locker_voice_notes',   ARRAY['title'],                    ARRAY[]::text[], NULL),
  ('voice_note_attachments',      ARRAY['file_name'],                ARRAY[]::text[], NULL),
  ('vip_contacts',                ARRAY['name'],                     ARRAY[]::text[], NULL),
  ('vip_contact_attachments',     ARRAY['file_name'],                ARRAY[]::text[], NULL),
  ('calendar_events',             ARRAY['title'],                    ARRAY['category'], NULL),
  ('damage_reports',              ARRAY[]::text[],                   ARRAY['property_id'], 'No label; report content may be sensitive.'),
  ('manual_damage_entries',       ARRAY['name'],                     ARRAY['property_id'], NULL),
  ('upgrade_repairs',             ARRAY['title'],                    ARRAY['property_id'], NULL),
  ('service_providers',           ARRAY['service_type'],             ARRAY['property_id'], NULL),
  ('paint_codes',                 ARRAY[]::text[],                   ARRAY['property_id'], NULL),
  ('receipts',                    ARRAY[]::text[],                   ARRAY[]::text[], 'Field names only.'),
  ('tax_returns',                 ARRAY[]::text[],                   ARRAY[]::text[], 'Sensitive: no label or metadata.'),
  ('emergency_instructions',      ARRAY[]::text[],                   ARRAY[]::text[], 'Sensitive: no label or metadata.'),
  ('password_catalog',            ARRAY[]::text[],                   ARRAY[]::text[], 'Sensitive: field names only.'),
  ('financial_accounts',          ARRAY[]::text[],                   ARRAY[]::text[], 'Sensitive: field names only.'),
  ('financial_loans',             ARRAY[]::text[],                   ARRAY[]::text[], 'Sensitive: field names only.'),
  ('insurance_policies',          ARRAY[]::text[],                   ARRAY[]::text[], 'Sensitive: field names only.'),
  ('trust_information',           ARRAY[]::text[],                   ARRAY[]::text[], 'Sensitive: field names only.'),
  ('family_medications',          ARRAY[]::text[],                   ARRAY[]::text[], 'Health data: field names only.'),
  ('legacy_locker',               ARRAY[]::text[],                   ARRAY[]::text[], 'Sensitive: field names only.'),
  ('account_memberships',         ARRAY[]::text[],                   ARRAY['role','status'], NULL),
  ('contributors',                ARRAY[]::text[],                   ARRAY['role','status'], NULL)
ON CONFLICT (table_name) DO UPDATE
  SET label_columns = EXCLUDED.label_columns,
      metadata_columns = EXCLUDED.metadata_columns,
      notes = EXCLUDED.notes,
      updated_at = now();

-- ============================================================
-- 8. Attach the audit trigger to user-content tables
-- ============================================================
DO $$
DECLARE
  t text;
  audited text[] := ARRAY[
    'properties','property_files','items','user_documents',
    'photo_folders','video_folders','document_folders',
    'memory_safe_folders','memory_safe_items',
    'notes_tradition_folders','notes_traditions','user_notes',
    'family_recipes','family_medications','family_important_locations',
    'legacy_locker','legacy_locker_folders','legacy_locker_files','legacy_locker_voice_notes',
    'voice_note_attachments','password_catalog',
    'financial_accounts','financial_loans','insurance_policies','trust_information',
    'vip_contacts','vip_contact_attachments','calendar_events',
    'damage_reports','manual_damage_entries','upgrade_repairs',
    'emergency_instructions','tax_returns','receipts',
    'service_providers','paint_codes','account_memberships','contributors'
  ];
BEGIN
  FOREACH t IN ARRAY audited LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = t AND table_type = 'BASE TABLE'
    ) THEN
      EXECUTE format('DROP TRIGGER IF EXISTS content_audit_%1$s ON public.%1$I', t);
      EXECUTE format(
        'CREATE TRIGGER content_audit_%1$s AFTER INSERT OR UPDATE OR DELETE ON public.%1$I
           FOR EACH ROW EXECUTE FUNCTION public.content_audit_trigger()', t);
    END IF;
  END LOOP;
END $$;