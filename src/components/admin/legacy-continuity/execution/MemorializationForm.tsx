// @ts-nocheck
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Props { caseData: any; disabled: boolean; disabledReason?: string; onDone: () => void }

const MemorializationForm: React.FC<Props> = ({ caseData, disabled, disabledReason, onDone }) => {
  const [access, setAccess] = useState('view_only');
  const [exportAllowed, setExportAllowed] = useState(false);
  const [billing, setBilling] = useState('paused');
  const [reason, setReason] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const execute = async () => {
    setBusy(true);
    const { error } = await supabase.rpc('execute_memorialization', {
      _request_id: caseData.id,
      _steward_access_level: access,
      _export_allowed: exportAllowed,
      _billing_handling_status: billing,
      _reason: reason,
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Account memorialized');
    setOpen(false); onDone();
  };

  return (
    <Card>
      <CardHeader className="pb-3"><CardTitle className="text-base">Memorialization Settings</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">
          Memorialization honors the account holder. The account is preserved in a
          protected read-only state. Ownership is not transferred.
        </p>
        <div>
          <Label className="text-sm">Continuity access level</Label>
          <Select value={access} onValueChange={setAccess} disabled={disabled}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="view_only">View only</SelectItem>
              <SelectItem value="view_and_export">View and export</SelectItem>
              <SelectItem value="no_access">No access</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-sm">Allow controlled exports</Label>
          <Switch checked={exportAllowed} onCheckedChange={setExportAllowed} disabled={disabled} />
        </div>
        <div>
          <Label className="text-sm">Billing handling</Label>
          <Select value={billing} onValueChange={setBilling} disabled={disabled}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="paused">Pause billing</SelectItem>
              <SelectItem value="cancel">Cancel billing</SelectItem>
              <SelectItem value="continue">Continue billing</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-sm">Internal reason <span className="text-rose-600">*</span></Label>
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} disabled={disabled} rows={3} placeholder="Why is this account being memorialized?" />
        </div>
        <Button onClick={() => setOpen(true)} disabled={disabled || !reason.trim()} className="w-full">
          Review & Activate Memorialization
        </Button>
        {disabled && disabledReason && <p className="text-xs text-muted-foreground">{disabledReason}</p>}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Memorialization</DialogTitle>
            <DialogDescription>
              The account will be placed in a protected memorialized state. Ownership is preserved,
              not transferred. This action is reversible by Senior Administrators.
            </DialogDescription>
          </DialogHeader>
          <div className="text-sm space-y-1">
            <div>Continuity access: <strong>{access}</strong></div>
            <div>Exports allowed: <strong>{exportAllowed ? 'Yes' : 'No'}</strong></div>
            <div>Billing: <strong>{billing}</strong></div>
          </div>
          <label className="flex items-start gap-2 text-sm">
            <Checkbox checked={confirm} onCheckedChange={(c) => setConfirm(!!c)} />
            I confirm this action is appropriate and will be recorded in the audit log.
          </label>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={execute} disabled={!confirm || busy}>{busy ? 'Activating…' : 'Activate Memorialization'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default MemorializationForm;
