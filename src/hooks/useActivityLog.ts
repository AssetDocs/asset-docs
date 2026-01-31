import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Json } from '@/integrations/supabase/types';

export interface ActivityLogEntry {
  id: string;
  user_id: string;
  actor_user_id: string | null;
  action_type: string;
  action_category: string;
  resource_type: string | null;
  resource_id: string | null;
  resource_name: string | null;
  details: Json;
  ip_address: unknown;
  user_agent: string | null;
  created_at: string;
  actor_name?: string;
}

export function useActivityLog() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async (limit = 100) => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('user_activity_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (fetchError) throw fetchError;

      // Enrich with actor names for contributor actions
      const enrichedLogs: ActivityLogEntry[] = await Promise.all(
        (data || []).map(async (log) => {
          if (log.actor_user_id && log.actor_user_id !== log.user_id) {
            // Get contributor name
            const { data: contributor } = await supabase
              .from('contributors')
              .select('first_name, last_name')
              .eq('contributor_user_id', log.actor_user_id)
              .eq('account_owner_id', log.user_id)
              .maybeSingle();

            if (contributor) {
              return {
                ...log,
                actor_name: `${contributor.first_name || ''} ${contributor.last_name || ''}`.trim() || 'Contributor'
              };
            }
          }
          return log as ActivityLogEntry;
        })
      );

      setLogs(enrichedLogs);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch activity logs';
      setError(message);
      console.error('Activity log fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return {
    logs,
    isLoading,
    error,
    refetch: fetchLogs
  };
}

// Helper to log activity from client-side
export async function logActivity(params: {
  action_type: string;
  action_category: string;
  resource_type?: string;
  resource_id?: string;
  resource_name?: string;
  details?: Record<string, unknown>;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  try {
    await supabase.from('user_activity_logs').insert([{
      user_id: user.id,
      actor_user_id: user.id,
      action_type: params.action_type,
      action_category: params.action_category,
      resource_type: params.resource_type || null,
      resource_id: params.resource_id || null,
      resource_name: params.resource_name || null,
      details: (params.details || {}) as Json,
    }]);
  } catch (err) {
    console.error('Failed to log activity:', err);
  }
}
