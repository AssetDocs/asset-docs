// @ts-nocheck
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useContinuityExecution(requestId: string | null, reloadKey = 0) {
  const [snapshot, setSnapshot] = useState<any>(null);
  const [tempAccess, setTempAccess] = useState<any[]>([]);
  const [archiveAccess, setArchiveAccess] = useState<any[]>([]);
  const [history, setHistory] = useState<any | null>(null);
  const [executionEvents, setExecutionEvents] = useState<any[]>([]);
  const [ownershipMeta, setOwnershipMeta] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!requestId) return;
    setLoading(true);
    const [snap, temp, arch, hist, events] = await Promise.all([
      supabase.from('continuity_account_snapshots').select('*').eq('request_id', requestId).order('created_at', { ascending: false }).limit(1).maybeSingle(),
      supabase.from('continuity_temporary_access').select('*').eq('request_id', requestId).order('created_at', { ascending: false }),
      supabase.from('continuity_archive_custodian_access').select('*').eq('request_id', requestId).order('created_at', { ascending: false }),
      supabase.from('ownership_transfer_history').select('*').eq('request_id', requestId).maybeSingle(),
      supabase.from('continuity_execution_events').select('*').eq('request_id', requestId).order('started_at', { ascending: false }),
    ]);
    setSnapshot(snap.data || null);
    setTempAccess(temp.data || []);
    setArchiveAccess(arch.data || []);
    setHistory(hist.data || null);
    setExecutionEvents(events.data || []);
    if (snap.data?.account_id) {
      const meta = await supabase.from('account_ownership_metadata').select('*').eq('account_id', snap.data.account_id).maybeSingle();
      setOwnershipMeta(meta.data || null);
    }
    setLoading(false);
  }, [requestId]);

  useEffect(() => { load(); }, [load, reloadKey]);

  return { snapshot, tempAccess, archiveAccess, history, executionEvents, ownershipMeta, loading, reload: load };
}
