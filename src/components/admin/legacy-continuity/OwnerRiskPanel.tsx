// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ShieldAlert, Snowflake, Clock } from 'lucide-react';
import { notifyContinuityEvent } from '@/lib/continuityNotifications';

const FREEZE_TYPES = [
  { value: 'continuity_review', label: 'Continuity Review Freeze' },
  { value: 'fraud_security', label: 'Fraud / Security Freeze' },
  { value: 'legal_dispute', label: 'Legal Dispute Freeze' },
  { value: 'preservation_hold', label: 'Preservation Hold' },
];

const OwnerRiskPanel: React.FC<{ caseData: any; onChange: () => void }> = ({ caseData, onChange }) => {
  const [ownerPrefs, setOwnerPrefs] = useState<any>(null);
  const [consents, setConsents] = useState<any[]>([]);
  const [notifs, setNotifs] = useState<any[]>([]);
  const [freezes, setFreezes] = useState<any[]>([]);
  const [freezeType, setFreezeType] = useState('continuity_review');
  const [freezeReason, setFreezeReason] = useState('');
  const [bypassReason, setBypassReason] = useState('');

  const load = async () => {
    if (!caseData?.account_id) return;
    const { data: acc } = await supabase.from('accounts').select('owner_user_id').eq('id', caseData.account_id).maybeSingle();
    if (acc?.owner_user_id) {
      const { data: locker } = await supabase.from('legacy_locker')
        .select('continuity_preferences, continuity_preferences_version, continuity_preferences_reviewed_at')
        .eq('user_id', acc.owner_user_id).maybeSingle();
      setOwnerPrefs(locker);
    }
    const [{ data: c }, { data: n }, { data: f }] = await Promise.all([
      supabase.from('legacy_admin_consent_history').select('*').eq('account_id', caseData.account_id).order('consent_acknowledged_at', { ascending: false }),
      supabase.from('continuity_owner_notifications').select('*').eq('request_id', caseData.id).order('created_at', { ascending: false }),
      supabase.from('continuity_account_freezes').select('*').eq('account_id', caseData.account_id).order('applied_at', { ascending: false }),
    ]);
    setConsents(c || []); setNotifs(n || []); setFreezes(f || []);
  };

  useEffect(() => { load(); }, [caseData?.id]);

  const applyFreeze = async () => {
    if (!freezeReason.trim()) { toast.error('Freeze reason required'); return; }
    const { error } = await supabase.rpc('apply_account_freeze', {
      _account_id: caseData.account_id, _request_id: caseData.id, _freeze_type: freezeType, _reason: freezeReason,
    });
    if (error) { toast.error(error.message); return; }
    await notifyContinuityEvent(caseData.id, 'freeze_applied', { freeze_type: freezeType, reason: freezeReason });
    toast.success('Freeze applied'); setFreezeReason(''); load(); onChange();
  };

  const removeFreeze = async (id: string) => {
    const reason = prompt('Reason for removing this freeze?');
    if (!reason?.trim()) return;
    const { error } = await supabase.rpc('remove_account_freeze', { _freeze_id: id, _reason: reason });
    if (error) { toast.error(error.message); return; }
    toast.success('Freeze removed'); load(); onChange();
  };

  const resolveDispute = async () => {
    if (!confirm('Mark this dispute as resolved? The case will remain escalated until review completes.')) return;
    await supabase.from('account_continuity_requests').update({ owner_dispute_status: 'resolved', updated_at: new Date().toISOString() }).eq('id', caseData.id);
    toast.success('Dispute marked resolved'); onChange();
  };

  const bypassWaiting = async () => {
    if (!bypassReason.trim()) { toast.error('Bypass reason required'); return; }
    const { error } = await supabase.rpc('bypass_waiting_period', { _request_id: caseData.id, _reason: bypassReason });
    if (error) { toast.error(error.message); return; }
    toast.success('Waiting period bypassed'); setBypassReason(''); onChange();
  };

  const remaining = caseData.scheduled_execution_at
    ? Math.max(0, new Date(caseData.scheduled_execution_at).getTime() - Date.now())
    : null;
  const remainingDays = remaining != null ? Math.ceil(remaining / (1000 * 60 * 60 * 24)) : null;

  return (
    <div className="space-y-4">
      {caseData.owner_dispute_status === 'disputed' && (
        <Alert className="border-rose-200 bg-rose-50 text-rose-900">
          <ShieldAlert className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>Owner Disputed Request.</strong> No continuity execution actions are available until this dispute is resolved.
            {caseData.owner_dispute_reason && <div className="mt-1">Reason: {caseData.owner_dispute_reason}</div>}
            <Button size="sm" variant="outline" className="mt-2" onClick={resolveDispute}>Mark Dispute Resolved</Button>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="preferences">
        <TabsList className="grid grid-cols-3 lg:grid-cols-6 h-auto">
          <TabsTrigger value="preferences">Owner Preferences</TabsTrigger>
          <TabsTrigger value="consent">Consent History</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="dispute_freeze">Dispute & Freeze</TabsTrigger>
          <TabsTrigger value="waiting">Waiting Period</TabsTrigger>
          <TabsTrigger value="risk">Risk Flags</TabsTrigger>
        </TabsList>

        <TabsContent value="preferences" className="pt-3">
          <Card><CardHeader className="pb-3"><CardTitle className="text-base">Owner Continuity Preferences</CardTitle></CardHeader>
            <CardContent>
              {ownerPrefs?.continuity_preferences ? (
                <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-80">{JSON.stringify(ownerPrefs.continuity_preferences, null, 2)}</pre>
              ) : <p className="text-sm text-muted-foreground">No preferences set by owner.</p>}
              {ownerPrefs?.continuity_preferences_reviewed_at && (
                <p className="text-xs text-muted-foreground mt-2">
                  Last reviewed {new Date(ownerPrefs.continuity_preferences_reviewed_at).toLocaleDateString()} • Version {ownerPrefs.continuity_preferences_version}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consent" className="pt-3">
          <Card><CardHeader className="pb-3"><CardTitle className="text-base">Consent History</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow>
                  <TableHead>When</TableHead><TableHead>Legacy Admin</TableHead>
                  <TableHead>Terms</TableHead><TableHead>MFA</TableHead><TableHead>IP</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {consents.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-6">No consent records.</TableCell></TableRow>}
                  {consents.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="text-xs">{new Date(c.consent_acknowledged_at).toLocaleString()}</TableCell>
                      <TableCell className="font-mono text-xs">{c.legacy_admin_user_id?.slice(0,8)}…</TableCell>
                      <TableCell className="text-xs">{c.consent_terms_version || '—'}</TableCell>
                      <TableCell><Badge variant="outline">{c.mfa_completed ? 'Yes' : 'No'}</Badge></TableCell>
                      <TableCell className="text-xs">{c.ip_address || '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="pt-3">
          <Card><CardHeader className="pb-3"><CardTitle className="text-base">Owner Notification History</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow>
                  <TableHead>When</TableHead><TableHead>Type</TableHead><TableHead>To</TableHead>
                  <TableHead>Delivery</TableHead><TableHead>Opened</TableHead><TableHead>Disputed</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {notifs.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-6">No notifications sent.</TableCell></TableRow>}
                  {notifs.map((n) => (
                    <TableRow key={n.id}>
                      <TableCell className="text-xs">{new Date(n.created_at).toLocaleString()}</TableCell>
                      <TableCell className="text-xs">{n.email_type}</TableCell>
                      <TableCell className="text-xs">{n.recipient_email}</TableCell>
                      <TableCell><Badge variant="outline" className="text-xs">{n.delivery_status}</Badge></TableCell>
                      <TableCell className="text-xs">{n.opened_at ? new Date(n.opened_at).toLocaleString() : '—'}</TableCell>
                      <TableCell className="text-xs">{n.dispute_clicked_at ? '✓' : '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dispute_freeze" className="pt-3">
          <Card><CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Snowflake className="h-4 w-4" /> Apply Account Freeze</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Freeze type</Label>
                <Select value={freezeType} onValueChange={setFreezeType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{FREEZE_TYPES.map((f) => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Reason</Label>
                <Textarea value={freezeReason} onChange={(e) => setFreezeReason(e.target.value)} rows={3} />
              </div>
              <Button onClick={applyFreeze} disabled={!freezeReason.trim()}>Apply Freeze</Button>

              <div className="border-t pt-3 mt-3">
                <h4 className="text-sm font-medium mb-2">Active & historical freezes</h4>
                {freezes.length === 0 && <p className="text-sm text-muted-foreground">None.</p>}
                {freezes.map((f) => (
                  <div key={f.id} className="flex items-center justify-between gap-3 py-2 border-b last:border-0">
                    <div className="text-xs">
                      <div><Badge variant="outline">{f.freeze_type}</Badge> <span className="ml-2">{f.status}</span></div>
                      <div className="text-muted-foreground mt-1">{f.reason}</div>
                      <div className="text-muted-foreground">Applied {new Date(f.applied_at).toLocaleString()}</div>
                    </div>
                    {f.status === 'active' && <Button size="sm" variant="outline" onClick={() => removeFreeze(f.id)}>Remove</Button>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="waiting" className="pt-3">
          <Card><CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Clock className="h-4 w-4" /> Waiting Period</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {caseData.scheduled_execution_at ? (
                <div className="text-sm space-y-1">
                  <div>Waiting started: {caseData.waiting_period_starts_at ? new Date(caseData.waiting_period_starts_at).toLocaleString() : '—'}</div>
                  <div>Scheduled execution: <strong>{new Date(caseData.scheduled_execution_at).toLocaleString()}</strong></div>
                  <div>Time remaining: <Badge variant="outline">{remainingDays} day{remainingDays === 1 ? '' : 's'}</Badge></div>
                  {caseData.waiting_period_bypassed_at && (
                    <div className="text-amber-700">Bypassed at {new Date(caseData.waiting_period_bypassed_at).toLocaleString()}: {caseData.waiting_period_bypass_reason}</div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No waiting period scheduled for this case.</p>
              )}
              {caseData.scheduled_execution_at && !caseData.waiting_period_bypassed_at && (
                <div className="space-y-2 pt-2 border-t">
                  <Label>Override (Senior Reviewer only) — reason required</Label>
                  <Textarea value={bypassReason} onChange={(e) => setBypassReason(e.target.value)} rows={2} />
                  <Button variant="outline" onClick={bypassWaiting} disabled={!bypassReason.trim()}>Bypass Waiting Period</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk" className="pt-3">
          <Card><CardHeader className="pb-3"><CardTitle className="text-base">Risk Flags</CardTitle></CardHeader>
            <CardContent>
              {caseData.risk_flags && Object.keys(caseData.risk_flags).length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {Object.entries(caseData.risk_flags).map(([k, v]: any) => v ? (
                    <Badge key={k} variant="outline" className="bg-amber-50 text-amber-900 border-amber-200">{k}</Badge>
                  ) : null)}
                </div>
              ) : <p className="text-sm text-muted-foreground">No risk flags recorded.</p>}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OwnerRiskPanel;
