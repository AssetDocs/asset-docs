// @ts-nocheck
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2 } from 'lucide-react';

const Row = ({ label, value }: any) => (
  <div className="flex justify-between gap-4 py-1 text-sm">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium text-right break-all">{value ?? '—'}</span>
  </div>
);

const ExecutionCompletionScreen: React.FC<{ caseData: any; history: any; snapshot: any; tempAccess: any[]; archiveAccess: any[] }> = ({ caseData, history, snapshot, tempAccess, archiveAccess }) => {
  const isTransfer = !!history;
  const activeTemp = tempAccess.find((t) => t.status === 'active');
  const activeArchive = archiveAccess.find((a) => a.status === 'active');

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          {isTransfer ? 'Ownership Transfer Completed' : activeArchive ? 'Archive Custodian Access Granted' : 'Temporary Continuity Access Granted'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <p className="text-sm text-muted-foreground mb-3">
          {isTransfer
            ? 'Ownership has been transferred through the Legacy Continuity workflow. The previous ownership state has been archived, the new owner has been assigned, and all actions have been recorded in the case history and audit log.'
            : 'Access has been provisioned and recorded in the case history and audit log.'}
        </p>
        <Row label="Case ID" value={<span className="font-mono text-xs">{caseData.id.slice(0,8)}…</span>} />
        <Row label="Account ID" value={<span className="font-mono text-xs">{caseData.account_id?.slice(0,8)}…</span>} />
        {isTransfer && (
          <>
            <Row label="Previous owner" value={<span className="font-mono text-xs">{history.previous_owner_id?.slice(0,8)}…</span>} />
            <Row label="New owner" value={<span className="font-mono text-xs">{history.new_owner_id?.slice(0,8)}…</span>} />
            <Row label="Executed by" value={<span className="font-mono text-xs">{history.executed_by_admin_id?.slice(0,8)}…</span>} />
            <Row label="Senior approver" value={<span className="font-mono text-xs">{history.senior_approver_id?.slice(0,8)}…</span>} />
            <Row label="Transfer timestamp" value={new Date(history.execution_timestamp).toLocaleString()} />
            <Row label="Snapshot reference" value={<span className="font-mono text-xs">{history.snapshot_reference}</span>} />
            <Row label="Continuity setup" value={<Badge variant="outline" className="bg-amber-50 text-amber-900 border-amber-200">Required</Badge>} />
            <Row label="Account tag" value={<Badge variant="outline">Transferred via Legacy Continuity</Badge>} />
          </>
        )}
        {activeTemp && !isTransfer && (
          <>
            <Row label="Grant" value="Temporary Continuity Access" />
            <Row label="Expires" value={activeTemp.expires_at ? new Date(activeTemp.expires_at).toLocaleString() : '—'} />
          </>
        )}
        {activeArchive && !isTransfer && (
          <>
            <Row label="Grant" value="Archive Custodian" />
            <Row label="Expires" value={activeArchive.expires_at ? new Date(activeArchive.expires_at).toLocaleString() : 'Permanent'} />
          </>
        )}
        {snapshot && <Row label="Snapshot" value={<span className="font-mono text-xs">{snapshot.snapshot_reference}</span>} />}
      </CardContent>
    </Card>
  );
};

export default ExecutionCompletionScreen;
