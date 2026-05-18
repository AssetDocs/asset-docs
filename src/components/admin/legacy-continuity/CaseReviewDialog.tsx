// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { STATUS_BADGE_CLASS, STATUS_LABEL, RISK_BADGE_CLASS, RISK_LABEL, REQUEST_TYPE_LABEL } from './constants';
import CaseSummarySidebar from './CaseSummarySidebar';
import DecisionPanel from './DecisionPanel';
import CaseDocuments from './CaseDocuments';
import CaseChecklist from './CaseChecklist';
import CaseNotes from './CaseNotes';
import CaseMessages from './CaseMessages';
import CaseTimeline from './CaseTimeline';
import CaseRequestSummary from './CaseRequestSummary';

const CaseReviewDialog: React.FC<{ caseId: string | null; onClose: () => void }> = ({ caseId, onClose }) => {
  const [caseData, setCaseData] = useState<any>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const load = async () => {
    if (!caseId) return;
    const { data } = await supabase.from('account_continuity_requests').select('*').eq('id', caseId).maybeSingle();
    setCaseData(data);
  };
  useEffect(() => { load(); }, [caseId, reloadKey]);

  const refresh = () => setReloadKey((k) => k + 1);
  const isReadOnly = caseData && ['completed', 'archived'].includes(caseData.status);

  return (
    <Dialog open={!!caseId} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-7xl w-[95vw] h-[90vh] overflow-hidden p-0 flex flex-col">
        <DialogHeader className="px-6 py-4 border-b border-border">
          <DialogTitle className="flex flex-wrap items-center gap-3 text-base">
            <span className="font-mono text-xs text-muted-foreground">Case {caseId?.slice(0, 8)}…</span>
            {caseData && (
              <>
                <span className="font-semibold">{REQUEST_TYPE_LABEL[caseData.request_type] || caseData.request_type}</span>
                <Badge variant="outline" className={STATUS_BADGE_CLASS[caseData.status] || ''}>{STATUS_LABEL[caseData.status]}</Badge>
                <Badge variant="outline" className={RISK_BADGE_CLASS[caseData.risk_level || 'low']}>Risk: {RISK_LABEL[caseData.risk_level || 'low']}</Badge>
                {caseData.preservation_hold && <Badge variant="outline" className="bg-amber-50 text-amber-900 border-amber-200">Preservation Hold</Badge>}
                {isReadOnly && <Badge variant="outline">Read-only</Badge>}
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        {!caseData && <div className="flex-1 flex items-center justify-center text-muted-foreground">Loading case…</div>}

        {caseData && (
          <div className="flex-1 min-h-0 grid grid-cols-12 gap-0">
            <aside className="col-span-12 lg:col-span-3 border-r border-border overflow-y-auto bg-muted/20">
              <CaseSummarySidebar caseData={caseData} />
            </aside>

            <main className="col-span-12 lg:col-span-6 overflow-y-auto">
              <Tabs defaultValue="summary" className="p-4">
                <TabsList className="grid grid-cols-3 lg:grid-cols-6 h-auto">
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                  <TabsTrigger value="checklist">Checklist</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  <TabsTrigger value="notes">Notes</TabsTrigger>
                  <TabsTrigger value="messages">Messages</TabsTrigger>
                </TabsList>
                <TabsContent value="summary"><CaseRequestSummary caseData={caseData} /></TabsContent>
                <TabsContent value="documents"><CaseDocuments caseData={caseData} readOnly={isReadOnly} onChange={refresh} /></TabsContent>
                <TabsContent value="checklist"><CaseChecklist caseData={caseData} readOnly={isReadOnly} onChange={refresh} /></TabsContent>
                <TabsContent value="timeline"><CaseTimeline caseId={caseData.id} reloadKey={reloadKey} /></TabsContent>
                <TabsContent value="notes"><CaseNotes caseData={caseData} readOnly={isReadOnly} onChange={refresh} /></TabsContent>
                <TabsContent value="messages"><CaseMessages caseData={caseData} readOnly={isReadOnly} onChange={refresh} /></TabsContent>
              </Tabs>
            </main>

            <aside className="col-span-12 lg:col-span-3 border-l border-border overflow-y-auto bg-muted/20">
              <DecisionPanel caseData={caseData} onChange={refresh} readOnly={isReadOnly} />
            </aside>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CaseReviewDialog;
