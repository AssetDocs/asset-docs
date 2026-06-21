import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SystemMaintenanceState {
  isActive: boolean;
  id: string | null;
  reason: string | null;
  message: string | null;
  startedAt: string | null;
  endsAt: string | null;
  loading: boolean;
}

interface MaintenanceRpcRow {
  is_active: boolean;
  id: string | null;
  reason: string | null;
  message: string | null;
  started_at: string | null;
  ends_at: string | null;
}

type MaintenanceRpc = (fn: 'get_active_maintenance_mode') => {
  maybeSingle: () => Promise<{ data: MaintenanceRpcRow | null; error: Error | null }>;
};

const inactiveState: SystemMaintenanceState = {
  isActive: false,
  id: null,
  reason: null,
  message: null,
  startedAt: null,
  endsAt: null,
  loading: true,
};

export const useSystemMaintenance = (): SystemMaintenanceState => {
  const [state, setState] = useState<SystemMaintenanceState>(inactiveState);

  const loadMaintenanceMode = useCallback(async () => {
    try {
      const { data, error } = await (supabase.rpc as unknown as MaintenanceRpc)('get_active_maintenance_mode')
        .maybeSingle();

      if (error) {
        console.error('Error fetching maintenance mode:', error);
        setState((current) => ({ ...current, loading: false }));
        return;
      }

      setState({
        isActive: !!data?.is_active,
        id: data?.id ?? null,
        reason: data?.reason ?? null,
        message: data?.message ?? null,
        startedAt: data?.started_at ?? null,
        endsAt: data?.ends_at ?? null,
        loading: false,
      });
    } catch (error) {
      console.error('Error loading maintenance mode:', error);
      setState((current) => ({ ...current, loading: false }));
    }
  }, []);

  useEffect(() => {
    loadMaintenanceMode();

    const channel = supabase
      .channel('system-maintenance-windows')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'system_maintenance_windows' },
        () => loadMaintenanceMode()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadMaintenanceMode]);

  return state;
};
