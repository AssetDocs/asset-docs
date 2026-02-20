
-- Create enum for calendar event categories
CREATE TYPE public.calendar_event_category AS ENUM (
  'home_property',
  'maintenance_care',
  'utilities_household',
  'appliances_systems',
  'warranties_coverage',
  'property_lifecycle',
  'compliance_filings',
  'equipment_assets',
  'subscriptions_auto_drafts',
  'hr_admin',
  'tenant_lifecycle',
  'inspections_turnover',
  'rent_financial',
  'legal_compliance',
  'legal_document_reviews',
  'authorized_user_reviews',
  'legacy_emergency_planning'
);

-- Create calendar_events table
CREATE TABLE public.calendar_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  category public.calendar_event_category,
  start_date DATE NOT NULL,
  end_date DATE,
  recurrence TEXT NOT NULL DEFAULT 'one_time' CHECK (recurrence IN ('one_time', 'daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'semi_annual', 'annual')),
  recurrence_end_date DATE,
  linked_property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  linked_asset_id UUID REFERENCES public.items(id) ON DELETE SET NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'overdue', 'completed')),
  is_suggested BOOLEAN NOT NULL DEFAULT false,
  is_dismissed BOOLEAN NOT NULL DEFAULT false,
  template_key TEXT,
  visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('private', 'shared', 'emergency_only')),
  notify_day_of BOOLEAN NOT NULL DEFAULT true,
  notify_1_week BOOLEAN NOT NULL DEFAULT false,
  notify_30_days BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create calendar_event_attachments table
CREATE TABLE public.calendar_event_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.calendar_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  file_name TEXT,
  file_path TEXT,
  file_type TEXT,
  file_size BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_event_attachments ENABLE ROW LEVEL SECURITY;

-- RLS: Users can CRUD their own events
CREATE POLICY "Users can view their own events"
ON public.calendar_events FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own events"
ON public.calendar_events FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own events"
ON public.calendar_events FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own events"
ON public.calendar_events FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- RLS: Contributors with viewer+ role can see shared events
CREATE POLICY "Contributors can view shared events"
ON public.calendar_events FOR SELECT
TO authenticated
USING (
  visibility = 'shared'
  AND EXISTS (
    SELECT 1 FROM public.contributors c
    WHERE c.contributor_user_id = auth.uid()
      AND c.account_owner_id = calendar_events.user_id
      AND c.status = 'accepted'
      AND c.role IN ('viewer', 'contributor', 'administrator')
  )
);

-- RLS: Contributors with contributor+ role can insert/update shared events
CREATE POLICY "Contributors can create shared events"
ON public.calendar_events FOR INSERT
TO authenticated
WITH CHECK (
  visibility = 'shared'
  AND EXISTS (
    SELECT 1 FROM public.contributors c
    WHERE c.contributor_user_id = auth.uid()
      AND c.account_owner_id = calendar_events.user_id
      AND c.status = 'accepted'
      AND c.role IN ('contributor', 'administrator')
  )
);

CREATE POLICY "Contributors can update shared events"
ON public.calendar_events FOR UPDATE
TO authenticated
USING (
  visibility = 'shared'
  AND EXISTS (
    SELECT 1 FROM public.contributors c
    WHERE c.contributor_user_id = auth.uid()
      AND c.account_owner_id = calendar_events.user_id
      AND c.status = 'accepted'
      AND c.role IN ('contributor', 'administrator')
  )
);

-- RLS: Delegates can view emergency-only events
CREATE POLICY "Delegates can view emergency events"
ON public.calendar_events FOR SELECT
TO authenticated
USING (
  visibility = 'emergency_only'
  AND EXISTS (
    SELECT 1 FROM public.legacy_locker ll
    WHERE ll.user_id = calendar_events.user_id
      AND ll.delegate_user_id = auth.uid()
  )
);

-- RLS for attachments
CREATE POLICY "Users can view their own event attachments"
ON public.calendar_event_attachments FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own event attachments"
ON public.calendar_event_attachments FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own event attachments"
ON public.calendar_event_attachments FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_calendar_events_updated_at
BEFORE UPDATE ON public.calendar_events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
