import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, ShieldAlert, History, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface ManualReviewRow {
  id: string;
  stripe_session_id: string;
  email: string | null;
  metadata_user_id: string | null;
  metadata_user_email: string | null;
  manual_review_reason: string | null;
  amount_total: number | null;
  currency: string | null;
  created_at: string;
  status: string;
}

interface OverrideRow {
  id: string;
  stripe_session_id: string;
  admin_user_id: string;
  reason: string;
  metadata_user_email: string | null;
  stripe_email: string | null;
  override_action: string;
  created_at: string;
}

const formatMoney = (cents: number | null, currency: string | null) => {
  if (cents == null) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: (currency || 'usd').toUpperCase(),
  }).format(cents / 100);
};

const ManualReviewQueue: React.FC = () => {
  const [rows, setRows] = useState<ManualReviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ManualReviewRow | null>(null);
  const [reason, setReason] = useState('');
  const [action, setAction] = useState<'approve' | 'reject'>('approve');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('checkout_fulfillments')
      .select(
        'id, stripe_session_id, email, metadata_user_id, metadata_user_email, manual_review_reason, amount_total, currency, created_at, status',
      )
      .eq('status', 'manual_review')
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) toast.error('Failed to load manual review queue');
    setRows((data as any) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleResolve = async () => {
    if (!selected) return;
    if (reason.trim().length < 20) {
      toast.error('Reason must be at least 20 characters');
      return;
    }
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-approve-fulfillment', {
        body: {
          session_id: selected.stripe_session_id,
          action,
          reason: reason.trim(),
        },
      });
      if (error || !data?.success) {
        throw new Error(data?.error || error?.message || 'Failed');
      }
      toast.success(action === 'approve' ? 'Fulfillment approved' : 'Fulfillment rejected');
      setSelected(null);
      setReason('');
      setAction('approve');
      load();
    } catch (e: any) {
      toast.error(e?.message ?? 'Resolution failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold">Manual review queue</h3>
          <p className="text-sm text-muted-foreground">
            {rows.length} fulfillment{rows.length === 1 ? '' : 's'} awaiting human verification
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {rows.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Nothing to review. 🎉
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {rows.map((row) => (
            <Card key={row.id}>
              <CardHeader>
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4 text-amber-500" />
                      {row.email ?? '(no email on session)'}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Session <code className="text-xs">{row.stripe_session_id}</code>
                    </CardDescription>
                  </div>
                  <Badge variant="outline">{formatMoney(row.amount_total, row.currency)}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <Label className="text-xs text-muted-foreground">Metadata user email</Label>
                    <p>{row.metadata_user_email ?? '—'}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Metadata user ID</Label>
                    <p className="font-mono text-xs break-all">{row.metadata_user_id ?? '—'}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Reason flagged</Label>
                  <p className="text-sm">{row.manual_review_reason ?? '—'}</p>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelected(row);
                      setAction('approve');
                      setReason('');
                    }}
                  >
                    Approve & fulfill
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      setSelected(row);
                      setAction('reject');
                      setReason('');
                    }}
                  >
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === 'approve' ? 'Approve fulfillment' : 'Reject fulfillment'}
            </DialogTitle>
            <DialogDescription>
              {action === 'approve'
                ? 'This will provision the account using the email on the Stripe session. The override is permanently logged.'
                : 'This will mark the fulfillment as rejected. No account will be provisioned. The decision is permanently logged.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Session</Label>
              <p className="text-xs font-mono break-all">{selected?.stripe_session_id}</p>
            </div>
            <div>
              <Label htmlFor="reason">Reason (min 20 chars)</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                placeholder="Explain how you verified ownership or why this is being rejected…"
              />
              <p className="text-xs text-muted-foreground mt-1">{reason.trim().length}/20</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)} disabled={submitting}>
              Cancel
            </Button>
            <Button
              onClick={handleResolve}
              disabled={submitting || reason.trim().length < 20}
              variant={action === 'reject' ? 'destructive' : 'default'}
            >
              {submitting ? 'Submitting…' : action === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

const OverrideHistory: React.FC = () => {
  const [rows, setRows] = useState<OverrideRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('admin_fulfillment_overrides')
      .select(
        'id, stripe_session_id, admin_user_id, reason, metadata_user_email, stripe_email, override_action, created_at',
      )
      .order('created_at', { ascending: false })
      .limit(200);
    if (error) toast.error('Failed to load override history');
    setRows((data as any) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold">Override history</h3>
          <p className="text-sm text-muted-foreground">
            Immutable audit log of admin fulfillment decisions
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {rows.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No overrides recorded yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {rows.map((row) => (
            <Card key={row.id}>
              <CardHeader>
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <History className="h-4 w-4 text-muted-foreground" />
                      {row.override_action}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {new Date(row.created_at).toLocaleString()}
                    </CardDescription>
                  </div>
                  <Badge variant="outline">
                    Admin <code className="text-xs ml-1">{row.admin_user_id.slice(0, 8)}…</code>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <Label className="text-xs text-muted-foreground">Session</Label>
                  <p className="font-mono text-xs break-all">{row.stripe_session_id}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Metadata email</Label>
                    <p>{row.metadata_user_email ?? '—'}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Stripe email</Label>
                    <p>{row.stripe_email ?? '—'}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Reason</Label>
                  <p className="text-sm">{row.reason}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
};

const AdminBillingManualReview: React.FC = () => {
  return (
    <Tabs defaultValue="queue" className="space-y-4">
      <TabsList>
        <TabsTrigger value="queue">
          <ShieldAlert className="w-4 h-4 mr-2" />
          Manual Review Queue
        </TabsTrigger>
        <TabsTrigger value="history">
          <History className="w-4 h-4 mr-2" />
          Override History
        </TabsTrigger>
      </TabsList>
      <TabsContent value="queue">
        <ManualReviewQueue />
      </TabsContent>
      <TabsContent value="history">
        <OverrideHistory />
      </TabsContent>
    </Tabs>
  );
};

export default AdminBillingManualReview;
