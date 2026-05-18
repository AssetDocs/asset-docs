// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAdminRole } from '@/hooks/useAdminRole';
import { NOTE_CATEGORIES, NOTE_CATEGORY_LABEL, capabilitiesForRole, CAP_REQUIREMENT_HELP } from './constants';
import { toast } from '@/hooks/use-toast';

const CaseNotes: React.FC<{ caseData: any; readOnly?: boolean; onChange: () => void }> = ({ caseData, readOnly, onChange }) => {
  const [notes, setNotes] = useState<any[]>([]);
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('general');
  const { role } = useAdminRole();
  const caps = capabilitiesForRole(role);
  const canAdd = caps.has('add_notes') && !readOnly;

  const load = async () => {
    const { data } = await supabase.from('continuity_notes').select('*').eq('request_id', caseData.id).order('created_at', { ascending: false });
    setNotes(data || []);
  };
  useEffect(() => { load(); }, [caseData?.id]);

  const add = async () => {
    if (!body.trim()) return;
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from('continuity_notes').insert({
      request_id: caseData.id, note_body: body, note_category: category, created_by: u.user?.id,
    });
    if (error) { toast({ title: 'Could not save note', description: error.message, variant: 'destructive' }); return; }
    await supabase.rpc('log_continuity_event', {
      _request_id: caseData.id, _event_type: 'note_added',
      _event_description: `Internal note (${NOTE_CATEGORY_LABEL[category]}) added`,
      _action_details: { category }, _affected_account_id: caseData.account_id,
    });
    setBody(''); load(); onChange();
  };

  return (
    <div className="space-y-4 pt-4">
      {canAdd && (
        <div className="space-y-2 border border-border rounded-md p-3 bg-background">
          <div className="flex gap-2 items-center">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-56 h-8"><SelectValue /></SelectTrigger>
              <SelectContent>
                {NOTE_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{NOTE_CATEGORY_LABEL[c]}</SelectItem>)}
              </SelectContent>
            </Select>
            <span className="text-xs text-muted-foreground">Internal — visible only to Asset Safe admins.</span>
          </div>
          <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Add an internal note…" rows={3} />
          <div className="flex justify-end"><Button size="sm" onClick={add}>Add Note</Button></div>
        </div>
      )}
      {!canAdd && (
        <p className="text-xs text-muted-foreground">{readOnly ? 'This case is read-only.' : CAP_REQUIREMENT_HELP.add_notes}</p>
      )}
      <div className="space-y-2">
        {notes.length === 0 && <p className="text-sm text-muted-foreground">No internal notes yet.</p>}
        {notes.map((n) => (
          <div key={n.id} className="border border-border rounded-md p-3 bg-background">
            <div className="flex justify-between items-center mb-1 gap-2">
              <Badge variant="outline" className="text-xs">{NOTE_CATEGORY_LABEL[n.note_category]}</Badge>
              <span className="text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString()} · {n.created_by?.slice(0, 8)}…</span>
            </div>
            <p className="text-sm whitespace-pre-wrap">{n.note_body}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CaseNotes;
