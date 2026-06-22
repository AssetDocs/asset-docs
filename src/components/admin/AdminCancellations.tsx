// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

type ProfileLite = {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  account_number: string | null;
  email?: string | null;
};

type CronHealthLite = {
  health_status: string | null;
  last_error: string | null;
  last_result: Record<string, unknown> | null;
  last_status: string | null;
  last_succeeded_at: string | null;
  minutes_since_success: number | null;
};

const AdminCancellations: React.FC = () => {
  const { toast } = useToast();
  const [cancellations, setCancellations] = useState<any[]>([]);
  const [closures, setClosures] = useState<any[]>([]);
  const [deleted, setDeleted] = useState<any[]>([]);
  const [deletionRequests, setDeletionRequests] = useState<any[]>([]);
  const [profileMap, setProfileMap] = useState<Map<string, ProfileLite>>(new Map());
  const [closureSweeperHealth, setClosureSweeperHealth] = useState<CronHealthLite | null>(null);
  const [loading, setLoading] = useState(true);
  const [legalHoldTarget, setLegalHoldTarget] = useState<{ type: 'closure' | 'deleted'; row: any } | null>(null);
  const [legalHoldReason, setLegalHoldReason] = useState('');
  const [legalHoldLoading, setLegalHoldLoading] = useState<string | null>(null);
  const [reviewTarget, setReviewTarget] = useState<{ type: 'closure' | 'deleted'; row: any } | null>(null);
  const [reviewStatus, setReviewStatus] = useState('needs_review');
  const [reviewAssignee, setReviewAssignee] = useState('');
  const [reviewDueDate, setReviewDueDate] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');

  const loadData = async () => {
    setLoading(true);
    const [c, k, d, dr, health] = await Promise.all([
      supabase.from('subscription_cancellations').select('*').order('cancelled_at', { ascending: false }).limit(500),
      supabase.from('account_closure_requests').select('*').order('request_date', { ascending: false }).limit(500),
      supabase.from('deleted_accounts').select('*').order('deleted_at', { ascending: false }).limit(500),
      supabase.from('account_deletion_requests').select('*').order('requested_at', { ascending: false }).limit(500),
      supabase
        .from('cron_job_health_status')
        .select('health_status,last_error,last_result,last_status,last_succeeded_at,minutes_since_success')
        .eq('job_name', 'process-account-closures')
        .maybeSingle(),
    ]);
    const cRows = c.data || [];
    const kRows = k.data || [];
    const dRows = d.data || [];
    const drRows = dr.data || [];
    setCancellations(cRows);
    setClosures(kRows);
    setDeleted(dRows);
    setDeletionRequests(drRows);
    setClosureSweeperHealth((health.data || null) as CronHealthLite | null);

    const ids = new Set<string>();
    cRows.forEach((r) => r.owner_user_id && ids.add(r.owner_user_id));
    kRows.forEach((r) => r.owner_user_id && ids.add(r.owner_user_id));
    kRows.forEach((r) => r.legal_hold_assigned_to && ids.add(r.legal_hold_assigned_to));
    dRows.forEach((r) => r.original_user_id && ids.add(r.original_user_id));
    dRows.forEach((r) => r.legal_hold_assigned_to && ids.add(r.legal_hold_assigned_to));
    drRows.forEach((r) => r.account_owner_id && ids.add(r.account_owner_id));

    if (ids.size > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, account_number, email')
        .in('user_id', Array.from(ids));
      const m = new Map<string, ProfileLite>();
      (profiles || []).forEach((p: any) => m.set(p.user_id, p));
      setProfileMap(m);
    } else {
      setProfileMap(new Map());
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
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

  const sweeperHealthBadgeClass = () => {
    if (closureSweeperHealth?.health_status === 'healthy') return 'bg-green-500';
    if (closureSweeperHealth?.health_status === 'critical') return 'bg-red-500';
    return 'bg-yellow-500';
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

  const openLegalHoldDialog = (type: 'closure' | 'deleted', row: any) => {
    setLegalHoldTarget({ type, row });
    setLegalHoldReason(row.legal_hold_reason || '');
  };

  const openReviewDialog = (type: 'closure' | 'deleted', row: any) => {
    setReviewTarget({ type, row });
    setReviewStatus(row.legal_hold_review_status || 'needs_review');
    setReviewAssignee(row.legal_hold_assigned_to || '');
    setReviewDueDate(row.legal_hold_review_due_at ? row.legal_hold_review_due_at.slice(0, 10) : '');
    setReviewNotes(row.legal_hold_review_notes || '');
  };

  const applyLegalHold = async () => {
    if (!legalHoldTarget || !legalHoldReason.trim()) return;
    setLegalHoldLoading(legalHoldTarget.row.id);
    try {
      const { error } =
        legalHoldTarget.type === 'closure'
          ? await supabase.rpc('apply_account_closure_legal_hold', {
              p_closure_request_id: legalHoldTarget.row.id,
              p_reason: legalHoldReason.trim(),
            })
          : await supabase.rpc('apply_deleted_account_legal_hold', {
              p_deleted_account_id: legalHoldTarget.row.id,
              p_reason: legalHoldReason.trim(),
            });

      if (error) throw error;
      toast({ title: 'Legal hold applied', description: 'Retention and deletion sweepers will skip this record.' });
      setLegalHoldTarget(null);
      setLegalHoldReason('');
      await loadData();
    } catch (error: any) {
      toast({
        title: 'Unable to apply legal hold',
        description: error?.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLegalHoldLoading(null);
    }
  };

  const releaseLegalHold = async (type: 'closure' | 'deleted', row: any) => {
    setLegalHoldLoading(row.id);
    try {
      const { error } =
        type === 'closure'
          ? await supabase.rpc('release_account_closure_legal_hold', { p_closure_request_id: row.id })
          : await supabase.rpc('release_deleted_account_legal_hold', { p_deleted_account_id: row.id });

      if (error) throw error;
      toast({ title: 'Legal hold released', description: 'Normal retention processing can resume for this record.' });
      await loadData();
    } catch (error: any) {
      toast({
        title: 'Unable to release legal hold',
        description: error?.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLegalHoldLoading(null);
    }
  };

  const saveLegalHoldReview = async () => {
    if (!reviewTarget) return;
    setLegalHoldLoading(reviewTarget.row.id);
    try {
      const dueAt = reviewDueDate ? new Date(`${reviewDueDate}T12:00:00`).toISOString() : null;
      const { error } = await supabase.rpc('update_legal_hold_review', {
        p_record_type: reviewTarget.type,
        p_record_id: reviewTarget.row.id,
        p_review_status: reviewStatus,
        p_assigned_to: reviewAssignee.trim() || null,
        p_review_due_at: dueAt,
        p_review_notes: reviewNotes.trim() || null,
      });

      if (error) throw error;
      toast({ title: 'Legal hold review updated', description: 'Assignment and review status were saved.' });
      setReviewTarget(null);
      await loadData();
    } catch (error: any) {
      toast({
        title: 'Unable to update legal hold review',
        description: error?.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLegalHoldLoading(null);
    }
  };

  const LegalHoldBadge = ({ row }: { row: any }) => (
    row.legal_hold ? (
      <Badge variant="destructive" title={row.legal_hold_reason || 'Legal hold active'}>Legal hold</Badge>
    ) : (
      <span className="text-muted-foreground">-</span>
    )
  );

  const LegalHoldActions = ({ type, row }: { type: 'closure' | 'deleted'; row: any }) => (
    row.legal_hold ? (
      <div className="flex justify-end gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={legalHoldLoading === row.id}
          onClick={() => openReviewDialog(type, row)}
        >
          Review
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={legalHoldLoading === row.id}
          onClick={() => releaseLegalHold(type, row)}
        >
          Release
        </Button>
      </div>
    ) : (
      <Button
        size="sm"
        variant="outline"
        disabled={legalHoldLoading === row.id}
        onClick={() => openLegalHoldDialog(type, row)}
      >
        Hold
      </Button>
    )
  );

  const LegalHoldReviewCell = ({ row }: { row: any }) => {
    if (!row.legal_hold) return <span className="text-muted-foreground">-</span>;
    const dueAt = row.legal_hold_review_due_at ? new Date(row.legal_hold_review_due_at) : null;
    const overdue = dueAt ? dueAt.getTime() < Date.now() && row.legal_hold_review_status !== 'resolved' : false;

    return (
      <div className="space-y-1 text-sm">
        <Badge variant={overdue ? 'destructive' : 'secondary'}>
          {row.legal_hold_review_status || 'needs_review'}
        </Badge>
        <div className="text-xs text-muted-foreground">
          Due {dueAt ? format(dueAt, 'PP') : '-'}
        </div>
        <div className="text-xs text-muted-foreground">
          Assigned {nameOf(row.legal_hold_assigned_to)}
        </div>
      </div>
    );
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <Card>
              <CardHeader><CardTitle className="text-sm">Legal Holds</CardTitle></CardHeader>
              <CardContent className="text-3xl font-bold">{pendingClosures.filter(c => c.legal_hold).length}</CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle>Closure Sweeper Health</CardTitle>
                  <CardDescription>
                    `process-account-closures` executes matured scheduled closures through the delete-account pipeline.
                  </CardDescription>
                </div>
                <Badge className={sweeperHealthBadgeClass()}>
                  {closureSweeperHealth?.health_status || 'unknown'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Last success</p>
                <p className="font-medium">
                  {closureSweeperHealth?.last_succeeded_at ? format(new Date(closureSweeperHealth.last_succeeded_at), 'PP p') : '—'}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Minutes since success</p>
                <p className="font-medium">{closureSweeperHealth?.minutes_since_success ?? '—'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Last status</p>
                <Badge variant={closureSweeperHealth?.last_status === 'failed' ? 'destructive' : 'secondary'}>
                  {closureSweeperHealth?.last_status || '—'}
                </Badge>
              </div>
              {closureSweeperHealth?.last_error && (
                <div className="md:col-span-3 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-destructive">
                  {closureSweeperHealth.last_error}
                </div>
              )}
              {closureSweeperHealth?.last_result && (
                <div className="md:col-span-3 truncate text-muted-foreground" title={JSON.stringify(closureSweeperHealth.last_result)}>
                  Last result: {JSON.stringify(closureSweeperHealth.last_result)}
                </div>
              )}
            </CardContent>
          </Card>

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
                      <TableHead>Hold</TableHead>
                      <TableHead>Review</TableHead>
                      <TableHead className="text-right">Action</TableHead>
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
                        <TableCell><LegalHoldBadge row={row} /></TableCell>
                        <TableCell><LegalHoldReviewCell row={row} /></TableCell>
                        <TableCell className="text-right"><LegalHoldActions type="closure" row={row} /></TableCell>
                      </TableRow>
                    ))}
                    {pendingClosures.length === 0 && (
                      <TableRow><TableCell colSpan={10} className="text-center text-muted-foreground">No pending closure requests</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deleted" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-sm">Total Deleted</CardTitle></CardHeader>
              <CardContent className="text-3xl font-bold">{deleted.length}</CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm">Legal Holds</CardTitle></CardHeader>
              <CardContent className="text-3xl font-bold">{deleted.filter(d => d.legal_hold).length}</CardContent>
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
                      <TableHead>Hold</TableHead>
                      <TableHead>Review</TableHead>
                      <TableHead className="text-right">Action</TableHead>
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
                        <TableCell><LegalHoldBadge row={row} /></TableCell>
                        <TableCell><LegalHoldReviewCell row={row} /></TableCell>
                        <TableCell className="text-right"><LegalHoldActions type="deleted" row={row} /></TableCell>
                      </TableRow>
                    ))}
                    {deleted.length === 0 && (
                      <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground">No deleted accounts</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!legalHoldTarget} onOpenChange={(open) => !open && setLegalHoldTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply Legal Hold</DialogTitle>
            <DialogDescription>
              Legal holds pause deletion and retention sweepers for the selected record until an admin releases the hold.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="legal-hold-reason">Reason</Label>
            <Textarea
              id="legal-hold-reason"
              value={legalHoldReason}
              onChange={(event) => setLegalHoldReason(event.target.value)}
              placeholder="Subpoena, dispute, counsel request, fraud review..."
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLegalHoldTarget(null)}>Cancel</Button>
            <Button onClick={applyLegalHold} disabled={!legalHoldReason.trim() || !!legalHoldLoading}>
              Apply Hold
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!reviewTarget} onOpenChange={(open) => !open && setReviewTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Legal Hold Review</DialogTitle>
            <DialogDescription>
              Track ownership, status, and next review date while this legal hold remains active.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="legal-hold-review-status">Status</Label>
              <select
                id="legal-hold-review-status"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={reviewStatus}
                onChange={(event) => setReviewStatus(event.target.value)}
              >
                <option value="needs_review">Needs review</option>
                <option value="in_review">In review</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="legal-hold-assignee">Assigned user ID</Label>
              <Input
                id="legal-hold-assignee"
                value={reviewAssignee}
                onChange={(event) => setReviewAssignee(event.target.value)}
                placeholder="Admin user ID"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="legal-hold-due-date">Review due date</Label>
              <Input
                id="legal-hold-due-date"
                type="date"
                value={reviewDueDate}
                onChange={(event) => setReviewDueDate(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="legal-hold-review-notes">Notes</Label>
              <Textarea
                id="legal-hold-review-notes"
                value={reviewNotes}
                onChange={(event) => setReviewNotes(event.target.value)}
                placeholder="Review owner, counsel status, next action..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewTarget(null)}>Cancel</Button>
            <Button onClick={saveLegalHoldReview} disabled={!!legalHoldLoading}>
              Save Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCancellations;
