
-- Delete all public table data for user b601fc36-c1c3-4eb9-85c8-b346fa3f9269 (vinhphucnguyen1214@gmail.com)
DO $$
DECLARE
  uid UUID := 'b601fc36-c1c3-4eb9-85c8-b346fa3f9269';
BEGIN
  DELETE FROM public.voice_note_attachments WHERE user_id = uid;
  DELETE FROM public.receipts WHERE user_id = uid;
  DELETE FROM public.legacy_locker_voice_notes WHERE user_id = uid;
  DELETE FROM public.legacy_locker_files WHERE user_id = uid;
  DELETE FROM public.legacy_locker_folders WHERE user_id = uid;
  DELETE FROM public.legacy_locker WHERE user_id = uid;
  DELETE FROM public.property_files WHERE user_id = uid;
  DELETE FROM public.items WHERE user_id = uid;
  DELETE FROM public.properties WHERE user_id = uid;
  DELETE FROM public.damage_reports WHERE user_id = uid;
  DELETE FROM public.insurance_policies WHERE user_id = uid;
  DELETE FROM public.notification_preferences WHERE user_id = uid;
  DELETE FROM public.payment_events WHERE user_id = uid;
  DELETE FROM public.events WHERE user_id = uid;
  DELETE FROM public.user_roles WHERE user_id = uid;
  DELETE FROM public.audit_logs WHERE user_id = uid;
  DELETE FROM public.paint_codes WHERE user_id = uid;
  DELETE FROM public.financial_accounts WHERE user_id = uid;
  DELETE FROM public.source_websites WHERE user_id = uid;
  DELETE FROM public.document_folders WHERE user_id = uid;
  DELETE FROM public.video_folders WHERE user_id = uid;
  DELETE FROM public.photo_folders WHERE user_id = uid;
  DELETE FROM public.trust_information WHERE user_id = uid;
  DELETE FROM public.password_catalog WHERE user_id = uid;
  DELETE FROM public.storage_usage WHERE user_id = uid;
  DELETE FROM public.calendar_events WHERE user_id = uid;
  DELETE FROM public.family_recipes WHERE user_id = uid;
  DELETE FROM public.financial_loans WHERE user_id = uid;
  DELETE FROM public.financial_loan_folders WHERE user_id = uid;
  DELETE FROM public.emergency_instructions WHERE user_id = uid;
  DELETE FROM public.account_verification WHERE user_id = uid;
  DELETE FROM public.recovery_requests WHERE owner_user_id = uid OR delegate_user_id = uid;
  DELETE FROM public.gift_subscriptions WHERE purchaser_user_id = uid OR recipient_user_id = uid OR redeemed_by_user_id = uid;
  DELETE FROM public.contributors WHERE contributor_user_id = uid OR account_owner_id = uid;
  DELETE FROM public.account_deletion_requests WHERE requester_user_id = uid OR account_owner_id = uid;
  DELETE FROM public.contacts WHERE user_id = uid;
  DELETE FROM public.subscribers WHERE user_id = uid;
  DELETE FROM public.entitlements WHERE user_id = uid;
  DELETE FROM public.profiles WHERE user_id = uid;
  INSERT INTO public.deleted_accounts (email, original_user_id, deleted_by)
  VALUES ('vinhphucnguyen1214@gmail.com', uid, 'admin')
  ON CONFLICT (email) DO UPDATE SET deleted_at = now(), deleted_by = 'admin';
END $$;
