// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAdminRole } from '@/hooks/useAdminRole';
import {
  DOC_VERIFICATION_OPTIONS, DOC_VERIFICATION_LABEL, DOC_VERIFICATION_BADGE,
  capabilitiesForRole, CAP_REQUIREMENT_HELP,
} from './constants';
import { toast } from '@/hooks/use-toast';
import { Download, Eye } from 'lucide-react';

const CaseDocuments: React.FC<{ caseData: any; readOnly?: boolean; onChange: () => void }> = ({ caseData, readOnly, onChange }) => {
  const [docs, setDocs] = useState<any[]>([]);
  const { role } = useAdminRole();
  const caps = capabilitiesForRole(role);
  const canReview = caps.has('review_documents') && !readOnly;

  const sync = async () => {
    // Pull metadata-uploaded docs from request.metadata.documents and merge with continuity_documents
    const meta = caseData.metadata?.documents || [];
    const { data: existing } = await supabase.from('continuity_documents').select('*').eq('request_id', caseData.id);
    const existingPaths = new Set((existing || []).map((d: any) => d.file_path));
    const toInsert = meta.filter((m: any) => !existingPaths.has(m.path)).map((m: any) => ({
      request_id: caseData.id,
      file_name: m.name, file_path: m.path, file_size: m.size,
      document_category: m.category, uploaded_by: caseData.requested_by_user_id,
    }));
    if (toInsert.length) await supabase.from('continuity_documents').insert(toInsert);
    const { data } = await supabase.from('continuity_documents').select('*').eq('request_id', caseData.id).order('uploaded_at');
    setDocs(data || []);
  };

  useEffect(() => { sync(); }, [caseData?.id]);

  const updateDoc = async (id: string, patch: any, eventDetail: any) => {
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from('continuity_documents').update({ ...patch, reviewed_by: u.user?.id, reviewed_at: new Date().toISOString() }).eq('id', id);
    if (error) { toast({ title: 'Update failed', description: error.message, variant: 'destructive' }); return; }
    await supabase.rpc('log_continuity_event', {
      _request_id: caseData.id, _event_type: 'document_reviewed',
      _event_description: `Document marked ${patch.verification_status || 'updated'}`,
      _action_details: eventDetail, _affected_account_id: caseData.account_id,
    });
    sync(); onChange();
  };

  const viewDoc = async (d: any) => {
    const { data, error } = await supabase.storage.from('continuity-documents').createSignedUrl(d.file_path, 3600);
    if (error) { toast({ title: 'Cannot view file', description: error.message, variant: 'destructive' }); return; }
    await supabase.rpc('log_continuity_event', {
      _request_id: caseData.id, _event_type: 'document_viewed',
      _event_description: `Viewed ${d.file_name}`, _action_details: { document_id: d.id },
      _affected_account_id: caseData.account_id,
    });
    window.open(data.signedUrl, '_blank');
  };

  return (
    <div className="space-y-3 pt-4">
      {docs.length === 0 && <p className="text-sm text-muted-foreground">No supporting documents uploaded.</p>}
      {docs.map((d) => (
        <Card key={d.id} className="border-border">
          <CardContent className="p-4 space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="text-sm font-medium">{d.file_name}</div>
                <div className="text-xs text-muted-foreground">
                  {d.document_category || 'Uncategorized'} · uploaded {new Date(d.uploaded_at).toLocaleDateString()}
                </div>
              </div>
              <Badge variant="outline" className={DOC_VERIFICATION_BADGE[d.verification_status]}>{DOC_VERIFICATION_LABEL[d.verification_status]}</Badge>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <Button size="sm" variant="outline" onClick={() => viewDoc(d)}><Eye className="h-3 w-3 mr-1" /> View</Button>
              <Button size="sm" variant="ghost" onClick={() => viewDoc(d)}><Download className="h-3 w-3 mr-1" /> Download</Button>
              <Select
                value={d.verification_status}
                disabled={!canReview}
                onValueChange={(v) => updateDoc(d.id, { verification_status: v }, { document_id: d.id, status: v })}
              >
                <SelectTrigger className="w-52 h-8" title={canReview ? '' : CAP_REQUIREMENT_HELP.review_documents}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DOC_VERIFICATION_OPTIONS.map((s) => <SelectItem key={s} value={s}>{DOC_VERIFICATION_LABEL[s]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {canReview && (
              <Textarea
                placeholder="Reviewer notes…"
                defaultValue={d.reviewer_notes || ''}
                onBlur={(e) => {
                  if (e.target.value !== (d.reviewer_notes || '')) {
                    updateDoc(d.id, { reviewer_notes: e.target.value }, { document_id: d.id, note: 'updated' });
                  }
                }}
                className="text-xs"
              />
            )}
            {!canReview && d.reviewer_notes && (
              <p className="text-xs text-muted-foreground">{d.reviewer_notes}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CaseDocuments;
