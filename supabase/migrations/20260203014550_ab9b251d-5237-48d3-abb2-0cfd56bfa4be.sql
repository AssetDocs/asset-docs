-- Create enums for new tables
CREATE TYPE public.dev_release_status AS ENUM ('planned', 'in_progress', 'released', 'rolled_back');
CREATE TYPE public.dev_support_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE public.dev_support_status AS ENUM ('new', 'investigating', 'in_progress', 'resolved', 'wont_fix');
CREATE TYPE public.dev_support_type AS ENUM ('bug_report', 'feature_request', 'ux_issue', 'question');

-- Releases / Changelog table
CREATE TABLE public.dev_releases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  release_date DATE,
  status dev_release_status NOT NULL DEFAULT 'planned',
  key_changes TEXT[] DEFAULT '{}',
  known_issues TEXT[] DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Support / Customer Issues table
CREATE TABLE public.dev_support_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  reported_by TEXT, -- user email or identifier
  type dev_support_type NOT NULL DEFAULT 'bug_report',
  priority dev_support_priority NOT NULL DEFAULT 'medium',
  status dev_support_status NOT NULL DEFAULT 'new',
  assignee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolution TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.dev_releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dev_support_issues ENABLE ROW LEVEL SECURITY;

-- RLS Policies for dev_releases
CREATE POLICY "Dev team can view releases"
  ON public.dev_releases FOR SELECT
  TO authenticated
  USING (public.has_dev_workspace_access(auth.uid()));

CREATE POLICY "Dev team can create releases"
  ON public.dev_releases FOR INSERT
  TO authenticated
  WITH CHECK (public.has_dev_workspace_access(auth.uid()));

CREATE POLICY "Dev team can update releases"
  ON public.dev_releases FOR UPDATE
  TO authenticated
  USING (public.has_dev_workspace_access(auth.uid()))
  WITH CHECK (public.has_dev_workspace_access(auth.uid()));

CREATE POLICY "Dev team can delete releases"
  ON public.dev_releases FOR DELETE
  TO authenticated
  USING (public.has_dev_workspace_access(auth.uid()));

-- RLS Policies for dev_support_issues
CREATE POLICY "Dev team can view support issues"
  ON public.dev_support_issues FOR SELECT
  TO authenticated
  USING (public.has_dev_workspace_access(auth.uid()));

CREATE POLICY "Dev team can create support issues"
  ON public.dev_support_issues FOR INSERT
  TO authenticated
  WITH CHECK (public.has_dev_workspace_access(auth.uid()));

CREATE POLICY "Dev team can update support issues"
  ON public.dev_support_issues FOR UPDATE
  TO authenticated
  USING (public.has_dev_workspace_access(auth.uid()))
  WITH CHECK (public.has_dev_workspace_access(auth.uid()));

CREATE POLICY "Dev team can delete support issues"
  ON public.dev_support_issues FOR DELETE
  TO authenticated
  USING (public.has_dev_workspace_access(auth.uid()));

-- Triggers for updated_at
CREATE TRIGGER update_dev_releases_updated_at
  BEFORE UPDATE ON public.dev_releases
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dev_support_issues_updated_at
  BEFORE UPDATE ON public.dev_support_issues
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();