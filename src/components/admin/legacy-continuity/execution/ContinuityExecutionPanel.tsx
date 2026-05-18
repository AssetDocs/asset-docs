// @ts-nocheck
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAdminRole } from '@/hooks/useAdminRole';
import { capabilitiesForRole, CAP_REQUIREMENT_HELP } from '../constants';
import {
  EXECUTION_VISIBLE_STATUSES, EXECUTION_HIDDEN_STATUSES,
  EXECUTION_DISABLED_HELP, type TransferScope, type ChecklistItemState,
} from './executionConstants';
import { useContinuityExecution } from './useContinuityExecution';
import CurrentOwnershipSummary from './CurrentOwnershipSummary';
import ProposedSuccessorSummary from './ProposedSuccessorSummary';
import PreTransferChecklist, { computeCanExecute } from './PreTransferChecklist';
import TransferScopeSelector from './TransferScopeSelector';
import TemporaryStewardshipForm from './TemporaryStewardshipForm';
import ArchiveCustodianForm from './ArchiveCustodianForm';
import OwnershipTransferForm from './OwnershipTransferForm';
import TransferPreviewDialog from './TransferPreviewDialog';
import ExecutionCompletionScreen from './ExecutionCompletionScreen';

const ContinuityExecutionPanel: React.FC<{ caseData: any; onChange: () => void }> = ({ caseData, onChange }) => {
  const { role } = useAdminRole();
  const caps = useMemo(() => capabilitiesForRole(role), [role]);
  const [reloadKey, setReloadKey] = useState(0);
  const { snapshot, tempAccess, archiveAccess, history, ownershipMeta } = useContinuityExecution(caseData?.id, reloadKey);

  const [checklist, setChecklist] = useState<Record<string, ChecklistItemState>>({});
  const [scope, setScope] = useState<TransferScope | null>(caseData?.transfer_scope || null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewReviewed, setPreviewReviewed] = useState(false);

  // Reflect snapshot in checklist
  React.useEffect(() => {
    if (snapshot) setChecklist((c) => ({ ...c, snapshot_created: 'complete' }));
    if (scope) setChecklist((c) => ({ ...c, scope_selected: 'complete' }));
  }, [snapshot, scope]);

  if (EXECUTION_HIDDEN_STATUSES.has(caseData.status) && !history && !tempAccess.length && !archiveAccess.length) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base">Continuity Execution Panel</CardTitle></CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription className="text-sm">
              Execution controls are unavailable while this case is in <strong>{caseData.status}</strong>. The panel appears once the case is approved.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Completion state takes precedence
  if (history || (caseData.status === 'completed' && (tempAccess.length || archiveAccess.length))) {
    return <ExecutionCompletionScreen caseData={caseData} history={history} snapshot={snapshot} tempAccess={tempAccess} archiveAccess={archiveAccess} />;
  }

  if (!EXECUTION_VISIBLE_STATUSES.has(caseData.status)) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base">Continuity Execution Panel</CardTitle></CardHeader>
        <CardContent>
          <Alert><AlertDescription className="text-sm">This case is not in an approvable state.</AlertDescription></Alert>
        </CardContent>
      </Card>
    );
  }

  const checklistOk = computeCanExecute(checklist);
  const canExecuteTransfer = caps.has('execute_transfer');
  const canApproveAccess = caps.has('approve_temp_access');

  const handleSnapshot = () => setReloadKey((k) => k + 1);
  const handleDone = () => { setReloadKey((k) => k + 1); onChange(); };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Continuity Execution Panel</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This protected workflow is used to complete approved Legacy Continuity actions. Execution actions are logged, permissioned, and may affect account ownership, access, billing authority, and continuity settings.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CurrentOwnershipSummary accountId={caseData.account_id} />
        <ProposedSuccessorSummary caseData={caseData} />
      </div>

      <PreTransferChecklist values={checklist} onChange={(k, v) => setChecklist({ ...checklist, [k]: v })} />

      <TransferScopeSelector value={scope} onChange={setScope} />

      {!checklistOk && (
        <Alert><AlertDescription className="text-sm">{EXECUTION_DISABLED_HELP}</AlertDescription></Alert>
      )}

      {scope === 'temporary' && (
        <TemporaryStewardshipForm
          caseData={caseData}
          disabled={!checklistOk || !canApproveAccess}
          disabledReason={!canApproveAccess ? CAP_REQUIREMENT_HELP.approve_temp_access : EXECUTION_DISABLED_HELP}
          onDone={handleDone}
        />
      )}

      {scope === 'archive' && (
        <ArchiveCustodianForm
          caseData={caseData}
          disabled={!checklistOk || !canApproveAccess}
          disabledReason={!canApproveAccess ? CAP_REQUIREMENT_HELP.approve_temp_access : EXECUTION_DISABLED_HELP}
          onDone={handleDone}
        />
      )}

      {scope === 'transfer' && (
        <OwnershipTransferForm
          caseData={caseData}
          snapshot={snapshot}
          disabled={!checklistOk || !canExecuteTransfer}
          disabledReason={!canExecuteTransfer ? CAP_REQUIREMENT_HELP.execute_transfer : EXECUTION_DISABLED_HELP}
          previewReviewed={previewReviewed}
          onSnapshotCreated={handleSnapshot}
          onPreviewRequest={() => setPreviewOpen(true)}
          onDone={handleDone}
        />
      )}

      <TransferPreviewDialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        scope={scope}
        caseData={caseData}
        snapshot={snapshot}
        onAcknowledge={() => { setPreviewReviewed(true); setPreviewOpen(false); }}
      />
    </div>
  );
};

export default ContinuityExecutionPanel;
