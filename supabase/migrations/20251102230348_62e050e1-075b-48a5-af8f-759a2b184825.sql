-- CRM Tables for AssetDocs (corrected column names)

-- 1) Companies table
CREATE TABLE IF NOT EXISTS public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  domain text,
  created_at timestamptz DEFAULT now()
);

-- 2) Contacts table
CREATE TABLE IF NOT EXISTS public.contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  email text NOT NULL UNIQUE,
  first_name text,
  last_name text,
  phone text,
  company_id uuid REFERENCES public.companies(id),
  source text,
  lifecycle text,
  owner_id uuid,
  created_at timestamptz DEFAULT now()
);

-- 3) Deals table
CREATE TABLE IF NOT EXISTS public.deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.companies(id),
  contact_id uuid REFERENCES public.contacts(id),
  title text NOT NULL,
  stage text NOT NULL DEFAULT 'new',
  value_cents integer,
  currency text DEFAULT 'USD',
  close_date date,
  owner_id uuid,
  created_at timestamptz DEFAULT now()
);

-- 4) Activities table
CREATE TABLE IF NOT EXISTS public.activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid REFERENCES public.contacts(id),
  type text NOT NULL,
  summary text,
  due_at timestamptz,
  done boolean DEFAULT false,
  created_by uuid,
  created_at timestamptz DEFAULT now()
);

-- 5) Events table
CREATE TABLE IF NOT EXISTS public.events (
  id bigserial PRIMARY KEY,
  user_id uuid,
  anon_id text,
  event text NOT NULL,
  props jsonb DEFAULT '{}'::jsonb,
  path text,
  referrer text,
  utm jsonb,
  ip inet,
  ua text,
  occurred_at timestamptz DEFAULT now()
);

-- 6) Tickets table
CREATE TABLE IF NOT EXISTS public.tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid REFERENCES public.contacts(id),
  subject text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  priority text DEFAULT 'normal',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_events_user_time ON public.events (user_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_event_time ON public.events (event, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON public.contacts (email);
CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON public.contacts (user_id);
CREATE INDEX IF NOT EXISTS idx_deals_stage ON public.deals (stage);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.tickets (status);
CREATE INDEX IF NOT EXISTS idx_activities_contact ON public.activities (contact_id);

-- Function to link contact on signup
CREATE OR REPLACE FUNCTION public.link_contact_on_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.contacts (user_id, email, first_name, last_name, lifecycle, source)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    'trial',
    'signup'
  )
  ON CONFLICT (email) DO UPDATE
  SET user_id = EXCLUDED.user_id,
      lifecycle = 'trial',
      first_name = COALESCE(EXCLUDED.first_name, contacts.first_name),
      last_name = COALESCE(EXCLUDED.last_name, contacts.last_name);
  RETURN NEW;
END;
$$;

-- Update the existing trigger to also create contact
DROP TRIGGER IF EXISTS on_auth_user_created_contact ON auth.users;
CREATE TRIGGER on_auth_user_created_contact
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.link_contact_on_signup();

-- Enable RLS on all CRM tables
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS deny_contacts_select ON public.contacts;
DROP POLICY IF EXISTS deny_companies_select ON public.companies;
DROP POLICY IF EXISTS deny_deals_select ON public.deals;
DROP POLICY IF EXISTS deny_activities_select ON public.activities;
DROP POLICY IF EXISTS deny_tickets_select ON public.tickets;
DROP POLICY IF EXISTS allow_insert_events ON public.events;

-- RLS Policies: Deny public access (admin only via service role)
CREATE POLICY deny_contacts_select ON public.contacts FOR SELECT USING (false);
CREATE POLICY deny_companies_select ON public.companies FOR SELECT USING (false);
CREATE POLICY deny_deals_select ON public.deals FOR SELECT USING (false);
CREATE POLICY deny_activities_select ON public.activities FOR SELECT USING (false);
CREATE POLICY deny_tickets_select ON public.tickets FOR SELECT USING (false);

-- Allow anonymous and authenticated users to INSERT events (for tracking)
CREATE POLICY allow_insert_events ON public.events
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- CRM Report Functions
CREATE OR REPLACE FUNCTION public.get_leads_by_source()
RETURNS TABLE(source text, count bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(c.source, 'unknown') as source, COUNT(*) as count
  FROM contacts c
  WHERE c.created_at >= NOW() - INTERVAL '30 days'
  GROUP BY c.source
  ORDER BY count DESC;
$$;

CREATE OR REPLACE FUNCTION public.get_activation_funnel()
RETURNS TABLE(wk timestamptz, signups bigint, activated bigint, activation_rate_pct numeric)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH signups AS (
    SELECT user_id, DATE_TRUNC('week', occurred_at) as wk
    FROM events WHERE event='signup'
  ),
  first_upload AS (
    SELECT user_id, MIN(occurred_at) as first_upload_at
    FROM events WHERE event='first_upload'
    GROUP BY user_id
  )
  SELECT 
    s.wk,
    COUNT(*) as signups,
    COUNT(f.user_id) as activated,
    ROUND(100.0 * COUNT(f.user_id) / NULLIF(COUNT(*), 0), 1) as activation_rate_pct
  FROM signups s
  LEFT JOIN first_upload f ON f.user_id = s.user_id
  GROUP BY s.wk 
  ORDER BY s.wk DESC
  LIMIT 12;
$$;

CREATE OR REPLACE FUNCTION public.get_at_risk_customers()
RETURNS TABLE(email text, plan_id text, last_activity timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    c.email,
    p.plan_id,
    MAX(e.occurred_at) as last_activity
  FROM profiles p
  JOIN contacts c ON c.user_id = p.user_id
  LEFT JOIN events e ON e.user_id = p.user_id
  WHERE p.plan_status = 'active'
  GROUP BY c.email, p.plan_id
  HAVING COALESCE(MAX(e.occurred_at), '1970-01-01'::timestamptz) < NOW() - INTERVAL '30 days'
  ORDER BY last_activity NULLS FIRST
  LIMIT 50;
$$;