// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Crown, Info, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAccount } from '@/contexts/AccountContext';
import { useToast } from '@/hooks/use-toast';

interface RequestRow {
  id: string;
  request_type: string;
  reason: string;
  status: string;
  created_at: string;
  admin_notes: string | null;
}

const STATUS_BADGE: Record<string, string> = {
  submitted: 'bg-blue-100 text-blue-800 border-blue-200',
  under_review: 'bg-amber-100 text-amber-800 border-amber-200',
  approved: 'bg-green-100 text-green-800 border-green-200',
  declined: 'bg-red-100 text-red-800 border-red-200',
  completed: 'bg-gray-100 text-gray-800 border-gray-200',
};

const STATUS_LABEL: Record<string, string> = {
  submitted: 'Submitted',
  under_review: 'Under Review',
  approved: 'Approved',
  declined: 'Declined',
  completed: 'Completed',
};

const TYPE_LABEL: Record<string, string> = {
  closure: 'Account Closure',
  export: 'Data Export',
  ownership_transfer: 'Ownership Transfer',
};

const LegacyAdminContinuityRequests: React.FC = () => {
  const { user } = useAuth();
  const { accountId } = useAccount();
  const { toast } = useToast();
  const [isLegacyAdmin, setIsLegacyAdmin] = useState(false);
  const [legacyAdminId, setLegacyAdminId] = useState<string | null>(null);
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [open, setOpen] = useState(false);

  // form
  const [requestType, setRequestType] = useState<'closure' | 'export' | 'ownership_transfer'>('export');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user || !accountId) return;
    (async () => {
      const { data: la } = await supabase
        .from('legacy_admins')
        .select('id, legacy_admin_user_id')
        .eq('account_id', accountId)
        .eq('status', 'active')
        .maybeSingle();
      if (la && la.legacy_admin_user_id === user.id) {
        setIsLegacyAdmin(true);
        setLegacyAdminId(la.id);
        setContactEmail(user.email || '');
      }

      const { data: reqs } = await supabase
        .from('account_continuity_requests')
        .select('id, request_type, reason, status, created_at, admin_notes')
        .eq('account_id', accountId)
        .eq('requested_by_user_id', user.id)
        .order('created_at', { ascending: false });
      setRequests(reqs || []);
    })();
  }, [user?.id, accountId]);

  const handleSubmit = async () => {
    if (!user || !accountId) return;
    if (!reason.trim()) {
      toast({ title: 'Reason required', variant: 'destructive' });
      return;
    }
    if (!acknowledged) {
      toast({ title: 'Please acknowledge that review is required', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('account_continuity_requests')
        .insert({
          account_id: accountId,
          requested_by_user_id: user.id,
          legacy_admin_id: legacyAdminId,
          request_type: requestType,
          reason: reason.trim(),
          notes: notes.trim() || null,
          contact_email: contactEmail.trim() || null,
          contact_phone: contactPhone.trim() || null,
        })
        .select()
        .single();
      if (error) throw error;

      // Fire-and-forget notification
      try {
        await supabase.functions.invoke('notify-continuity-request', {
          body: { request_id: data.id },
        });
      } catch (e) {
        // non-fatal
        console.warn('notify-continuity-request failed', e);
      }

      toast({
        title: 'Request submitted',
        description: 'Asset Safe will review your request before any action is taken.',
      });
      setOpen(false);
      setReason('');
      setNotes('');
      setContactPhone('');
      setAcknowledged(false);

      const { data: reqs } = await supabase
        .from('account_continuity_requests')
        .select('id, request_type, reason, status, created_at, admin_notes')
        .eq('account_id', accountId)
        .eq('requested_by_user_id', user.id)
        .order('created_at', { ascending: false });
      setRequests(reqs || []);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isLegacyAdmin) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-amber-600" />
          Account Continuity Requests
          <Badge className="bg-amber-100 text-amber-800 border-amber-200">Legacy Admin</Badge>
        </CardTitle>
        <CardDescription>
          As Legacy Admin, you may request continuity actions for this account. Requests are reviewed before any
          account ownership, export, or closure changes are made.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Submitting a request does not immediately change the account, billing, or ownership. Asset Safe support
            will review and contact you before any action is taken.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {(['closure', 'export', 'ownership_transfer'] as const).map(t => (
            <Button
              key={t}
              variant="outline"
              onClick={() => { setRequestType(t); setOpen(true); }}
            >
              Request {TYPE_LABEL[t]}
            </Button>
          ))}
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-2">Your Requests</h4>
          {requests.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">No requests submitted yet.</p>
          ) : (
            <div className="space-y-2">
              {requests.map(r => (
                <div key={r.id} className="border rounded-md p-3 flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{TYPE_LABEL[r.request_type] || r.request_type}</span>
                      <Badge className={STATUS_BADGE[r.status] || ''}>{STATUS_LABEL[r.status] || r.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{r.reason}</p>
                    {r.admin_notes && (
                      <p className="text-xs mt-1"><span className="font-medium">Admin note:</span> {r.admin_notes}</p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(r.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Request {TYPE_LABEL[requestType]}</DialogTitle>
            <DialogDescription>
              Submitting this request does not immediately change the account. Asset Safe will review the request
              before taking action.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Request type</Label>
              <Select value={requestType} onValueChange={(v) => setRequestType(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="closure">Account Closure</SelectItem>
                  <SelectItem value="export">Data Export</SelectItem>
                  <SelectItem value="ownership_transfer">Ownership Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Reason for request *</Label>
              <Textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} />
            </div>
            <div>
              <Label>Optional notes</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label>Contact email</Label>
                <Input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
              </div>
              <div>
                <Label>Contact phone</Label>
                <Input type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
              </div>
            </div>
            <label className="flex items-start gap-2 text-xs">
              <Checkbox checked={acknowledged} onCheckedChange={(v) => setAcknowledged(!!v)} />
              <span>
                I understand this request will be reviewed by Asset Safe and will not immediately delete, export,
                cancel billing for, or transfer ownership of this account.
              </span>
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              <Send className="h-4 w-4 mr-1" />
              {submitting ? 'Submitting…' : 'Submit Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default LegacyAdminContinuityRequests;
