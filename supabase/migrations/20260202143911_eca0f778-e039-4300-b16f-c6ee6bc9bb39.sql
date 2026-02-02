-- Create enums for dev workspace
CREATE TYPE public.dev_task_status AS ENUM ('todo', 'in_progress', 'done', 'archived');
CREATE TYPE public.dev_task_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE public.dev_bug_severity AS ENUM ('minor', 'major', 'critical', 'blocker');
CREATE TYPE public.dev_bug_status AS ENUM ('open', 'investigating', 'fixed', 'closed', 'wont_fix');
CREATE TYPE public.dev_blocker_type AS ENUM ('owner_question', 'dependency', 'technical', 'external');
CREATE TYPE public.dev_blocker_status AS ENUM ('open', 'resolved', 'deferred');
CREATE TYPE public.dev_milestone_status AS ENUM ('planned', 'in_progress', 'completed', 'delayed');

-- Create dev_tasks table
CREATE TABLE public.dev_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status public.dev_task_status NOT NULL DEFAULT 'todo',
  priority public.dev_task_priority NOT NULL DEFAULT 'medium',
  assignee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create dev_bugs table
CREATE TABLE public.dev_bugs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  steps_to_reproduce TEXT,
  expected_behavior TEXT,
  severity public.dev_bug_severity NOT NULL DEFAULT 'major',
  status public.dev_bug_status NOT NULL DEFAULT 'open',
  reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assignee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create dev_notes table
CREATE TABLE public.dev_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create dev_blockers table
CREATE TABLE public.dev_blockers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  type public.dev_blocker_type NOT NULL DEFAULT 'technical',
  status public.dev_blocker_status NOT NULL DEFAULT 'open',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create dev_decisions table
CREATE TABLE public.dev_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision TEXT NOT NULL,
  rationale TEXT,
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  decided_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create dev_milestones table
CREATE TABLE public.dev_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  status public.dev_milestone_status NOT NULL DEFAULT 'planned',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all dev workspace tables
ALTER TABLE public.dev_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dev_bugs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dev_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dev_blockers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dev_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dev_milestones ENABLE ROW LEVEL SECURITY;

-- RLS Policies for dev_tasks
CREATE POLICY "Dev team can view tasks"
ON public.dev_tasks FOR SELECT
TO authenticated
USING (public.has_dev_workspace_access(auth.uid()));

CREATE POLICY "Dev team can create tasks"
ON public.dev_tasks FOR INSERT
TO authenticated
WITH CHECK (public.has_dev_workspace_access(auth.uid()));

CREATE POLICY "Dev team can update tasks"
ON public.dev_tasks FOR UPDATE
TO authenticated
USING (public.has_dev_workspace_access(auth.uid()))
WITH CHECK (public.has_dev_workspace_access(auth.uid()));

CREATE POLICY "Dev team can delete tasks"
ON public.dev_tasks FOR DELETE
TO authenticated
USING (public.has_dev_workspace_access(auth.uid()));

-- RLS Policies for dev_bugs
CREATE POLICY "Dev team can view bugs"
ON public.dev_bugs FOR SELECT
TO authenticated
USING (public.has_dev_workspace_access(auth.uid()));

CREATE POLICY "Dev team can create bugs"
ON public.dev_bugs FOR INSERT
TO authenticated
WITH CHECK (public.has_dev_workspace_access(auth.uid()));

CREATE POLICY "Dev team can update bugs"
ON public.dev_bugs FOR UPDATE
TO authenticated
USING (public.has_dev_workspace_access(auth.uid()))
WITH CHECK (public.has_dev_workspace_access(auth.uid()));

CREATE POLICY "Dev team can delete bugs"
ON public.dev_bugs FOR DELETE
TO authenticated
USING (public.has_dev_workspace_access(auth.uid()));

-- RLS Policies for dev_notes
CREATE POLICY "Dev team can view notes"
ON public.dev_notes FOR SELECT
TO authenticated
USING (public.has_dev_workspace_access(auth.uid()));

CREATE POLICY "Dev team can create notes"
ON public.dev_notes FOR INSERT
TO authenticated
WITH CHECK (public.has_dev_workspace_access(auth.uid()));

CREATE POLICY "Dev team can update notes"
ON public.dev_notes FOR UPDATE
TO authenticated
USING (public.has_dev_workspace_access(auth.uid()))
WITH CHECK (public.has_dev_workspace_access(auth.uid()));

CREATE POLICY "Dev team can delete notes"
ON public.dev_notes FOR DELETE
TO authenticated
USING (public.has_dev_workspace_access(auth.uid()));

-- RLS Policies for dev_blockers
CREATE POLICY "Dev team can view blockers"
ON public.dev_blockers FOR SELECT
TO authenticated
USING (public.has_dev_workspace_access(auth.uid()));

CREATE POLICY "Dev team can create blockers"
ON public.dev_blockers FOR INSERT
TO authenticated
WITH CHECK (public.has_dev_workspace_access(auth.uid()));

CREATE POLICY "Dev team can update blockers"
ON public.dev_blockers FOR UPDATE
TO authenticated
USING (public.has_dev_workspace_access(auth.uid()))
WITH CHECK (public.has_dev_workspace_access(auth.uid()));

CREATE POLICY "Dev team can delete blockers"
ON public.dev_blockers FOR DELETE
TO authenticated
USING (public.has_dev_workspace_access(auth.uid()));

-- RLS Policies for dev_decisions
CREATE POLICY "Dev team can view decisions"
ON public.dev_decisions FOR SELECT
TO authenticated
USING (public.has_dev_workspace_access(auth.uid()));

CREATE POLICY "Dev team can create decisions"
ON public.dev_decisions FOR INSERT
TO authenticated
WITH CHECK (public.has_dev_workspace_access(auth.uid()));

CREATE POLICY "Dev team can update decisions"
ON public.dev_decisions FOR UPDATE
TO authenticated
USING (public.has_dev_workspace_access(auth.uid()))
WITH CHECK (public.has_dev_workspace_access(auth.uid()));

CREATE POLICY "Dev team can delete decisions"
ON public.dev_decisions FOR DELETE
TO authenticated
USING (public.has_dev_workspace_access(auth.uid()));

-- RLS Policies for dev_milestones
CREATE POLICY "Dev team can view milestones"
ON public.dev_milestones FOR SELECT
TO authenticated
USING (public.has_dev_workspace_access(auth.uid()));

CREATE POLICY "Dev team can create milestones"
ON public.dev_milestones FOR INSERT
TO authenticated
WITH CHECK (public.has_dev_workspace_access(auth.uid()));

CREATE POLICY "Dev team can update milestones"
ON public.dev_milestones FOR UPDATE
TO authenticated
USING (public.has_dev_workspace_access(auth.uid()))
WITH CHECK (public.has_dev_workspace_access(auth.uid()));

CREATE POLICY "Dev team can delete milestones"
ON public.dev_milestones FOR DELETE
TO authenticated
USING (public.has_dev_workspace_access(auth.uid()));

-- Create triggers for updated_at
CREATE TRIGGER update_dev_tasks_updated_at
BEFORE UPDATE ON public.dev_tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dev_bugs_updated_at
BEFORE UPDATE ON public.dev_bugs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dev_notes_updated_at
BEFORE UPDATE ON public.dev_notes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dev_milestones_updated_at
BEFORE UPDATE ON public.dev_milestones
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();