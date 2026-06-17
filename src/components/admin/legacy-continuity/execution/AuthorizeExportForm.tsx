// @ts-nocheck
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Props { caseData: any; disabled: boolean; disabledReason?: string; onDone: () => void }

const SCOPE_KEYS = [
  { key: 'records', label: 'Account records' },
  { key: 'documents', label: 'Documents' },
  { key: 'photos', label: 'Photos & media' },
  { key: 'legacy_locker', label: 'Legacy Locker contents' },
  { key: 'memory_safe', label: 'Memory Safe' },
];

const AuthorizeExportForm: React.FC<Props> = ({ caseData, disabled, disabledReason, onDone }) => {
  const [scope, setScope] = useState<Record<string, boolean>>({
    records: true, documents: true, photos: false, legacy_locker: false, memory_safe: false,
  });
  const [expires, setExpires] = useState('');
  const [downloadLimit, setDownloadLimit] = useState(5);
  const [sensitive, setSensitive] = useState(false);
  const [reason, setReason] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const execute = async () => {
    setBusy(true);
    const selectedScope = SCOPE_KEYS.filter(s => scope[s.key]).map(s => s.key);
    const { error } = await supabase.rpc('authorize_continuity_export', {
      _request_id: caseData.id,
      _scope: selectedScope,
      _expires_at: new Date(expires).toISOString(),
      _download_limit: downloadLimit,
      _sensitive_areas_included: sensitive,
      _internal_reason: reason,
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Continuity export authorized');
    setOpen(false); onDone();
  };

  return (
    <Card>
      <CardHeader className="pb-3"><CardTitle className="text-base">Authorize Continuity Export</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          {SCOPE_KEYS.map(s => (
            <div key={s.key} className="flex items-center justify-between">
              <Label className="text-sm">{s.label}</Label>
              <Switch checked={scope[s.key]} onCheckedChange={(c) => setScope({ ...scope, [s.key]: c })} disabled={disabled} />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between rounded-md border border-amber-200 bg-amber-50 p-2">
          <Label className="text-sm text-amber-900">Include sensitive areas (Vault, financial)</Label>
          <Switch checked={sensitive} onCheckedChange={setSensitive} disabled={disabled} />
        </div>
        <div>
          <Label className="text-sm">Expiration date <span className="text-rose-600">*</span></Label>
          <Input type="datetime-local" value={expires} onChange={(e) => setExpires(e.target.value)} disabled={disabled} />
        </div>
        <div>
          <Label className="text-sm">Download limit</Label>
          <Input type="number" min={1} max={50} value={downloadLimit} onChange={(e) => setDownloadLimit(Number(e.target.value) || 1)} disabled={disabled} />
        </div>
        <div>
          <Label className="text-sm">Internal reason <span className="text-rose-600">*</span></Label>
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} disabled={disabled} rows={3} />
        </div>
        <Button onClick={() => setOpen(true)} disabled={disabled || !reason.trim() || !expires} className="w-full">
          Review & Authorize Export
        </Button>
        {disabled && disabledReason && <p className="text-xs text-muted-foreground">{disabledReason}</p>}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Continuity Export Authorization</DialogTitle>
            <DialogDescription>
              The Legacy Admin will be able to download the selected content until the
              expiration date or the download limit is reached. {sensitive ? 'Sensitive areas are included — handle with care.' : 'Sensitive areas are excluded.'}
            </DialogDescription>
          </DialogHeader>
          <label className="flex items-start gap-2 text-sm">
            <Checkbox checked={confirm} onCheckedChange={(c) => setConfirm(!!c)} />
            I confirm this export authorization is appropriate and will be recorded in the audit log.
          </label>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={execute} disabled={!confirm || busy}>{busy ? 'Authorizing…' : 'Authorize Export'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default AuthorizeExportForm;
