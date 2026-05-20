// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldCheck, Inbox, AlertTriangle, Clock, FileWarning, KeyRound, ArrowRightLeft, CheckCircle2, Archive, ScrollText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import RequestQueueTab from './RequestQueueTab';
import TemporaryAccessTab from './TemporaryAccessTab';
import OwnershipTransfersTab from './OwnershipTransfersTab';
import DeniedRequestsTab from './DeniedRequestsTab';
import ArchivedCasesTab from './ArchivedCasesTab';
import AuditLogTab from './AuditLogTab';
import CaseReviewDialog from './CaseReviewDialog';
import ExternalAssistanceTab from './ExternalAssistanceTab';

const LegacyContinuityWorkspace: React.FC = () => {
  const [tab, setTab] = useState('queue');
  const [metrics, setMetrics] = useState<any>({});
  const [openCaseId, setOpenCaseId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('account_continuity_requests')
        .select('status, risk_level, preservation_hold');
      if (!data) return;
      const m: any = {
        new: 0, under_review: 0, needs_docs: 0, high_risk: 0,
        temp_active: 0, transfer_pending: 0, completed: 0,
      };
      data.forEach((r: any) => {
        if (r.status === 'submitted') m.new++;
        if (r.status === 'under_review') m.under_review++;
        if (r.status === 'needs_documentation') m.needs_docs++;
        if (['elevated', 'critical'].includes(r.risk_level)) m.high_risk++;
        if (r.status === 'temporary_access_granted') m.temp_active++;
        if (r.status === 'ownership_transfer_pending') m.transfer_pending++;
        if (['completed', 'archived'].includes(r.status)) m.completed++;
      });
      setMetrics(m);
    })();
  }, [refreshKey]);

  const metricCards = [
    { label: 'New Requests', value: metrics.new ?? 0, icon: Inbox },
    { label: 'Under Review', value: metrics.under_review ?? 0, icon: Clock },
    { label: 'Needs Documentation', value: metrics.needs_docs ?? 0, icon: FileWarning },
    { label: 'High Risk', value: metrics.high_risk ?? 0, icon: AlertTriangle },
    { label: 'Temporary Stewardship Active', value: metrics.temp_active ?? 0, icon: KeyRound },
    { label: 'Continuity Actions Pending', value: metrics.transfer_pending ?? 0, icon: ArrowRightLeft },
    { label: 'Completed Cases', value: metrics.completed ?? 0, icon: CheckCircle2 },
  ];

  const openCase = (id: string) => setOpenCaseId(id);
  const handleRefresh = () => setRefreshKey((k) => k + 1);

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 pb-1 border-b border-border">
        <ShieldCheck className="h-6 w-6 text-muted-foreground mt-1" />
        <div>
          <h2 className="text-xl font-semibold">Continuity &amp; Preservation</h2>
          <p className="text-sm text-muted-foreground">
            Manual review workspace for Continuity &amp; Preservation cases. Asset Safe focuses on
            emergency access, stewardship, and preservation — not ownership transfer, inheritance,
            or estate adjudication. All decisions are recorded in the audit log.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {metricCards.map((c) => (
          <Card key={c.label} className="border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-1">
                <c.icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-2xl font-semibold tabular-nums">{c.value}</span>
              </div>
              <div className="text-xs text-muted-foreground leading-tight">{c.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid grid-cols-3 md:grid-cols-8 h-auto">
          <TabsTrigger value="queue">Request Queue</TabsTrigger>
          <TabsTrigger value="active">Active Reviews</TabsTrigger>
          <TabsTrigger value="external">External Assistance</TabsTrigger>
          <TabsTrigger value="temp">Temporary Stewardship</TabsTrigger>
          <TabsTrigger value="transfers">Continuity Actions</TabsTrigger>
          <TabsTrigger value="denied">Denied</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
          <TabsTrigger value="audit">
            <ScrollText className="h-3.5 w-3.5 mr-1" />Audit Log
          </TabsTrigger>
        </TabsList>

        <TabsContent value="queue">
          <RequestQueueTab onOpenCase={openCase} refreshKey={refreshKey} />
        </TabsContent>
        <TabsContent value="active">
          <RequestQueueTab onOpenCase={openCase} refreshKey={refreshKey} activeOnly />
        </TabsContent>
        <TabsContent value="external">
          <ExternalAssistanceTab refreshKey={refreshKey} />
        </TabsContent>
        <TabsContent value="temp">
          <TemporaryAccessTab onOpenCase={openCase} refreshKey={refreshKey} />
        </TabsContent>
        <TabsContent value="transfers">
          <OwnershipTransfersTab onOpenCase={openCase} refreshKey={refreshKey} />
        </TabsContent>
        <TabsContent value="denied">
          <DeniedRequestsTab onOpenCase={openCase} refreshKey={refreshKey} />
        </TabsContent>
        <TabsContent value="archived">
          <ArchivedCasesTab onOpenCase={openCase} refreshKey={refreshKey} />
        </TabsContent>
        <TabsContent value="audit">
          <AuditLogTab refreshKey={refreshKey} />
        </TabsContent>
      </Tabs>

      <CaseReviewDialog
        caseId={openCaseId}
        onClose={() => { setOpenCaseId(null); handleRefresh(); }}
      />
    </div>
  );
};

export default LegacyContinuityWorkspace;
