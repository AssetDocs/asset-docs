REVOKE ALL ON FUNCTION public.seed_legacy_locker_legacy_admin() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.enforce_legacy_admin_eligibility() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.revoke_legacy_admin_recovery_artifacts(uuid, uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.validate_legacy_locker_delegate() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.recovery_requests_update_guard() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.assign_legacy_admin(uuid, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.clear_legacy_admin(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_eligible_legacy_admin(uuid, uuid) FROM anon;