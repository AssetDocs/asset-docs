import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Types for dev workspace entities
export type DevTaskStatus = 'todo' | 'in_progress' | 'done' | 'archived';
export type DevTaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type DevBugSeverity = 'minor' | 'major' | 'critical' | 'blocker';
export type DevBugStatus = 'open' | 'investigating' | 'fixed' | 'closed' | 'wont_fix';
export type DevBlockerType = 'owner_question' | 'dependency' | 'technical' | 'external';
export type DevBlockerStatus = 'open' | 'resolved' | 'deferred';
export type DevMilestoneStatus = 'planned' | 'in_progress' | 'completed' | 'delayed';

export interface DevTask {
  id: string;
  title: string;
  description: string | null;
  status: DevTaskStatus;
  priority: DevTaskPriority;
  assignee_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface DevBug {
  id: string;
  title: string;
  description: string | null;
  steps_to_reproduce: string | null;
  expected_behavior: string | null;
  severity: DevBugSeverity;
  status: DevBugStatus;
  reporter_id: string | null;
  assignee_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface DevNote {
  id: string;
  content: string;
  author_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface DevBlocker {
  id: string;
  title: string;
  description: string | null;
  type: DevBlockerType;
  status: DevBlockerStatus;
  created_by: string | null;
  resolved_by: string | null;
  created_at: string;
  resolved_at: string | null;
}

export interface DevDecision {
  id: string;
  decision: string;
  rationale: string | null;
  approved_by: string | null;
  decided_at: string | null;
  created_by: string | null;
  created_at: string;
}

export interface DevMilestone {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  status: DevMilestoneStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export function useDevWorkspace() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<DevTask[]>([]);
  const [bugs, setBugs] = useState<DevBug[]>([]);
  const [notes, setNotes] = useState<DevNote[]>([]);
  const [blockers, setBlockers] = useState<DevBlocker[]>([]);
  const [decisions, setDecisions] = useState<DevDecision[]>([]);
  const [milestones, setMilestones] = useState<DevMilestone[]>([]);

  // Fetch all workspace data
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [tasksRes, bugsRes, notesRes, blockersRes, decisionsRes, milestonesRes] = await Promise.all([
        supabase.from('dev_tasks').select('*').order('created_at', { ascending: false }),
        supabase.from('dev_bugs').select('*').order('created_at', { ascending: false }),
        supabase.from('dev_notes').select('*').order('created_at', { ascending: false }),
        supabase.from('dev_blockers').select('*').order('created_at', { ascending: false }),
        supabase.from('dev_decisions').select('*').order('created_at', { ascending: false }),
        supabase.from('dev_milestones').select('*').order('due_date', { ascending: true }),
      ]);

      if (tasksRes.data) setTasks(tasksRes.data as DevTask[]);
      if (bugsRes.data) setBugs(bugsRes.data as DevBug[]);
      if (notesRes.data) setNotes(notesRes.data as DevNote[]);
      if (blockersRes.data) setBlockers(blockersRes.data as DevBlocker[]);
      if (decisionsRes.data) setDecisions(decisionsRes.data as DevDecision[]);
      if (milestonesRes.data) setMilestones(milestonesRes.data as DevMilestone[]);
    } catch (error) {
      console.error('Error fetching dev workspace data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize and set up real-time subscriptions
  useEffect(() => {
    fetchAll();

    // Set up real-time subscriptions
    const channel = supabase
      .channel('dev-workspace-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dev_tasks' }, () => fetchAll())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dev_bugs' }, () => fetchAll())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dev_notes' }, () => fetchAll())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dev_blockers' }, () => fetchAll())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dev_decisions' }, () => fetchAll())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dev_milestones' }, () => fetchAll())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAll]);

  // Task operations
  const createTask = async (data: { title: string; description?: string; priority?: DevTaskPriority; assignee_id?: string }) => {
    const { data: user } = await supabase.auth.getUser();
    const { error } = await supabase.from('dev_tasks').insert({
      title: data.title,
      description: data.description || null,
      priority: data.priority || 'medium',
      assignee_id: data.assignee_id || null,
      created_by: user?.user?.id || null,
    });
    if (error) {
      toast({ title: 'Error', description: 'Failed to create task', variant: 'destructive' });
      return false;
    }
    toast({ title: 'Success', description: 'Task created' });
    return true;
  };

  const updateTask = async (id: string, data: Partial<DevTask>) => {
    const { error } = await supabase.from('dev_tasks').update(data).eq('id', id);
    if (error) {
      toast({ title: 'Error', description: 'Failed to update task', variant: 'destructive' });
      return false;
    }
    return true;
  };

  const deleteTask = async (id: string) => {
    const { error } = await supabase.from('dev_tasks').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: 'Failed to delete task', variant: 'destructive' });
      return false;
    }
    toast({ title: 'Success', description: 'Task deleted' });
    return true;
  };

  // Bug operations
  const createBug = async (data: { title: string; description?: string; steps_to_reproduce?: string; expected_behavior?: string; severity?: DevBugSeverity }) => {
    const { data: user } = await supabase.auth.getUser();
    const { error } = await supabase.from('dev_bugs').insert({
      title: data.title,
      description: data.description || null,
      steps_to_reproduce: data.steps_to_reproduce || null,
      expected_behavior: data.expected_behavior || null,
      severity: data.severity || 'major',
      reporter_id: user?.user?.id || null,
    });
    if (error) {
      toast({ title: 'Error', description: 'Failed to report bug', variant: 'destructive' });
      return false;
    }
    toast({ title: 'Success', description: 'Bug reported' });
    return true;
  };

  const updateBug = async (id: string, data: Partial<DevBug>) => {
    const { error } = await supabase.from('dev_bugs').update(data).eq('id', id);
    if (error) {
      toast({ title: 'Error', description: 'Failed to update bug', variant: 'destructive' });
      return false;
    }
    return true;
  };

  const deleteBug = async (id: string) => {
    const { error } = await supabase.from('dev_bugs').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: 'Failed to delete bug', variant: 'destructive' });
      return false;
    }
    toast({ title: 'Success', description: 'Bug deleted' });
    return true;
  };

  // Note operations
  const createNote = async (content: string) => {
    const { data: user } = await supabase.auth.getUser();
    const { error } = await supabase.from('dev_notes').insert({
      content,
      author_id: user?.user?.id || null,
    });
    if (error) {
      toast({ title: 'Error', description: 'Failed to create note', variant: 'destructive' });
      return false;
    }
    toast({ title: 'Success', description: 'Note saved' });
    return true;
  };

  const updateNote = async (id: string, content: string) => {
    const { error } = await supabase.from('dev_notes').update({ content }).eq('id', id);
    if (error) {
      toast({ title: 'Error', description: 'Failed to update note', variant: 'destructive' });
      return false;
    }
    return true;
  };

  const deleteNote = async (id: string) => {
    const { error } = await supabase.from('dev_notes').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: 'Failed to delete note', variant: 'destructive' });
      return false;
    }
    toast({ title: 'Success', description: 'Note deleted' });
    return true;
  };

  // Blocker operations
  const createBlocker = async (data: { title: string; description?: string; type?: DevBlockerType }) => {
    const { data: user } = await supabase.auth.getUser();
    const { error } = await supabase.from('dev_blockers').insert({
      title: data.title,
      description: data.description || null,
      type: data.type || 'technical',
      created_by: user?.user?.id || null,
    });
    if (error) {
      toast({ title: 'Error', description: 'Failed to create blocker', variant: 'destructive' });
      return false;
    }
    toast({ title: 'Success', description: 'Blocker created' });
    return true;
  };

  const updateBlocker = async (id: string, data: Partial<DevBlocker>) => {
    const { error } = await supabase.from('dev_blockers').update(data).eq('id', id);
    if (error) {
      toast({ title: 'Error', description: 'Failed to update blocker', variant: 'destructive' });
      return false;
    }
    return true;
  };

  const resolveBlocker = async (id: string) => {
    const { data: user } = await supabase.auth.getUser();
    const { error } = await supabase.from('dev_blockers').update({
      status: 'resolved' as DevBlockerStatus,
      resolved_by: user?.user?.id || null,
      resolved_at: new Date().toISOString(),
    }).eq('id', id);
    if (error) {
      toast({ title: 'Error', description: 'Failed to resolve blocker', variant: 'destructive' });
      return false;
    }
    toast({ title: 'Success', description: 'Blocker resolved' });
    return true;
  };

  const deleteBlocker = async (id: string) => {
    const { error } = await supabase.from('dev_blockers').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: 'Failed to delete blocker', variant: 'destructive' });
      return false;
    }
    toast({ title: 'Success', description: 'Blocker deleted' });
    return true;
  };

  // Decision operations
  const createDecision = async (data: { decision: string; rationale?: string }) => {
    const { data: user } = await supabase.auth.getUser();
    const { error } = await supabase.from('dev_decisions').insert({
      decision: data.decision,
      rationale: data.rationale || null,
      created_by: user?.user?.id || null,
      decided_at: new Date().toISOString(),
    });
    if (error) {
      toast({ title: 'Error', description: 'Failed to create decision', variant: 'destructive' });
      return false;
    }
    toast({ title: 'Success', description: 'Decision recorded' });
    return true;
  };

  const approveDecision = async (id: string) => {
    const { data: user } = await supabase.auth.getUser();
    const { error } = await supabase.from('dev_decisions').update({
      approved_by: user?.user?.id || null,
      decided_at: new Date().toISOString(),
    }).eq('id', id);
    if (error) {
      toast({ title: 'Error', description: 'Failed to approve decision', variant: 'destructive' });
      return false;
    }
    toast({ title: 'Success', description: 'Decision approved' });
    return true;
  };

  const deleteDecision = async (id: string) => {
    const { error } = await supabase.from('dev_decisions').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: 'Failed to delete decision', variant: 'destructive' });
      return false;
    }
    toast({ title: 'Success', description: 'Decision deleted' });
    return true;
  };

  // Milestone operations
  const createMilestone = async (data: { title: string; description?: string; due_date?: string; status?: DevMilestoneStatus }) => {
    const { data: user } = await supabase.auth.getUser();
    const { error } = await supabase.from('dev_milestones').insert({
      title: data.title,
      description: data.description || null,
      due_date: data.due_date || null,
      status: data.status || 'planned',
      created_by: user?.user?.id || null,
    });
    if (error) {
      toast({ title: 'Error', description: 'Failed to create milestone', variant: 'destructive' });
      return false;
    }
    toast({ title: 'Success', description: 'Milestone created' });
    return true;
  };

  const updateMilestone = async (id: string, data: Partial<DevMilestone>) => {
    const { error } = await supabase.from('dev_milestones').update(data).eq('id', id);
    if (error) {
      toast({ title: 'Error', description: 'Failed to update milestone', variant: 'destructive' });
      return false;
    }
    return true;
  };

  const deleteMilestone = async (id: string) => {
    const { error } = await supabase.from('dev_milestones').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: 'Failed to delete milestone', variant: 'destructive' });
      return false;
    }
    toast({ title: 'Success', description: 'Milestone deleted' });
    return true;
  };

  return {
    loading,
    tasks,
    bugs,
    notes,
    blockers,
    decisions,
    milestones,
    refetch: fetchAll,
    // Task operations
    createTask,
    updateTask,
    deleteTask,
    // Bug operations
    createBug,
    updateBug,
    deleteBug,
    // Note operations
    createNote,
    updateNote,
    deleteNote,
    // Blocker operations
    createBlocker,
    updateBlocker,
    resolveBlocker,
    deleteBlocker,
    // Decision operations
    createDecision,
    approveDecision,
    deleteDecision,
    // Milestone operations
    createMilestone,
    updateMilestone,
    deleteMilestone,
  };
}
