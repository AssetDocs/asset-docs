// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

type ProfileLite = {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  account_number: string | null;
  email?: string | null;
};

const AdminCancellations: React.FC = () => {
  const [cancellations, setCancellations] = useState<any[]>([]);
  const [closures, setClosures] = useState<any[]>([]);
  const [deleted, setDeleted] = useState<any[]>([]);
  const [deletionRequests, setDeletionRequests] = useState<any[]>([]);
  const [profileMap, setProfileMap] = useState<Map<string, ProfileLite>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [c, k, d, dr] = await Promise.all([
        supabase.from('subscription_cancellations').select('*').order('cancelled_at', { ascending: false }).limit(500),
        supabase.from('account_closure_requests').select('*').order('request_date', { ascending: false }).limit(500),
        supabase.from('deleted_accounts').select('*').order('deleted_at', { ascending: false }).limit(500),
        supabase.from('account_deletion_requests').select('*').order('requested_at', { ascending: false }).limit(500),
      ]);
      const cRows = c.data || [];
      const kRows = k.data || [];
      const dRows = d.data || [];
      const drRows = dr.data || [];
      setCancellations(cRows);
      setClosures(kRows);
      setDeleted(dRows);
      setDeletionRequests(drRows);

      const ids = new Set<string>();
      cRows.forEach((r) => r.owner_user_id && ids.add(r.owner_user_id));
      kRows.forEach((r) => r.owner_user_id && ids.add(r.owner_user_id));
      dRows.forEach((r) => r.original_user_id && ids.add(r.original_user_id));
      drRows.forEach((r) => r.account_owner_id && ids.add(r.account_owner_id));

      if (ids.size > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, first_name, last_name, account_number, email')
          .in('user_id', Array.from(ids));
        const m = new Map<string, ProfileLite>();
        (profiles || []).forEach((p: any) => m.set(p.user_id, p));
        setProfileMap(m);
      }
      setLoading(false);
    })();
  }, []);

  const nameOf = (uid?: string | null, fallbackEmail?: string | null) => {
    if (!uid) return fallbackEmail || '—';
    const p = profileMap.get(uid);
    if (!p) return fallbackEmail || '—';
    const n = `${p.first_name || ''} ${p.last_name || ''}`.trim();
    return n || p.email || fallbackEmail || '—';
  };
  const acctOf = (uid?: string | null) => {
    if (!uid) return null;
    return profileMap.get(uid)?.account_number || null;
  };
  const AcctBadge = ({ uid }: { uid?: string | null }) => {
    const a = acctOf(uid);
    return a ? <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">{a}</span> : <span className="text-muted-foreground">—</span>;
  };

  const reasonCounts = (rows: any[]) => {
    const m: Record<string, number> = {};
    rows.forEach((r) => {
      const k = r.reason || 'unspecified';
      m[k] = (m[k] || 0) + 1;
    });
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  };

  // Pending closures = not completed (those move to Deleted tab)
  const pendingClosures = closures.filter((c) => c.status !== 'completed');

  // For deleted accounts, build a reason lookup keyed by user id
  const reasonForDeleted = (uid?: string | null) => {
    if (!uid) return null;
    const fromClosure = closures.find((c) => c.owner_user_id === uid && (c.status === 'completed' || c.reason));
    if (fromClosure?.reason) return fromClosure.reason;
    const fromReq = deletionRequests.find((r) => r.account_owner_id === uid && r.reason);
    return fromReq?.reason || null;
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="cancellations">
        <TabsList>
          <TabsTrigger value="cancellations">Subscription Cancellations</TabsTrigger>
          <TabsTrigger value="closures">Cancelled (Pending Deletion)</TabsTrigger>
          <TabsTrigger value="deleted">Deleted Accounts</TabsTrigger>
        </TabsList>

        <TabsContent value="cancellations" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-sm">Total</CardTitle></CardHeader>
              <CardContent className="text-3xl font-bold">{cancellations.length}</CardContent>
            </Card>
            <Card className="md:col-span-2">
              <CardHeader><CardTitle className="text-sm">Top Reasons</CardTitle></CardHeader>
              <CardContent className="space-y-1 text-sm">
                {reasonCounts(cancellations).slice(0, 5).map(([r, n]) => (
                  <div key={r} className="flex justify-between">
                    <span className="text-muted-foreground">{r}</span>
                    <span className="font-medium">{n}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Subscription Cancellations</CardTitle>
              <CardDescription>Subscriptions cancelled. Account data is retained.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? 'Loading…' : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Account #</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Comments</TableHead>
                      <TableHead>Cancelled On</TableHead>
                      <TableHead>Period End</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cancellations.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>{nameOf(row.owner_user_id)}</TableCell>
                        <TableCell><AcctBadge uid={row.owner_user_id} /></TableCell>
                        <TableCell>{row.plan || '—'}</TableCell>
                        <TableCell>{row.reason || '—'}</TableCell>
                        <TableCell className="max-w-xs truncate" title={row.comments || ''}>{row.comments || '—'}</TableCell>
                        <TableCell className="whitespace-nowrap">{row.cancelled_at ? format(new Date(row.cancelled_at), 'PP') : '—'}</TableCell>
                        <TableCell className="whitespace-nowrap">{row.period_end ? format(new Date(row.period_end), 'PP') : '—'}</TableCell>
                      </TableRow>
                    ))}
                    {cancellations.length === 0 && (
                      <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">No cancellations yet</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="closures" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-sm">Total Pending</CardTitle></CardHeader>
              <CardContent className="text-3xl font-bold">{pendingClosures.length}</CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm">Scheduled</CardTitle></CardHeader>
              <CardContent className="text-3xl font-bold">{pendingClosures.filter(c => c.status === 'scheduled' || c.status === 'pending').length}</CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm">Reversed</CardTitle></CardHeader>
              <CardContent className="text-3xl font-bold">{pendingClosures.filter(c => c.status === 'reversed').length}</CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Cancelled (Pending Deletion)</CardTitle>
              <CardDescription>Account closure requests that have not yet completed.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? 'Loading…' : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Account #</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Comments</TableHead>
                      <TableHead>Requested</TableHead>
                      <TableHead>Scheduled Deletion</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingClosures.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>{nameOf(row.owner_user_id)}</TableCell>
                        <TableCell><AcctBadge uid={row.owner_user_id} /></TableCell>
                        <TableCell><Badge variant={row.status === 'reversed' ? 'secondary' : 'default'}>{row.status}</Badge></TableCell>
                        <TableCell>{row.reason || '—'}</TableCell>
                        <TableCell className="max-w-xs truncate" title={row.comments || ''}>{row.comments || '—'}</TableCell>
                        <TableCell className="whitespace-nowrap">{row.request_date ? format(new Date(row.request_date), 'PP') : '—'}</TableCell>
                        <TableCell className="whitespace-nowrap">{row.deletion_scheduled_date ? format(new Date(row.deletion_scheduled_date), 'PP') : '—'}</TableCell>
                      </TableRow>
                    ))}
                    {pendingClosures.length === 0 && (
                      <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">No pending closure requests</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deleted" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-sm">Total Deleted</CardTitle></CardHeader>
              <CardContent className="text-3xl font-bold">{deleted.length}</CardContent>
            </Card>
            <Card className="md:col-span-2">
              <CardHeader><CardTitle className="text-sm">Deletion Reasons</CardTitle></CardHeader>
              <CardContent className="space-y-1 text-sm">
                {(() => {
                  const rows = deleted.map((d) => ({ reason: reasonForDeleted(d.original_user_id) || 'unspecified' }));
                  return reasonCounts(rows).slice(0, 5).map(([r, n]) => (
                    <div key={r} className="flex justify-between">
                      <span className="text-muted-foreground">{r}</span>
                      <span className="font-medium">{n}</span>
                    </div>
                  ));
                })()}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Deleted Accounts</CardTitle>
              <CardDescription>Accounts that have been permanently deleted.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? 'Loading…' : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Account #</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Deleted On</TableHead>
                      <TableHead>Deleted By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deleted.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>{nameOf(row.original_user_id, row.email)}</TableCell>
                        <TableCell><AcctBadge uid={row.original_user_id} /></TableCell>
                        <TableCell className="text-sm">{row.email || '—'}</TableCell>
                        <TableCell>{reasonForDeleted(row.original_user_id) || '—'}</TableCell>
                        <TableCell className="whitespace-nowrap">{row.deleted_at ? format(new Date(row.deleted_at), 'PP') : '—'}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{row.deleted_by || '—'}</TableCell>
                      </TableRow>
                    ))}
                    {deleted.length === 0 && (
                      <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No deleted accounts</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminCancellations;
