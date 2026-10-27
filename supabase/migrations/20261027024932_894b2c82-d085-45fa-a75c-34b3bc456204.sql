CREATE TABLE public.preparedness_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  assessment_version text NOT NULL,
  session_id text NOT NULL,
  contact_id uuid NULL REFERENCES public.contacts(id) ON DELETE SET NULL,
  answers jsonb NOT NULL,
  fit_score smallint NOT NULL,
  band text NOT NULL,
  top_gaps text[] NOT NULL DEFAULT '{}',
  willingness_to_pay text NULL,
  audience_segment text NULL,
  primary_interest text NULL,
  early_access_opt_in boolean NOT NULL DEFAULT false,
  consent_at timestamptz NULL,
  is_qa boolean NOT NULL DEFAULT false,
  utm jsonb NULL,
  referrer text NULL
);

GRANT ALL ON public.preparedness_assessments TO service_role;

ALTER TABLE public.preparedness_assessments ENABLE ROW LEVEL SECURITY;

CREATE INDEX preparedness_assessments_contact_idx ON public.preparedness_assessments (contact_id);
CREATE INDEX preparedness_assessments_created_idx ON public.preparedness_assessments (created_at);
CREATE INDEX preparedness_assessments_session_idx ON public.preparedness_assessments (session_id);

CREATE TRIGGER preparedness_assessments_updated_at
  BEFORE UPDATE ON public.preparedness_assessments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();