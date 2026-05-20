// @ts-nocheck
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Props { caseData: any; disabled: boolean; disabledReason?: string; onDone: () => void }

const PreservationForm: React.FC<Props> = ({ caseData, disabled, disabledReason, onDone }) => {
  const [stateType, setStateType] = useState('full_preservation');
  const [restrictions, setRestrictions] = useState({
    block_deletion: true,
    block_modification: true,
    block_billing_changes: true,
    block_user_changes: true,
  });
  const [reason, setReason] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const execute = async () => {
    setBusy(true);
    const { error } = await supabase.rpc('execute_preservation_mode', {
      _request_id: caseData.id,
      _state_type: stateType,
      _restrictions: restrictions,
      _reason: reason,
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Preservation mode activated');
    setOpen(false); onDone();
  };

  return (
    <Card>
      <CardHeader className="pb-3"><CardTitle className="text-base">Preservation Mode Settings</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">
          Preservation mode protects the account from destructive changes without altering ownership.
        </p>
        <div>
          <Label className="text-sm">Preservation type</Label>
          <Select value={stateType} onValueChange={setStateType} disabled={disabled}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="full_preservation">Full preservation (no destructive changes)</SelectItem>
              <SelectItem value="partial_preservation">Partial preservation (selected restrictions)</SelectItem>
              <SelectItem value="vault_only">Vault-only preservation</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          {Object.entries(restrictions).map(([k, v]) => (
            <div key={k} className="flex items-center justify-between">
              <Label htmlFor={`r-${k}`} className="text-sm capitalize">{k.replace(/_/g, ' ')}</Label>
              <Switch id={`r-${k}`} checked={v} onCheckedChange={(c) => setRestrictions({ ...restrictions, [k]: c })} disabled={disabled} />
            </div>
          ))}
        </div>
        <div>
          <Label className="text-sm">Internal reason <span className="text-rose-600">*</span></Label>
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} disabled={disabled} rows={3} />
        </div>
        <Button onClick={() => setOpen(true)} disabled={disabled || !reason.trim()} className="w-full">
          Review & Activate Preservation
        </Button>
        {disabled && disabledReason && <p className="text-xs text-muted-foreground">{disabledReason}</p>}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Preservation Mode</DialogTitle>
            <DialogDescription>
              The selected restrictions will be enforced. Ownership and access remain unchanged.
            </DialogDescription>
          </DialogHeader>
          <label className="flex items-start gap-2 text-sm">
            <Checkbox checked={confirm} onCheckedChange={(c) => setConfirm(!!c)} />
            I confirm this preservation action is appropriate and will be recorded in the audit log.
          </label>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={execute} disabled={!confirm || busy}>{busy ? 'Activating…' : 'Activate Preservation'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default PreservationForm;
