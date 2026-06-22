// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAdminRole } from '@/hooks/useAdminRole';
import {
  CHECKLIST_DEFINITION, CHECKLIST_STATUS_OPTIONS, CHECKLIST_STATUS_LABEL, CHECKLIST_STATUS_BADGE,
  EVIDENCE_REQUIREMENT_BADGE, EVIDENCE_REQUIREMENT_LABEL,
  capabilitiesForRole, CAP_REQUIREMENT_HELP,
} from './constants';

const CaseChecklist: React.FC<{ caseData: any; readOnly?: boolean; onChange: () => void }> = ({ caseData, readOnly, onChange }) => {
  const [items, setItems] = useState<Record<string, any>>({});
  const [requirements, setRequirements] = useState<Record<string, any>>({});
  const { role } = useAdminRole();
  const caps = capabilitiesForRole(role);
  const canEdit = caps.has('complete_checklist') && !readOnly;

  const load = async () => {
    const [{ data }, { data: reqs }] = await Promise.all([
      supabase.from('continuity_checklist_items').select('*').eq('request_id', caseData.id),
      supabase.rpc('get_continuity_evidence_requirements', { _request_type: caseData.request_type }),
    ]);
    const map: Record<string, any> = {};
    (data || []).forEach((it: any) => { map[it.item_key] = it; });
    const reqMap: Record<string, any> = {};
    (reqs || []).forEach((it: any) => { reqMap[it.item_key] = it; });
    setItems(map);
    setRequirements(reqMap);
  };
  useEffect(() => { load(); }, [caseData?.id]);

  const setStatus = async (cat: string, key: string, label: string, status: string) => {
    const { data: u } = await supabase.auth.getUser();
    const existing = items[key];
    if (existing) {
      await supabase.from('continuity_checklist_items').update({ status, reviewed_by: u.user?.id, reviewed_at: new Date().toISOString() }).eq('id', existing.id);
    } else {
      await supabase.from('continuity_checklist_items').insert({
        request_id: caseData.id, category: cat, item_key: key, label, status,
        reviewed_by: u.user?.id, reviewed_at: new Date().toISOString(),
      });
    }
    await supabase.rpc('log_continuity_event', {
      _request_id: caseData.id, _event_type: 'checklist_updated',
      _event_description: `${label}: ${CHECKLIST_STATUS_LABEL[status]}`,
      _action_details: { item_key: key, status }, _affected_account_id: caseData.account_id,
    });
    load(); onChange();
  };

  return (
    <div className="space-y-5 pt-4">
      {CHECKLIST_DEFINITION.map((sec) => (
        <div key={sec.category} className="space-y-2">
          <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{sec.category}</h4>
          <div className="border border-border rounded-md divide-y divide-border">
            {sec.items.map((it) => {
              const cur = items[it.key]?.status || 'not_started';
              const req = requirements[it.key];
              return (
                <div key={it.key} className="px-3 py-2 flex items-center justify-between gap-3">
                  <div className="text-sm flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span>{it.label}</span>
                      {req && (
                        <Badge variant="outline" className={EVIDENCE_REQUIREMENT_BADGE[req.requirement_level]}>
                          {EVIDENCE_REQUIREMENT_LABEL[req.requirement_level]}
                        </Badge>
                      )}
                    </div>
                    {req?.requirement_notes && (
                      <div className="text-xs text-muted-foreground mt-1">{req.requirement_notes}</div>
                    )}
                  </div>
                  <Badge variant="outline" className={CHECKLIST_STATUS_BADGE[cur]}>{CHECKLIST_STATUS_LABEL[cur]}</Badge>
                  <Select value={cur} disabled={!canEdit} onValueChange={(v) => setStatus(sec.category, it.key, it.label, v)}>
                    <SelectTrigger className="w-40 h-8" title={canEdit ? '' : CAP_REQUIREMENT_HELP.complete_checklist}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CHECKLIST_STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{CHECKLIST_STATUS_LABEL[s]}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CaseChecklist;
