-- =====================================================================
-- Step A1: Profile RPCs, phone-reset trigger, allowlist guard, helpers
-- Purely additive. No REVOKE on existing surface; no constraint changes.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Helper 1: is_trusted_db_writer()
-- Returns true ONLY when:
--   - auth.jwt() indicates no HTTP-bound request, AND
--   - session_user is in the hard-coded trusted list.
-- Any unexpected nonempty JWT role => returns false (untrusted), per v12.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_trusted_db_writer()
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_jwt        jsonb;
  v_role       text;
  v_http_bound boolean;
BEGIN
  -- Schema-qualified per v12 user note.
  BEGIN
    v_jwt := auth.jwt();
  EXCEPTION WHEN OTHERS THEN
    v_jwt := NULL;
  END;

  v_role := v_jwt ->> 'role';

  -- HTTP-bound: nonempty JWT object. Recognized roles AND unrecognized roles
  -- both mean "a request came through PostgREST" and must not be treated as
  -- a direct DB context.
  v_http_bound :=
    v_jwt IS NOT NULL
    AND v_jwt <> 'null'::jsonb
    AND v_jwt <> '{}'::jsonb;

  IF v_http_bound THEN
    RETURN false;
  END IF;

  RETURN session_user IN ('postgres', 'supabase_auth_admin');
END;
$$;

ALTER FUNCTION public.is_trusted_db_writer() OWNER TO postgres;
REVOKE ALL ON FUNCTION public.is_trusted_db_writer()
  FROM PUBLIC, anon, authenticated, service_role, supabase_auth_admin;

-- ---------------------------------------------------------------------
-- Helper 2: assert_columns_in_diff_subset(old, new, allowed)
-- Default-deny diff check. Raises 42501 for any changed key not in allowed.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.assert_columns_in_diff_subset(
  p_old     jsonb,
  p_new     jsonb,
  p_allowed text[]
) RETURNS void
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_key text;
BEGIN
  IF p_old IS NULL OR p_new IS NULL THEN
    RAISE EXCEPTION 'assert_columns_in_diff_subset: NULL row payload'
      USING ERRCODE = '42501';
  END IF;

  FOR v_key IN
    SELECT k
    FROM (
      SELECT jsonb_object_keys(p_old) AS k
      UNION
      SELECT jsonb_object_keys(p_new) AS k
    ) keys
  LOOP
    IF (p_old -> v_key) IS DISTINCT FROM (p_new -> v_key) THEN
      IF NOT (v_key = ANY (p_allowed)) THEN
        RAISE EXCEPTION 'assert_columns_in_diff_subset: column % not in writer allowlist', v_key
          USING ERRCODE = '42501';
      END IF;
    END IF;
  END LOOP;
END;
$$;

ALTER FUNCTION public.assert_columns_in_diff_subset(jsonb, jsonb, text[]) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.assert_columns_in_diff_subset(jsonb, jsonb, text[])
  FROM PUBLIC, anon, authenticated, service_role, supabase_auth_admin;

-- ---------------------------------------------------------------------
-- Trigger function: profiles_phone_reset
-- Fires BEFORE UPDATE OF phone. Resets verification state on phone change.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.profiles_phone_reset()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.phone IS DISTINCT FROM OLD.phone THEN
    NEW.phone_verified := false;
    NEW.phone_verified_at := NULL;
  END IF;
  RETURN NEW;
END;
$$;

ALTER FUNCTION public.profiles_phone_reset() OWNER TO postgres;

-- ---------------------------------------------------------------------
-- Trigger function: profiles_allowlist_guard
-- Fires BEFORE UPDATE. In A1 the guard is permissive for the trusted-DB
-- bucket and for any writer-GUC value we recognize. Existing client UPDATEs
-- pass through unchanged. Step E will (a) REVOKE UPDATE from authenticated
-- and (b) tighten this guard's default-deny default.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.profiles_allowlist_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_writer  text;
  v_old     jsonb;
  v_new     jsonb;
BEGIN
  -- Bucket B/D: direct DB context (no HTTP-bound JWT) with a trusted session_user.
  IF public.is_trusted_db_writer() THEN
    RETURN NEW;
  END IF;

  v_writer := current_setting('assetsafe.profiles_writer', true);
  v_old    := to_jsonb(OLD);
  v_new    := to_jsonb(NEW);

  -- Bucket E: per-writer GUC + per-writer column allowlist.
  IF v_writer = 'update_my_profile' THEN
    PERFORM public.assert_columns_in_diff_subset(
      v_old, v_new,
      ARRAY['first_name','last_name','phone','bio',
            'phone_verified','phone_verified_at','updated_at']
    );
    RETURN NEW;
  ELSIF v_writer = 'update_my_household_income' THEN
    PERFORM public.assert_columns_in_diff_subset(
      v_old, v_new,
      ARRAY['household_income','updated_at']
    );
    RETURN NEW;
  ELSIF v_writer = 'set_my_last_used_account' THEN
    PERFORM public.assert_columns_in_diff_subset(
      v_old, v_new,
      ARRAY['last_used_account_id','updated_at']
    );
    RETURN NEW;
  ELSIF v_writer = 'complete_phone_verification' THEN
    PERFORM public.assert_columns_in_diff_subset(
      v_old, v_new,
      ARRAY['phone_verified','phone_verified_at','updated_at']
    );
    RETURN NEW;
  END IF;

  -- A1 compatibility: legacy direct UPDATEs from authenticated clients
  -- (e.g. ProfileTab, HouseholdIncomeSection, AccountContext) continue to
  -- work because the guard does not yet default-deny. Step E flips this to
  -- RAISE and revokes table-level UPDATE.
  RETURN NEW;
END;
$$;

ALTER FUNCTION public.profiles_allowlist_guard() OWNER TO postgres;

-- ---------------------------------------------------------------------
-- Create triggers BEFORE revoking trigger-function EXECUTE (per v12 note:
-- PostgreSQL checks the executor's permission at CREATE TRIGGER time).
-- Trigger order is pinned alphabetically by name:
--   10_profiles_phone_reset    (BEFORE UPDATE OF phone)
--   20_profiles_allowlist_guard (BEFORE UPDATE)
--   update_profiles_updated_at  (BEFORE UPDATE; existing, fires last)
-- ---------------------------------------------------------------------
DROP TRIGGER IF EXISTS "10_profiles_phone_reset" ON public.profiles;
CREATE TRIGGER "10_profiles_phone_reset"
  BEFORE UPDATE OF phone ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.profiles_phone_reset();

DROP TRIGGER IF EXISTS "20_profiles_allowlist_guard" ON public.profiles;
CREATE TRIGGER "20_profiles_allowlist_guard"
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.profiles_allowlist_guard();

-- Revoke direct EXECUTE on the trigger functions now that triggers exist.
REVOKE ALL ON FUNCTION public.profiles_phone_reset()
  FROM PUBLIC, anon, authenticated, service_role, supabase_auth_admin;
REVOKE ALL ON FUNCTION public.profiles_allowlist_guard()
  FROM PUBLIC, anon, authenticated, service_role, supabase_auth_admin;

-- ---------------------------------------------------------------------
-- RPC: update_my_profile
-- Saves prior writer GUC, sets it transaction-local, restores on success
-- AND on exception. Caller cannot pass a target user id.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_my_profile(
  p_first_name text DEFAULT NULL,
  p_last_name  text DEFAULT NULL,
  p_phone      text DEFAULT NULL,
  p_bio        text DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid   uuid := auth.uid();
  v_prior text;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated' USING ERRCODE = '42501';
  END IF;

  v_prior := current_setting('assetsafe.profiles_writer', true);
  PERFORM set_config('assetsafe.profiles_writer', 'update_my_profile', true);

  BEGIN
    UPDATE public.profiles
       SET first_name = COALESCE(p_first_name, first_name),
           last_name  = COALESCE(p_last_name,  last_name),
           phone      = COALESCE(p_phone,      phone),
           bio        = COALESCE(p_bio,        bio),
           updated_at = now()
     WHERE user_id = v_uid;

    PERFORM set_config('assetsafe.profiles_writer', COALESCE(v_prior, ''), true);
  EXCEPTION WHEN OTHERS THEN
    PERFORM set_config('assetsafe.profiles_writer', COALESCE(v_prior, ''), true);
    RAISE;
  END;
END;
$$;

ALTER FUNCTION public.update_my_profile(text, text, text, text) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.update_my_profile(text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_my_profile(text, text, text, text) TO authenticated;

-- ---------------------------------------------------------------------
-- RPC: update_my_household_income
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_my_household_income(
  p_household_income numeric
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid   uuid := auth.uid();
  v_prior text;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated' USING ERRCODE = '42501';
  END IF;

  v_prior := current_setting('assetsafe.profiles_writer', true);
  PERFORM set_config('assetsafe.profiles_writer', 'update_my_household_income', true);

  BEGIN
    UPDATE public.profiles
       SET household_income = p_household_income,
           updated_at       = now()
     WHERE user_id = v_uid;

    PERFORM set_config('assetsafe.profiles_writer', COALESCE(v_prior, ''), true);
  EXCEPTION WHEN OTHERS THEN
    PERFORM set_config('assetsafe.profiles_writer', COALESCE(v_prior, ''), true);
    RAISE;
  END;
END;
$$;

ALTER FUNCTION public.update_my_household_income(numeric) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.update_my_household_income(numeric) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_my_household_income(numeric) TO authenticated;

-- ---------------------------------------------------------------------
-- RPC: set_my_last_used_account
-- Validates membership before writing.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_my_last_used_account(
  p_account_id uuid
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid   uuid := auth.uid();
  v_prior text;
  v_ok    boolean;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated' USING ERRCODE = '42501';
  END IF;

  IF p_account_id IS NULL THEN
    RAISE EXCEPTION 'p_account_id required' USING ERRCODE = '22023';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.account_memberships m
    WHERE m.user_id = v_uid AND m.account_id = p_account_id
    UNION ALL
    SELECT 1 FROM public.accounts a
    WHERE a.id = p_account_id AND a.owner_user_id = v_uid
  ) INTO v_ok;

  IF NOT v_ok THEN
    RAISE EXCEPTION 'account not accessible to caller' USING ERRCODE = '42501';
  END IF;

  v_prior := current_setting('assetsafe.profiles_writer', true);
  PERFORM set_config('assetsafe.profiles_writer', 'set_my_last_used_account', true);

  BEGIN
    UPDATE public.profiles
       SET last_used_account_id = p_account_id,
           updated_at           = now()
     WHERE user_id = v_uid;

    PERFORM set_config('assetsafe.profiles_writer', COALESCE(v_prior, ''), true);
  EXCEPTION WHEN OTHERS THEN
    PERFORM set_config('assetsafe.profiles_writer', COALESCE(v_prior, ''), true);
    RAISE;
  END;
END;
$$;

ALTER FUNCTION public.set_my_last_used_account(uuid) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.set_my_last_used_account(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_my_last_used_account(uuid) TO authenticated;

-- ---------------------------------------------------------------------
-- RPC: complete_phone_verification
-- Called by the phone-verification edge function (caller is the user).
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.complete_phone_verification()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid   uuid := auth.uid();
  v_prior text;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated' USING ERRCODE = '42501';
  END IF;

  v_prior := current_setting('assetsafe.profiles_writer', true);
  PERFORM set_config('assetsafe.profiles_writer', 'complete_phone_verification', true);

  BEGIN
    UPDATE public.profiles
       SET phone_verified    = true,
           phone_verified_at = now(),
           updated_at        = now()
     WHERE user_id = v_uid;

    PERFORM set_config('assetsafe.profiles_writer', COALESCE(v_prior, ''), true);
  EXCEPTION WHEN OTHERS THEN
    PERFORM set_config('assetsafe.profiles_writer', COALESCE(v_prior, ''), true);
    RAISE;
  END;
END;
$$;

ALTER FUNCTION public.complete_phone_verification() OWNER TO postgres;
REVOKE ALL ON FUNCTION public.complete_phone_verification() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.complete_phone_verification() TO authenticated;