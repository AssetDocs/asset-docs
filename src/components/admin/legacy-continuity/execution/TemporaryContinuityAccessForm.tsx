// @ts-nocheck
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { DEFAULT_TEMP_PERMISSIONS, TEMP_PERMISSION_LABEL } from './executionConstants';

interface Props { caseData: any; disabled: boolean; disabledReason?: string; onDone: () => void; }

const TemporaryContinuityAccessForm: React.FC<Props> = ({ caseData, disabled, disabledReason, onDone }) => {
  const [perms, setPerms] = useState({ ...DEFAULT_TEMP_PERMISSIONS });
  const [expires, setExpires] = useState('');
  const [reason, setReason] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const valid = expires && reason.trim() && confirm;

  const execute = async () => {
    setBusy(true);
    const { error } = await supabase.rpc('execute_temporary_stewardship', {
      _request_id: caseData.id,
      _permissions: perms,
      _expires_at: new Date(expires).toISOString(),
      _reason: reason,
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Temporary continuity access granted');
    setOpen(false); onDone();
  };

  return (
    <Card>
      <CardHeader className="pb-3"><CardTitle className="text-base">Temporary Continuity Access Settings</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          {Object.entries(perms).map(([k, v]) => (
            <div key={k} className="flex items-center justify-between">
              <Label htmlFor={`p-${k}`} className="text-sm">{TEMP_PERMISSION_LABEL[k]}</Label>
              <Switch id={`p-${k}`} checked={v} onCheckedChange={(c) => setPerms({ ...perms, [k]: c })} disabled={disabled} />
            </div>
          ))}
        </div>
        <div>
          <Label className="text-sm">Expiration date <span className="text-rose-600">*</span></Label>
          <Input type="datetime-local" value={expires} onChange={(e) => setExpires(e.target.value)} disabled={disabled} />
        </div>
        <div>
          <Label className="text-sm">Internal reason <span className="text-rose-600">*</span></Label>
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} disabled={disabled} placeholder="Why is this temporary continuity access being granted?" rows={3} />
        </div>
        <Button onClick={() => setOpen(true)} disabled={disabled || !expires || !reason.trim()} className="w-full">
          Review & Grant Temporary Continuity Access
        </Button>
        {disabled && disabledReason && <p className="text-xs text-muted-foreground">{disabledReason}</p>}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Temporary Continuity Access</DialogTitle>
            <DialogDescription>
              You are about to grant time-bound access to this account. Ownership will not change. Access will expire automatically on the selected expiration date.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 text-sm">
            <div>Expires: <strong>{expires && new Date(expires).toLocaleString()}</strong></div>
            <div>Enabled: {Object.entries(perms).filter(([,v])=>v).map(([k])=>TEMP_PERMISSION_LABEL[k]).join(', ') || 'None'}</div>
          </div>
          <label className="flex items-start gap-2 text-sm">
            <Checkbox checked={confirm} onCheckedChange={(c) => setConfirm(!!c)} />
            I confirm this grant is appropriate and will be recorded in the audit log.
          </label>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={execute} disabled={!valid || busy}>{busy ? 'Granting...' : 'Grant Access'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default TemporaryContinuityAccessForm;
