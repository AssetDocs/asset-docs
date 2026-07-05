-- Harden public external account assistance submissions.
-- Bind the request row, uploaded storage object, and document metadata row to
-- a per-submission token. Also remove public audit-log writes and realtime
-- broadcast/presence policies that are not needed for Postgres changes.

ALTER TABLE public.external_account_assistance_requests
  ADD COLUMN IF NOT EXISTS submission_token uuid NOT NULL DEFAULT gen_random_uuid();

ALTER TABLE public.external_assistance_documents
  ADD COLUMN IF NOT EXISTS submission_token uuid;

ALTER TABLE public.external_assistance_audit_logs
  ADD COLUMN IF NOT EXISTS submission_token uuid;

CREATE INDEX IF NOT EXISTS external_account_assistance_requests_submission_token_idx
  ON public.external_account_assistance_requests (submission_token);

DROP POLICY IF EXISTS "Public can attach documents to fresh requests"
  ON public.external_assistance_documents;

CREATE POLICY "Public can attach documents to fresh requests"
  ON public.external_assistance_documents
  FOR INSERT
  TO public
  WITH CHECK (
    submission_token IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.external_account_assistance_requests r
      WHERE r.id = external_assistance_documents.request_id
        AND r.submission_token = external_assistance_documents.submission_token
        AND r.submitted_at > (now() - interval '30 minutes')
    )
  );

DROP POLICY IF EXISTS "Public can append public audit events"
  ON public.external_assistance_audit_logs;

DROP POLICY IF EXISTS "Public can upload assistance docs to submission folder"
  ON storage.objects;
DROP POLICY IF EXISTS "Public can upload assistance docs to recent request folder"
  ON storage.objects;

CREATE POLICY "Public can upload assistance docs to token-bound request folder"
  ON storage.objects
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    bucket_id = 'external-assistance-docs'
    AND (storage.foldername(name))[1] = 'submission'
    AND public._safe_uuid((storage.foldername(name))[2]) IS NOT NULL
    AND public._safe_uuid((storage.foldername(name))[3]) IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.external_account_assistance_requests r
      WHERE r.id = public._safe_uuid((storage.foldername(name))[2])
        AND r.submission_token = public._safe_uuid((storage.foldername(name))[3])
        AND r.submitted_at > (now() - interval '30 minutes')
    )
  );

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'realtime'
      AND c.relname = 'messages'
  ) THEN
    EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can receive realtime messages" ON realtime.messages';
    EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can send realtime messages" ON realtime.messages';
    EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can receive scoped realtime messages" ON realtime.messages';
    EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can send scoped realtime messages" ON realtime.messages';
  END IF;
END $$;
