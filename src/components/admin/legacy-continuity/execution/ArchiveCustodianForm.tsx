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

interface Props { caseData: any; disabled: boolean; disabledReason?: string; onDone: () => void; }

const ArchiveCustodianForm: React.FC<Props> = ({ caseData, disabled, disabledReason, onDone }) => {
  const [perms, setPerms] = useState({ can_view: true, can_export: true, can_download: true });
  const [permanent, setPermanent] = useState(false);
  const [expires, setExpires] = useState('');
  const [reason, setReason] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const valid = reason.trim() && confirm && (permanent || expires);

  const execute = async () => {
    setBusy(true);
    const { error } = await supabase.rpc('execute_archive_custodian', {
      _request_id: caseData.id,
      _permissions: perms,
      _expires_at: permanent ? null : new Date(expires).toISOString(),
      _reason: reason,
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Archive custodian access granted');
    setOpen(false); onDone();
  };

  return (
    <Card>
      <CardHeader className="pb-3"><CardTitle className="text-base">Archive Custodian Settings</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          {Object.entries(perms).map(([k, v]) => (
            <div key={k} className="flex items-center justify-between">
              <Label htmlFor={`a-${k}`} className="text-sm">{k.replace('can_', '').replace(/^./, (c) => c.toUpperCase())}</Label>
              <Switch id={`a-${k}`} checked={v} onCheckedChange={(c) => setPerms({ ...perms, [k]: c })} disabled={disabled} />
            </div>
          ))}
          <p className="text-xs text-muted-foreground">Editing, deletion, user invites, and ownership changes are blocked by default in archive mode.</p>
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-sm">Permanent archive access</Label>
          <Switch checked={permanent} onCheckedChange={setPermanent} disabled={disabled} />
        </div>
        {!permanent && (
          <div>
            <Label className="text-sm">Expiration date <span className="text-rose-600">*</span></Label>
            <Input type="datetime-local" value={expires} onChange={(e) => setExpires(e.target.value)} disabled={disabled} />
          </div>
        )}
        <div>
          <Label className="text-sm">Internal reason <span className="text-rose-600">*</span></Label>
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} disabled={disabled} rows={3} />
        </div>
        <Button onClick={() => setOpen(true)} disabled={disabled || !reason.trim() || (!permanent && !expires)} className="w-full">
          Review & Grant Archive Custodian Access
        </Button>
        {disabled && disabledReason && <p className="text-xs text-muted-foreground">{disabledReason}</p>}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Archive Custodian Access</DialogTitle>
            <DialogDescription>
              You are about to grant preservation-focused access. The custodian will not be able to edit or delete account records.
            </DialogDescription>
          </DialogHeader>
          <label className="flex items-start gap-2 text-sm">
            <Checkbox checked={confirm} onCheckedChange={(c) => setConfirm(!!c)} />
            I confirm this grant is appropriate and will be recorded in the audit log.
          </label>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={execute} disabled={!valid || busy}>{busy ? 'Granting…' : 'Grant Custodian Access'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ArchiveCustodianForm;
