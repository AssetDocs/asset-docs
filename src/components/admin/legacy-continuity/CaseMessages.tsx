// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAdminRole } from '@/hooks/useAdminRole';
import { MESSAGE_TEMPLATES, capabilitiesForRole, CAP_REQUIREMENT_HELP } from './constants';
import { toast } from '@/hooks/use-toast';

const CaseMessages: React.FC<{ caseData: any; readOnly?: boolean; onChange: () => void }> = ({ caseData, readOnly, onChange }) => {
  const [msgs, setMsgs] = useState<any[]>([]);
  const [tpl, setTpl] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const { role } = useAdminRole();
  const caps = capabilitiesForRole(role);
  const canSend = caps.has('send_messages') && !readOnly;

  const load = async () => {
    const { data } = await supabase.from('continuity_messages').select('*').eq('request_id', caseData.id).order('created_at', { ascending: false });
    setMsgs(data || []);
  };
  useEffect(() => { load(); }, [caseData?.id]);

  const applyTemplate = (key: string) => {
    setTpl(key);
    const t = MESSAGE_TEMPLATES.find((m) => m.key === key);
    if (t) { setSubject(t.subject); setBody(t.body); }
  };

  const send = async () => {
    if (!body.trim()) return;
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from('continuity_messages').insert({
      request_id: caseData.id, sent_by: u.user?.id, sent_to: caseData.requested_by_user_id,
      subject, message_body: body, template_key: tpl || null,
    });
    if (error) { toast({ title: 'Could not log message', description: error.message, variant: 'destructive' }); return; }
    await supabase.rpc('log_continuity_event', {
      _request_id: caseData.id, _event_type: 'message_sent',
      _event_description: `Message sent: ${subject || '(no subject)'}`,
      _action_details: { template: tpl }, _affected_account_id: caseData.account_id,
    });
    setSubject(''); setBody(''); setTpl(''); load(); onChange();
    toast({ title: 'Message recorded', description: 'Message logged in case timeline and audit log.' });
  };

  return (
    <div className="space-y-4 pt-4">
      {canSend && (
        <div className="space-y-2 border border-border rounded-md p-3 bg-background">
          <Select value={tpl} onValueChange={applyTemplate}>
            <SelectTrigger className="h-8"><SelectValue placeholder="Choose a template (optional)" /></SelectTrigger>
            <SelectContent>
              {MESSAGE_TEMPLATES.map((t) => <SelectItem key={t.key} value={t.key}>{t.subject}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
          <Textarea rows={4} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Message body…" />
          <div className="flex justify-end"><Button size="sm" onClick={send}>Send Message</Button></div>
        </div>
      )}
      {!canSend && <p className="text-xs text-muted-foreground">{readOnly ? 'This case is read-only.' : CAP_REQUIREMENT_HELP.send_messages}</p>}
      <div className="space-y-2">
        {msgs.length === 0 && <p className="text-sm text-muted-foreground">No messages have been sent.</p>}
        {msgs.map((m) => (
          <div key={m.id} className="border border-border rounded-md p-3 bg-background">
            <div className="flex justify-between items-center mb-1">
              <div className="text-sm font-medium">{m.subject || '(no subject)'}</div>
              <span className="text-xs text-muted-foreground">{new Date(m.created_at).toLocaleString()}</span>
            </div>
            <p className="text-sm whitespace-pre-wrap text-muted-foreground">{m.message_body}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CaseMessages;
