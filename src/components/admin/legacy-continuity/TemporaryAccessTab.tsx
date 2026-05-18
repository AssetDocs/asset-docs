// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAdminRole } from '@/hooks/useAdminRole';
import { TEMP_ACCESS_STATUS_BADGE, TEMP_ACCESS_STATUS_LABEL, capabilitiesForRole, CAP_REQUIREMENT_HELP } from './constants';
import { toast } from '@/hooks/use-toast';

const TemporaryAccessTab: React.FC<{ onOpenCase: (id: string) => void; refreshKey: number }> = ({ onOpenCase, refreshKey }) => {
  const [rows, setRows] = useState<any[]>([]);
  const [revokeRow, setRevokeRow] = useState<any | null>(null);
  const [revokeReason, setRevokeReason] = useState('');
  const { role } = useAdminRole();
  const caps = capabilitiesForRole(role);

  const load = async () => {
    const { data } = await supabase
      .from('continuity_temporary_access')
      .select('*')
      .order('created_at', { ascending: false });
    setRows(data || []);
  };
  useEffect(() => { load(); }, [refreshKey]);

  const effectiveStatus = (r: any) => {
    if (r.status === 'revoked') return 'revoked';
    const exp = new Date(r.expires_at).getTime();
    const now = Date.now();
    if (exp < now) return 'expired';
    if (exp - now < 1000 * 60 * 60 * 48) return 'expiring_soon';
    return 'active';
  };

  const revoke = async () => {
    if (!revokeRow) return;
    if (!revokeReason.trim()) { toast({ title: 'Reason required', variant: 'destructive' }); return; }
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase
      .from('continuity_temporary_access')
      .update({ status: 'revoked', revoked_at: new Date().toISOString(), revoked_by: u.user?.id, revoked_reason: revokeReason })
      .eq('id', revokeRow.id);
    if (error) { toast({ title: 'Failed to revoke', description: error.message, variant: 'destructive' }); return; }
    await supabase.rpc('log_continuity_event', {
      _request_id: revokeRow.request_id, _event_type: 'temp_access_revoked',
      _event_description: 'Temporary access revoked', _action_details: { reason: revokeReason },
      _affected_account_id: revokeRow.account_holder_id,
    });
    toast({ title: 'Temporary access revoked' });
    setRevokeRow(null); setRevokeReason(''); load();
  };

  return (
    <Card className="border-border mt-4">
      <CardContent className="p-4">
        <div className="overflow-x-auto rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Case</TableHead>
                <TableHead>Legacy Admin</TableHead>
                <TableHead>Granted</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-6">No temporary access grants.</TableCell></TableRow>
              )}
              {rows.map((r) => {
                const s = effectiveStatus(r);
                const perms = Object.entries(r.permissions || {}).filter(([, v]) => v).map(([k]) => k.replace(/_/g, ' '));
                return (
                  <TableRow key={r.id}>
                    <TableCell><Badge variant="outline" className={TEMP_ACCESS_STATUS_BADGE[s]}>{TEMP_ACCESS_STATUS_LABEL[s]}</Badge></TableCell>
                    <TableCell className="font-mono text-xs">{r.request_id.slice(0, 8)}…</TableCell>
                    <TableCell className="font-mono text-xs">{r.legacy_admin_id?.slice(0, 8)}…</TableCell>
                    <TableCell className="text-sm">{new Date(r.starts_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-sm">{new Date(r.expires_at).toLocaleString()}</TableCell>
                    <TableCell className="text-xs text-muted-foreground capitalize">{perms.join(', ') || 'view records'}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button size="sm" variant="ghost" onClick={() => onOpenCase(r.request_id)}>View Case</Button>
                      <Button
                        size="sm" variant="outline"
                        disabled={!caps.has('revoke_temp_access') || r.status === 'revoked'}
                        title={caps.has('revoke_temp_access') ? '' : CAP_REQUIREMENT_HELP.revoke_temp_access}
                        onClick={() => setRevokeRow(r)}
                      >Revoke</Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog open={!!revokeRow} onOpenChange={(v) => !v && setRevokeRow(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Revoke Temporary Access</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Revoking will immediately end access for the Legacy Admin and will be recorded in the audit log.</p>
          <Textarea placeholder="Reason for revoking access (required)" value={revokeReason} onChange={(e) => setRevokeReason(e.target.value)} />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRevokeRow(null)}>Cancel</Button>
            <Button variant="destructive" onClick={revoke}>Revoke Access</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default TemporaryAccessTab;
