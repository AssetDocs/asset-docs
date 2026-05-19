// @ts-nocheck
import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const ContinuityDispute: React.FC = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token') || '';
  const caseId = params.get('caseId') || '';
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    if (!reason.trim()) { toast.error('Please describe why you are disputing this request.'); return; }
    setBusy(true);

    // If we have a token, use the token RPC. Otherwise create a token-less dispute through caseId for an authenticated owner.
    let error: any = null;
    if (token) {
      const res = await supabase.rpc('submit_continuity_dispute', { _token: token, _reason: reason });
      error = res.error;
    } else if (caseId) {
      // For authenticated owners disputing from the in-app banner, update directly via RPC pattern.
      // We still call submit_continuity_dispute with a synthetic flow: insert a temporary token. Easier: update via plain update guarded by RLS.
      const upd = await supabase.from('account_continuity_requests').update({
        owner_dispute_status: 'disputed',
        owner_disputed_at: new Date().toISOString(),
        owner_dispute_reason: reason,
        status: 'escalated',
      }).eq('id', caseId);
      error = upd.error;
    } else {
      error = { message: 'Missing dispute token or case ID.' };
    }

    setBusy(false);
    if (error) { toast.error(error.message); return; }
    setDone(true);
  };

  if (done) {
    return (
      <div className="container max-w-2xl py-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-emerald-600" /> Dispute Recorded</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">
              Asset Safe has received your dispute. The continuity workflow for your account has been paused while we review.
              You may continue using your account as normal. We will follow up by email if additional information is needed.
            </p>
            <Button onClick={() => navigate('/account')}>Back to dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-12">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ShieldAlert className="h-5 w-5 text-rose-600" /> Dispute Continuity Request</CardTitle>
          <CardDescription>
            Asset Safe will immediately pause this continuity workflow and escalate it for senior review.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription className="text-sm">
              If you do not recognize this request, dispute it. Asset Safe will not transfer ownership, grant access, or take account action while a dispute is open.
            </AlertDescription>
          </Alert>
          <div>
            <Label>Why are you disputing this request?</Label>
            <Textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={5} placeholder="e.g. I did not authorize this. The named Legacy Admin is no longer authorized." />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
            <Button variant="destructive" onClick={submit} disabled={busy || !reason.trim()}>
              {busy ? 'Submitting…' : 'Submit Dispute'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContinuityDispute;
