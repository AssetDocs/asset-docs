// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const AdminCancellations: React.FC = () => {
  const [cancellations, setCancellations] = useState<any[]>([]);
  const [closures, setClosures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [c, k] = await Promise.all([
        supabase.from('subscription_cancellations').select('*').order('cancelled_at', { ascending: false }).limit(500),
        supabase.from('account_closure_requests').select('*').order('request_date', { ascending: false }).limit(500),
      ]);
      setCancellations(c.data || []);
      setClosures(k.data || []);
      setLoading(false);
    })();
  }, []);

  const reasonCounts = (rows: any[]) => {
    const m: Record<string, number> = {};
    rows.forEach((r) => {
      const k = r.reason || 'unspecified';
      m[k] = (m[k] || 0) + 1;
    });
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="cancellations">
        <TabsList>
          <TabsTrigger value="cancellations">Subscription Cancellations</TabsTrigger>
          <TabsTrigger value="closures">Account Closure Requests</TabsTrigger>
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
              <CardTitle>Cancellations</CardTitle>
              <CardDescription>Subscriptions cancelled. Account data is retained.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? 'Loading…' : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cancelled</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Period End</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Comments</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cancellations.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="whitespace-nowrap">{row.cancelled_at ? format(new Date(row.cancelled_at), 'PP') : '—'}</TableCell>
                        <TableCell className="font-mono text-xs">{row.owner_user_id?.slice(0, 8)}</TableCell>
                        <TableCell>{row.plan || '—'}</TableCell>
                        <TableCell className="whitespace-nowrap">{row.period_end ? format(new Date(row.period_end), 'PP') : '—'}</TableCell>
                        <TableCell>{row.reason || '—'}</TableCell>
                        <TableCell className="max-w-xs truncate" title={row.comments || ''}>{row.comments || '—'}</TableCell>
                      </TableRow>
                    ))}
                    {cancellations.length === 0 && (
                      <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No cancellations yet</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="closures" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-sm">Total Requests</CardTitle></CardHeader>
              <CardContent className="text-3xl font-bold">{closures.length}</CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm">Scheduled</CardTitle></CardHeader>
              <CardContent className="text-3xl font-bold">{closures.filter(c => c.status === 'scheduled' || c.status === 'pending').length}</CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm">Reversed</CardTitle></CardHeader>
              <CardContent className="text-3xl font-bold">{closures.filter(c => c.status === 'reversed').length}</CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm">Completed</CardTitle></CardHeader>
              <CardContent className="text-3xl font-bold">{closures.filter(c => c.status === 'completed').length}</CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Account Closure Requests</CardTitle>
              <CardDescription>Explicit deletion requests initiated by account owners.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? 'Loading…' : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Requested</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Scheduled Deletion</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Comments</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {closures.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="whitespace-nowrap">{row.request_date ? format(new Date(row.request_date), 'PP') : '—'}</TableCell>
                        <TableCell className="font-mono text-xs">{row.owner_user_id?.slice(0, 8)}</TableCell>
                        <TableCell><Badge variant={row.status === 'reversed' ? 'secondary' : row.status === 'completed' ? 'destructive' : 'default'}>{row.status}</Badge></TableCell>
                        <TableCell className="whitespace-nowrap">{row.deletion_scheduled_date ? format(new Date(row.deletion_scheduled_date), 'PP') : '—'}</TableCell>
                        <TableCell>{row.reason || '—'}</TableCell>
                        <TableCell className="max-w-xs truncate" title={row.comments || ''}>{row.comments || '—'}</TableCell>
                      </TableRow>
                    ))}
                    {closures.length === 0 && (
                      <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No closure requests yet</TableCell></TableRow>
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
