// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';

const CaseTimeline: React.FC<{ caseId: string; reloadKey: number }> = ({ caseId, reloadKey }) => {
  const [events, setEvents] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('continuity_timeline_events').select('*').eq('request_id', caseId).order('created_at', { ascending: false });
      setEvents(data || []);
    })();
  }, [caseId, reloadKey]);

  return (
    <div className="pt-4 space-y-2">
      {events.length === 0 && <p className="text-sm text-muted-foreground">No events recorded yet.</p>}
      {events.map((e) => (
        <div key={e.id} className="border-l-2 border-border pl-3 py-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{new Date(e.created_at).toLocaleString()}</span>
            <Badge variant="outline" className="text-xs">{e.event_type}</Badge>
            {e.actor_id && <span className="font-mono">{e.actor_id.slice(0, 8)}…</span>}
          </div>
          <div className="text-sm">{e.event_description || '—'}</div>
        </div>
      ))}
    </div>
  );
};

export default CaseTimeline;
