// @ts-nocheck
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Props { caseData: any; disabled: boolean; disabledReason?: string; onDone: () => void }

const ApproveClosureForm: React.FC<Props> = ({ caseData, disabled, disabledReason, onDone }) => {
  const [waitDays, setWaitDays] = useState(30);
  const [reason, setReason] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const execute = async () => {
    setBusy(true);
    const { error } = await supabase.rpc('approve_closure_request', {
      _request_id: caseData.id,
      _waiting_days: waitDays,
      _reason: reason,
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Closure approved — waiting period started');
    setOpen(false); onDone();
  };

  return (
    <Card>
      <CardHeader className="pb-3"><CardTitle className="text-base">Approve Account Closure</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <Alert>
          <AlertDescription className="text-xs">
            Closure cannot be completed immediately. A waiting period gives the account holder
            and any designated Legacy Admin an opportunity to dispute or pause the closure. A pre-closure snapshot
            is captured automatically when closure is completed.
          </AlertDescription>
        </Alert>
        <div>
          <Label className="text-sm">Waiting period (days) — minimum 30</Label>
          <Input
            type="number"
            min={30}
            max={180}
            value={waitDays}
            onChange={(e) => setWaitDays(Math.max(30, Number(e.target.value) || 30))}
            disabled={disabled}
          />
        </div>
        <div>
          <Label className="text-sm">Internal reason <span className="text-rose-600">*</span></Label>
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} disabled={disabled} rows={3} />
        </div>
        <Button onClick={() => setOpen(true)} disabled={disabled || !reason.trim() || waitDays < 30} className="w-full">
          Review & Approve Closure
        </Button>
        {disabled && disabledReason && <p className="text-xs text-muted-foreground">{disabledReason}</p>}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Closure Approval</DialogTitle>
            <DialogDescription>
              Starts a {waitDays}-day waiting period. Closure can only be completed after this period
              elapses (with a separate completion action), or cancelled at any time before then.
            </DialogDescription>
          </DialogHeader>
          <label className="flex items-start gap-2 text-sm">
            <Checkbox checked={confirm} onCheckedChange={(c) => setConfirm(!!c)} />
            I confirm this closure is appropriate and will be recorded in the audit log.
          </label>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={execute} disabled={!confirm || busy}>{busy ? 'Approving…' : 'Approve & Start Waiting Period'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ApproveClosureForm;
