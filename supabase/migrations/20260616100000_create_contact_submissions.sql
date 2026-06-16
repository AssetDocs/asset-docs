-- General public contact form intake. The public form submits through the
-- send-contact-email Edge Function; owner/admin users review submissions here.

CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  telephone text,
  hear_about_us text,
  message text NOT NULL,
  source text NOT NULL DEFAULT 'contact_page',
  status text NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'in_review', 'responded', 'archived')),
  email_status text NOT NULL DEFAULT 'pending'
    CHECK (email_status IN ('pending', 'sent', 'failed')),
  resend_id text,
  email_error text,
  ip_address text,
  user_agent text,
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owner workspace can view contact submissions"
  ON public.contact_submissions;
DROP POLICY IF EXISTS "Owner workspace can update contact submissions"
  ON public.contact_submissions;

CREATE POLICY "Owner workspace can view contact submissions"
  ON public.contact_submissions FOR SELECT
  TO authenticated
  USING (public.has_owner_workspace_access(auth.uid()));

CREATE POLICY "Owner workspace can update contact submissions"
  ON public.contact_submissions FOR UPDATE
  TO authenticated
  USING (public.has_owner_workspace_access(auth.uid()))
  WITH CHECK (public.has_owner_workspace_access(auth.uid()));

DROP TRIGGER IF EXISTS update_contact_submissions_updated_at
  ON public.contact_submissions;

CREATE TRIGGER update_contact_submissions_updated_at
  BEFORE UPDATE ON public.contact_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at
  ON public.contact_submissions (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contact_submissions_status
  ON public.contact_submissions (status, created_at DESC);
