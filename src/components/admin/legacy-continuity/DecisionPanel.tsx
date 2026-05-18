// @ts-nocheck
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAdminRole } from '@/hooks/useAdminRole';
import {
  STATUS_OPTIONS, STATUS_LABEL, RISK_LEVELS, RISK_LABEL,
  DENIAL_REASONS, capabilitiesForRole, CAP_REQUIREMENT_HELP,
} from './constants';
import { toast } from '@/hooks/use-toast';
import { AlertTriangle, Shield, KeyRound, ArrowRightLeft, Ban, CheckCircle2 } from 'lucide-react';
import OwnershipTransferWizard from './OwnershipTransferWizard';

const DecisionPanel: React.FC<{ caseData: any; readOnly?: boolean; onChange: () => void }> = ({ caseData, readOnly, onChange }) => {
  const { role } = useAdminRole();
  const caps = capabilitiesForRole(role);

  const [statusOpen, setStatusOpen] = useState(false);
  const [newStatus, setNewStatus] = useState(caseData.status);
  const [statusNote, setStatusNote] = useState('');
  const [newRisk, setNewRisk] = useState(caseData.risk_level || 'low');

  const [holdOpen, setHoldOpen] = useState(false);
  const [holdReason, setHoldReason] = useState('');

  const [tempOpen, setTempOpen] = useState(false);
  const [tempPerms, setTempPerms] = useState({ view_records: true, export_records: false, billing_management: false, user_management: false, account_settings: false });
  const [tempExpires, setTempExpires] = useState('');
  const [tempReason, setTempReason] = useState('');

  const [denyOpen, setDenyOpen] = useState(false);
  const [denyReason, setDenyReason] = useState('');
  const [denyNotes, setDenyNotes] = useState('');

  const [transferOpen, setTransferOpen] = useState(false);

  const logEvent = async (event_type: string, desc: string, details: any = {}) =>
    supabase.rpc('log_continuity_event', {
      _request_id: caseData.id, _event_type: event_type, _event_description: desc,
      _action_details: details, _affected_account_id: caseData.account_id,
    });

  const saveStatus = async () => {
    if (!statusNote.trim()) { toast({ title: 'Internal note required', variant: 'destructive' }); return; }
    const patch: any = { status: newStatus, risk_level: newRisk, updated_at: new Date().toISOString() };
    if (newStatus === 'completed') patch.completed_at = new Date().toISOString();
    const { error } = await supabase.from('account_continuity_requests').update(patch).eq('id', caseData.id);
    if (error) { toast({ title: 'Update failed', description: error.message, variant: 'destructive' }); return; }
    const { data: u } = await supabase.auth.getUser();
    await supabase.from('continuity_notes').insert({
      request_id: caseData.id, note_category: 'decision_rationale',
      note_body: `Status changed to ${STATUS_LABEL[newStatus]}: ${statusNote}`, created_by: u.user?.id,
    });
    await logEvent('status_changed', `Status changed to ${STATUS_LABEL[newStatus]}`, { from: caseData.status, to: newStatus, note: statusNote, risk_level: newRisk });
    toast({ title: 'Status updated' });
    setStatusOpen(false); setStatusNote(''); onChange();
  };

  const applyHold = async () => {
    if (!holdReason.trim()) { toast({ title: 'Reason required', variant: 'destructive' }); return; }
    const { data: u } = await supabase.auth.getUser();
    const nowOn = !caseData.preservation_hold;
    const { error } = await supabase.from('account_continuity_requests').update({
      preservation_hold: nowOn,
      preservation_hold_reason: nowOn ? holdReason : null,
      preservation_hold_applied_at: nowOn ? new Date().toISOString() : null,
      preservation_hold_applied_by: nowOn ? u.user?.id : null,
    }).eq('id', caseData.id);
    if (error) { toast({ title: 'Failed', description: error.message, variant: 'destructive' }); return; }
    await logEvent(nowOn ? 'preservation_hold_applied' : 'preservation_hold_lifted', nowOn ? 'Preservation hold applied' : 'Preservation hold lifted', { reason: holdReason });
    setHoldOpen(false); setHoldReason(''); onChange();
  };

  const grantTemp = async () => {
    if (!tempExpires) { toast({ title: 'Expiration date required', variant: 'destructive' }); return; }
    if (!tempReason.trim()) { toast({ title: 'Internal reason required', variant: 'destructive' }); return; }
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from('continuity_temporary_access').insert({
      request_id: caseData.id, legacy_admin_id: caseData.requested_by_user_id,
      account_holder_id: caseData.account_id, account_id: caseData.account_id,
      granted_by: u.user?.id, permissions: tempPerms,
      starts_at: new Date().toISOString(), expires_at: new Date(tempExpires).toISOString(),
      reason: tempReason,
    });
    if (error) { toast({ title: 'Failed to grant access', description: error.message, variant: 'destructive' }); return; }
    await supabase.from('account_continuity_requests').update({ status: 'temporary_access_granted' }).eq('id', caseData.id);
    await logEvent('temp_access_granted', `Temporary access granted (expires ${new Date(tempExpires).toLocaleString()})`, { permissions: tempPerms, expires_at: tempExpires, reason: tempReason });
    toast({ title: 'Temporary access granted' });
    setTempOpen(false); setTempReason(''); setTempExpires(''); onChange();
  };

  const denyCase = async () => {
    if (!denyReason) { toast({ title: 'Denial reason required', variant: 'destructive' }); return; }
    if (!denyNotes.trim()) { toast({ title: 'Internal notes required', variant: 'destructive' }); return; }
    const { data: u } = await supabase.auth.getUser();
    const newMeta = { ...(caseData.metadata || {}), denial_reason: denyReason, denial_notes: denyNotes };
    const { error } = await supabase.from('account_continuity_requests').update({ status: 'denied', metadata: newMeta }).eq('id', caseData.id);
    if (error) { toast({ title: 'Failed', description: error.message, variant: 'destructive' }); return; }
    await supabase.from('continuity_notes').insert({
      request_id: caseData.id, note_category: 'decision_rationale',
      note_body: `Denied — ${denyReason}: ${denyNotes}`, created_by: u.user?.id,
    });
    await logEvent('request_denied', `Request denied: ${denyReason}`, { reason: denyReason, notes: denyNotes });
    toast({ title: 'Request denied' });
    setDenyOpen(false); onChange();
  };

  const completeCase = async () => {
    if (!['approved', 'denied'].includes(caseData.status)) {
      toast({ title: 'Complete is only available after approval or denial', variant: 'destructive' }); return;
    }
    const { error } = await supabase.from('account_continuity_requests').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', caseData.id);
    if (error) { toast({ title: 'Failed', description: error.message, variant: 'destructive' }); return; }
    await logEvent('case_completed', 'Case marked completed', {});
    onChange();
  };

  const ActionBtn = ({ cap, ...p }: any) => {
    const allowed = caps.has(cap) && !readOnly;
    return <Button {...p} disabled={!allowed || p.disabled} title={allowed ? '' : CAP_REQUIREMENT_HELP[cap]} />;
  };

  return (
    <div className="p-4 space-y-3">
      <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Decision Panel</h3>

      <ActionBtn cap="add_notes" className="w-full justify-start" variant="outline" size="sm" onClick={() => setStatusOpen(true)}>
        Change Status / Risk
      </ActionBtn>

      <ActionBtn cap="apply_preservation_hold" className="w-full justify-start" variant="outline" size="sm" onClick={() => setHoldOpen(true)}>
        <Shield className="h-3.5 w-3.5 mr-2" />
        {caseData.preservation_hold ? 'Lift Preservation Hold' : 'Apply Preservation Hold'}
      </ActionBtn>

      <ActionBtn cap="approve_temp_access" className="w-full justify-start" variant="outline" size="sm" onClick={() => setTempOpen(true)}>
        <KeyRound className="h-3.5 w-3.5 mr-2" /> Grant Temporary Access
      </ActionBtn>

      <ActionBtn cap="recommend_transfer" className="w-full justify-start" variant="outline" size="sm" onClick={() => setTransferOpen(true)}>
        <ArrowRightLeft className="h-3.5 w-3.5 mr-2" /> Start Ownership Transfer Review
      </ActionBtn>

      <Separator />

      <ActionBtn cap="add_notes" className="w-full justify-start" variant="outline" size="sm" onClick={() => setDenyOpen(true)}>
        <Ban className="h-3.5 w-3.5 mr-2" /> Deny Request
      </ActionBtn>

      <ActionBtn cap="archive" className="w-full justify-start" variant="default" size="sm" onClick={completeCase}>
        <CheckCircle2 className="h-3.5 w-3.5 mr-2" /> Complete Case
      </ActionBtn>

      <p className="text-xs text-muted-foreground pt-2">All actions are recorded in the case timeline and audit log.</p>

      {/* Status dialog */}
      <Dialog open={statusOpen} onOpenChange={setStatusOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Change Case Status</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Risk Level</Label>
              <Select value={newRisk} onValueChange={setNewRisk}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{RISK_LEVELS.map((r) => <SelectItem key={r} value={r}>{RISK_LABEL[r]}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Internal note (required)</Label>
              <Textarea value={statusNote} onChange={(e) => setStatusNote(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setStatusOpen(false)}>Cancel</Button>
            <Button onClick={saveStatus}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preservation hold */}
      <Dialog open={holdOpen} onOpenChange={setHoldOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{caseData.preservation_hold ? 'Lift Preservation Hold' : 'Apply Preservation Hold'}</DialogTitle></DialogHeader>
          <Alert><AlertDescription>Apply a preservation hold to restrict sensitive account changes while this continuity case is under review.</AlertDescription></Alert>
          <Textarea placeholder="Reason (required)" value={holdReason} onChange={(e) => setHoldReason(e.target.value)} />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setHoldOpen(false)}>Cancel</Button>
            <Button onClick={applyHold}>{caseData.preservation_hold ? 'Lift Hold' : 'Apply Hold'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Temporary access */}
      <Dialog open={tempOpen} onOpenChange={setTempOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Grant Temporary Access</DialogTitle></DialogHeader>
          <Alert><AlertDescription>Temporary access grants should be limited to the minimum access needed.</AlertDescription></Alert>
          <div className="space-y-3">
            <div>
              <Label>Expiration date & time (required)</Label>
              <Input type="datetime-local" value={tempExpires} onChange={(e) => setTempExpires(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Permissions</Label>
              {Object.entries(tempPerms).map(([k, v]) => (
                <label key={k} className="flex items-center gap-2 text-sm">
                  <Checkbox checked={!!v} onCheckedChange={(c) => setTempPerms({ ...tempPerms, [k]: !!c })} />
                  <span className="capitalize">{k.replace(/_/g, ' ')}</span>
                </label>
              ))}
            </div>
            <div>
              <Label>Internal reason (required)</Label>
              <Textarea value={tempReason} onChange={(e) => setTempReason(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setTempOpen(false)}>Cancel</Button>
            <Button onClick={grantTemp}>Grant Access</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deny */}
      <Dialog open={denyOpen} onOpenChange={setDenyOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Deny Request</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Select value={denyReason} onValueChange={setDenyReason}>
              <SelectTrigger><SelectValue placeholder="Denial reason" /></SelectTrigger>
              <SelectContent>{DENIAL_REASONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
            </Select>
            <Textarea placeholder="Internal notes (required)" value={denyNotes} onChange={(e) => setDenyNotes(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDenyOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={denyCase}>Deny Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <OwnershipTransferWizard
        open={transferOpen}
        onOpenChange={setTransferOpen}
        caseData={caseData}
        onChange={onChange}
      />
    </div>
  );
};

export default DecisionPanel;
