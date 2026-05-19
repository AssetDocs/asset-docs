// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAccount } from '@/contexts/AccountContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const ACTIVE_STATUSES = ['submitted', 'under_review', 'additional_info_requested', 'needs_documentation', 'approved', 'approved_temporary', 'approved_transfer', 'ready_to_execute', 'ownership_transfer_pending', 'transfer_pending', 'escalated'];

const ContinuityRequestBanner: React.FC = () => {
  const { user } = useAuth();
  const { accountId, isOwner } = useAccount();
  const navigate = useNavigate();
  const [request, setRequest] = useState<any>(null);

  useEffect(() => {
    if (!accountId || !isOwner) return;
    (async () => {
      const { data } = await supabase.from('account_continuity_requests')
        .select('id, status, request_type, owner_dispute_status, created_at')
        .eq('account_id', accountId)
        .in('status', ACTIVE_STATUSES)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      setRequest(data || null);
    })();
  }, [accountId, isOwner]);

  if (!request) return null;
  if (request.owner_dispute_status === 'disputed') return null;

  const recognize = async () => {
    await supabase.from('account_continuity_requests').update({
      risk_flags: { owner_recognized: true, recognized_at: new Date().toISOString() },
    }).eq('id', request.id);
    toast.success('Thanks — Asset Safe will continue reviewing.');
    setRequest(null);
  };

  return (
    <Alert className="border-amber-200 bg-amber-50 text-amber-900">
      <ShieldAlert className="h-4 w-4" />
      <AlertTitle>Continuity Request Under Review</AlertTitle>
      <AlertDescription className="space-y-3">
        <p className="text-sm">
          A Legacy Continuity request has been submitted for your account and is currently under review by Asset Safe.
          No ownership changes have occurred.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => navigate('/account?tab=continuity')}>View Details</Button>
          <Button size="sm" variant="outline" onClick={recognize}>I Recognize This Request</Button>
          <Button size="sm" variant="destructive" onClick={() => navigate('/continuity/dispute?caseId=' + request.id)}>Dispute Request</Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default ContinuityRequestBanner;
