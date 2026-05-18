// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Props {
  caseData: any;
  snapshot: any | null;
  disabled: boolean;
  disabledReason?: string;
  previewReviewed: boolean;
  onSnapshotCreated: () => void;
  onDone: () => void;
  onPreviewRequest: () => void;
}

const OwnershipTransferForm: React.FC<Props> = ({ caseData, snapshot, disabled, disabledReason, previewReviewed, onSnapshotCreated, onDone, onPreviewRequest }) => {
  const [reason, setReason] = useState('');
  const [seniorApprover, setSeniorApprover] = useState('');
  const [approvers, setApprovers] = useState<any[]>([]);
  const [confirm, setConfirm] = useState(false);
  const [typed, setTyped] = useState('');
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [snapBusy, setSnapBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: roles } = await supabase.from('user_roles').select('user_id, role').in('role', ['admin', 'owner']);
      if (!roles?.length) return setApprovers([]);
      const ids = [...new Set(roles.map((r: any) => r.user_id))];
      const { data: profs } = await supabase.from('profiles').select('user_id,first_name,last_name').in('user_id', ids);
      setApprovers((profs || []).map((p: any) => ({ id: p.user_id, name: [p.first_name, p.last_name].filter(Boolean).join(' ') || p.user_id.slice(0,8) })));
    })();
  }, []);

  const createSnapshot = async () => {
    setSnapBusy(true);
    const { error } = await supabase.rpc('create_continuity_snapshot', { _request_id: caseData.id });
    setSnapBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Snapshot created');
    onSnapshotCreated();
  };

  const valid = reason.trim() && seniorApprover && snapshot && previewReviewed && confirm && typed === 'TRANSFER';

  const execute = async () => {
    setBusy(true);
    const { error } = await supabase.rpc('execute_ownership_transfer', {
      _request_id: caseData.id,
      _reason: reason,
      _senior_approver_id: seniorApprover,
      _snapshot_reference: snapshot?.snapshot_reference,
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Ownership transferred');
    setOpen(false); onDone();
  };

  return (
    <Card>
      <CardHeader className="pb-3"><CardTitle className="text-base">Full Ownership Transfer</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div className="rounded-md border border-border p-3 bg-muted/30 text-sm">
          <div className="font-medium mb-1">Pre-execution snapshot</div>
          {snapshot ? (
            <div className="text-xs">
              <div className="font-mono break-all">{snapshot.snapshot_reference}</div>
              <div className="text-muted-foreground">Created {new Date(snapshot.created_at).toLocaleString()}</div>
            </div>
          ) : (
            <Button size="sm" variant="outline" onClick={createSnapshot} disabled={snapBusy || disabled}>
              {snapBusy ? 'Creating…' : 'Create Snapshot'}
            </Button>
          )}
        </div>

        <div>
          <Label className="text-sm">Senior approver <span className="text-rose-600">*</span></Label>
          <Select value={seniorApprover} onValueChange={setSeniorApprover} disabled={disabled}>
            <SelectTrigger><SelectValue placeholder="Select senior reviewer" /></SelectTrigger>
            <SelectContent>
              {approvers.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm">Transfer rationale <span className="text-rose-600">*</span></Label>
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} disabled={disabled} rows={3} placeholder="Document the basis for permanent transfer" />
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onPreviewRequest} disabled={disabled} className="flex-1">
            {previewReviewed ? '✓ Preview Reviewed' : 'Review Transfer Preview'}
          </Button>
          <Button onClick={() => setOpen(true)} disabled={disabled || !snapshot || !reason.trim() || !seniorApprover || !previewReviewed} className="flex-1">
            Execute Ownership Transfer
          </Button>
        </div>
        {disabled && disabledReason && <p className="text-xs text-muted-foreground">{disabledReason}</p>}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Ownership Transfer</DialogTitle>
            <DialogDescription className="space-y-2 pt-2">
              <p>You are about to permanently transfer ownership of this Asset Safe account.</p>
              <p>This action will:</p>
              <ul className="list-disc pl-5 text-xs">
                <li>Grant full account control to the designated Legacy Admin</li>
                <li>Archive ownership authority from the current owner</li>
                <li>Transfer billing and administrative privileges</li>
                <li>Transfer Secure Vault and export authority</li>
                <li>Require the new owner to set new continuity preferences</li>
                <li>Create a permanent ownership history record</li>
                <li>Create immutable audit log entries</li>
              </ul>
              <p className="font-semibold">This action may be irreversible.</p>
            </DialogDescription>
          </DialogHeader>
          <label className="flex items-start gap-2 text-sm">
            <Checkbox checked={confirm} onCheckedChange={(c) => setConfirm(!!c)} />
            I understand this action permanently transfers account ownership and will be recorded in the audit log.
          </label>
          <div>
            <Label className="text-sm">Type <span className="font-mono font-bold">TRANSFER</span> to confirm</Label>
            <Input value={typed} onChange={(e) => setTyped(e.target.value)} placeholder="TRANSFER" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={execute} disabled={!valid || busy}>
              {busy ? 'Executing…' : 'Execute Ownership Transfer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default OwnershipTransferForm;
