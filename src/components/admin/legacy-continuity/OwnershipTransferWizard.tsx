// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAdminRole } from '@/hooks/useAdminRole';
import { capabilitiesForRole, CAP_REQUIREMENT_HELP, TRANSFER_STATUS_LABEL, TRANSFER_STATUS_BADGE } from './constants';
import { toast } from '@/hooks/use-toast';
import { AlertTriangle } from 'lucide-react';

const OwnershipTransferWizard: React.FC<{ open: boolean; onOpenChange: (v: boolean) => void; caseData: any; onChange: () => void }> = ({ open, onOpenChange, caseData, onChange }) => {
  const { role } = useAdminRole();
  const caps = capabilitiesForRole(role);
  const [transfer, setTransfer] = useState<any | null>(null);
  const [rationale, setRationale] = useState('');
  const [seniorNotes, setSeniorNotes] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const load = async () => {
    const { data } = await supabase.from('continuity_ownership_transfers').select('*').eq('request_id', caseData.id).order('created_at', { ascending: false }).maybeSingle();
    setTransfer(data);
  };
  useEffect(() => { if (open) load(); }, [open, caseData?.id]);

  const logEvent = async (event_type: string, desc: string, details: any = {}) =>
    supabase.rpc('log_continuity_event', {
      _request_id: caseData.id, _event_type: event_type, _event_description: desc,
      _action_details: details, _affected_account_id: caseData.account_id,
    });

  const recommend = async () => {
    if (!rationale.trim()) { toast({ title: 'Decision rationale required', variant: 'destructive' }); return; }
    const { data: acc } = await supabase.from('accounts').select('owner_user_id').eq('id', caseData.account_id).maybeSingle();
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from('continuity_ownership_transfers').insert({
      request_id: caseData.id, account_id: caseData.account_id,
      current_owner_id: acc?.owner_user_id, proposed_owner_id: caseData.requested_by_user_id,
      recommended_by: u.user?.id, recommendation_rationale: rationale,
      status: 'awaiting_senior_approval',
    });
    if (error) { toast({ title: 'Failed', description: error.message, variant: 'destructive' }); return; }
    await supabase.from('account_continuity_requests').update({ status: 'ownership_transfer_pending' }).eq('id', caseData.id);
    await logEvent('transfer_recommended', 'Ownership transfer recommended', { rationale });
    setRationale(''); load(); onChange();
  };

  const seniorApprove = async () => {
    const { data: u } = await supabase.auth.getUser();
    if (transfer.recommended_by === u.user?.id) { toast({ title: 'Senior approval must be from a different reviewer', variant: 'destructive' }); return; }
    await supabase.from('continuity_ownership_transfers').update({
      status: 'approved_for_invitation', senior_approved_by: u.user?.id,
      senior_approved_at: new Date().toISOString(), senior_approval_notes: seniorNotes,
    }).eq('id', transfer.id);
    await logEvent('transfer_senior_approved', 'Senior reviewer approved ownership transfer', { notes: seniorNotes });
    setSeniorNotes(''); load(); onChange();
  };

  const sendInvitation = async () => {
    await supabase.from('continuity_ownership_transfers').update({
      status: 'invitation_sent', invitation_sent_at: new Date().toISOString(),
    }).eq('id', transfer.id);
    await logEvent('transfer_invitation_sent', 'Ownership transfer invitation sent to Legacy Admin');
    load(); onChange();
    toast({ title: 'Invitation recorded', description: 'Ownership will not transfer until the Legacy Admin accepts.' });
  };

  const markAccepted = async () => {
    await supabase.from('continuity_ownership_transfers').update({
      status: 'ready_to_execute', accepted_at: new Date().toISOString(),
      identity_confirmed_at: new Date().toISOString(), terms_accepted_at: new Date().toISOString(),
    }).eq('id', transfer.id);
    await logEvent('transfer_accepted', 'Legacy Admin accepted ownership transfer');
    load(); onChange();
  };

  const execute = async () => {
    if (!acceptedTerms || confirmText !== 'TRANSFER') { toast({ title: 'Confirmation required', variant: 'destructive' }); return; }
    const { data: u } = await supabase.auth.getUser();
    // Update accounts.owner_user_id
    const { error: e1 } = await supabase.from('accounts').update({ owner_user_id: transfer.proposed_owner_id }).eq('id', caseData.account_id);
    if (e1) { toast({ title: 'Transfer failed', description: e1.message, variant: 'destructive' }); return; }
    await supabase.from('continuity_ownership_transfers').update({
      status: 'completed', executed_by: u.user?.id, executed_at: new Date().toISOString(),
    }).eq('id', transfer.id);
    await supabase.from('account_continuity_requests').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', caseData.id);
    await logEvent('transfer_executed', 'Ownership transfer executed', { previous_owner: transfer.current_owner_id, new_owner: transfer.proposed_owner_id });
    toast({ title: 'Ownership transfer completed' });
    setAcceptedTerms(false); setConfirmText(''); load(); onChange();
  };

  const cancel = async () => {
    await supabase.from('continuity_ownership_transfers').update({ status: 'cancelled', cancelled_at: new Date().toISOString() }).eq('id', transfer.id);
    await logEvent('transfer_cancelled', 'Ownership transfer cancelled');
    load(); onChange();
  };

  const canRecommend = caps.has('recommend_transfer');
  const canSeniorApprove = caps.has('senior_approve_transfer');
  const canExecute = caps.has('execute_transfer');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ownership Transfer Review</DialogTitle>
          <DialogDescription>
            Ownership transfer is permanent and requires multi-step review. Starting this process does not immediately transfer the account.
          </DialogDescription>
        </DialogHeader>

        {transfer && (
          <div className="mb-2"><Badge variant="outline" className={TRANSFER_STATUS_BADGE[transfer.status]}>{TRANSFER_STATUS_LABEL[transfer.status]}</Badge></div>
        )}

        {/* Step 1 */}
        {!transfer && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Step 1 — Reviewer Recommendation</h4>
            <Textarea placeholder="Decision rationale (required). Confirm checklist and verified documentation." value={rationale} onChange={(e) => setRationale(e.target.value)} rows={4} />
            <Button onClick={recommend} disabled={!canRecommend} title={canRecommend ? '' : CAP_REQUIREMENT_HELP.recommend_transfer}>Recommend Ownership Transfer</Button>
          </div>
        )}

        {transfer && (
          <div className="space-y-4">
            <div className="text-xs text-muted-foreground space-y-1 border border-border rounded-md p-3 bg-background">
              <div>Recommended by: <span className="font-mono">{transfer.recommended_by?.slice(0, 8)}…</span> on {new Date(transfer.recommended_at).toLocaleString()}</div>
              <div className="whitespace-pre-wrap"><span className="text-muted-foreground">Rationale:</span> {transfer.recommendation_rationale}</div>
              {transfer.senior_approved_by && <div>Senior approver: <span className="font-mono">{transfer.senior_approved_by.slice(0, 8)}…</span> on {new Date(transfer.senior_approved_at).toLocaleString()}</div>}
            </div>

            {/* Step 2 */}
            {transfer.status === 'awaiting_senior_approval' && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Step 2 — Senior Approval</h4>
                <Textarea placeholder="Senior approval notes (optional)" value={seniorNotes} onChange={(e) => setSeniorNotes(e.target.value)} />
                <Button onClick={seniorApprove} disabled={!canSeniorApprove} title={canSeniorApprove ? '' : CAP_REQUIREMENT_HELP.senior_approve_transfer}>Senior Approve</Button>
              </div>
            )}

            {/* Step 3 */}
            {transfer.status === 'approved_for_invitation' && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Step 3 — Send Ownership Acceptance Invitation</h4>
                <Alert><AlertDescription>An ownership transfer invitation will be sent to the Legacy Admin. Ownership will not transfer until the Legacy Admin accepts and completes any required acknowledgement steps.</AlertDescription></Alert>
                <Button onClick={sendInvitation}>Send Invitation</Button>
              </div>
            )}

            {/* Step 4 */}
            {['invitation_sent', 'awaiting_acceptance'].includes(transfer.status) && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Step 4 — Acceptance Status</h4>
                <ul className="text-sm space-y-1">
                  <li>Invitation sent: {transfer.invitation_sent_at ? new Date(transfer.invitation_sent_at).toLocaleString() : '—'}</li>
                  <li>Accepted: {transfer.accepted_at ? new Date(transfer.accepted_at).toLocaleString() : '—'}</li>
                </ul>
                <Button variant="outline" onClick={markAccepted}>Mark Acceptance Confirmed</Button>
              </div>
            )}

            {/* Step 5 */}
            {transfer.status === 'ready_to_execute' && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Step 5 — Execute Transfer</h4>
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Confirm Ownership Transfer</AlertTitle>
                  <AlertDescription>This action will permanently transfer account ownership. The original ownership record will be archived in the case history and audit log. This action must only be completed after Asset Safe has verified the request, documentation, and authority.</AlertDescription>
                </Alert>
                <label className="flex items-start gap-2 text-sm">
                  <Checkbox checked={acceptedTerms} onCheckedChange={(c) => setAcceptedTerms(!!c)} />
                  <span>I understand this action permanently transfers account ownership and will be recorded in the audit log.</span>
                </label>
                <div>
                  <Label>Type TRANSFER to confirm</Label>
                  <Input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} />
                </div>
                <Button variant="destructive" onClick={execute} disabled={!canExecute || !acceptedTerms || confirmText !== 'TRANSFER'} title={canExecute ? '' : CAP_REQUIREMENT_HELP.execute_transfer}>
                  Execute Ownership Transfer
                </Button>
              </div>
            )}

            {transfer.status === 'completed' && (
              <Alert><AlertDescription>Ownership transfer completed on {new Date(transfer.executed_at).toLocaleString()}.</AlertDescription></Alert>
            )}

            {!['completed', 'cancelled'].includes(transfer.status) && (
              <div className="pt-2 border-t border-border">
                <Button variant="ghost" size="sm" onClick={cancel}>Cancel Transfer Review</Button>
              </div>
            )}
          </div>
        )}

        <DialogFooter><Button variant="ghost" onClick={() => onOpenChange(false)}>Close</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OwnershipTransferWizard;
