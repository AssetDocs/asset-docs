// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAccount } from '@/contexts/AccountContext';
import ContinuityRequestWizard from './ContinuityRequestWizard';
import ContinuityRequestDetails from './ContinuityRequestDetails';
import { REQUEST_TYPE_LABEL, STATUS_LABEL, STATUS_BADGE_CLASS } from './types';

const LegacyContinuitySection: React.FC = () => {
  const { user } = useAuth();
  const { accountId } = useAccount();

  const [isLegacyAdmin, setIsLegacyAdmin] = useState(false);
  const [legacyAdminId, setLegacyAdminId] = useState<string | null>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [detailRequest, setDetailRequest] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const loadRequests = async () => {
    if (!user || !accountId) return;
    const { data } = await supabase
      .from('account_continuity_requests')
      .select('*')
      .eq('account_id', accountId)
      .eq('requested_by_user_id', user.id)
      .order('created_at', { ascending: false });
    setRequests(data || []);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user?.id || !accountId) { setLoading(false); return; }
      const { data: la } = await supabase
        .from('legacy_admins')
        .select('id, legacy_admin_user_id')
        .eq('account_id', accountId)
        .eq('status', 'active')
        .maybeSingle();
      if (cancelled) return;
      if (la && la.legacy_admin_user_id === user.id) {
        setIsLegacyAdmin(true);
        setLegacyAdminId(la.id);
        await loadRequests();
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user?.id, accountId]);

  if (loading || !isLegacyAdmin) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2 pb-1 border-b border-border">
        <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
          Continuity &amp; Preservation
        </span>
      </div>

      <Card className="border-border bg-muted/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="h-5 w-5 text-muted-foreground" />
            Continuity Request
            <Badge variant="outline" className="ml-1 text-xs font-normal">Continuity Steward</Badge>
          </CardTitle>
          <CardDescription className="text-sm leading-relaxed pt-1 space-y-2">
            <p>You have been designated as a Continuity Steward for this account.</p>
            <p>
              If the account holder becomes temporarily unavailable, incapacitated, or has passed,
              you may submit a continuity request — for emergency access, stewardship, or
              preservation. Asset Safe does not handle ownership transfer, inheritance,
              succession, or estate adjudication.
            </p>
            <p>
              Requests are manually reviewed and may require supporting documentation before any
              action is taken.
            </p>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setWizardOpen(true)} variant="default">
            Start Continuity Request
          </Button>
        </CardContent>
      </Card>

      {requests.length > 0 && (
        <div className="border border-border rounded-md">
          <div className="px-4 py-2 border-b border-border bg-muted/30">
            <h4 className="text-sm font-medium">Request History</h4>
          </div>
          <div className="divide-y divide-border">
            {requests.map(r => (
              <div key={r.id} className="px-4 py-3 flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-[200px]">
                  <div className="text-sm font-medium">
                    {REQUEST_TYPE_LABEL[r.request_type] || r.request_type}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Submitted {new Date(r.created_at).toLocaleDateString()}
                    {r.updated_at && r.updated_at !== r.created_at && (
                      <> · Updated {new Date(r.updated_at).toLocaleDateString()}</>
                    )}
                  </div>
                </div>
                <Badge variant="outline" className={STATUS_BADGE_CLASS[r.status] || ''}>
                  {STATUS_LABEL[r.status] || r.status}
                </Badge>
                <Button size="sm" variant="ghost" onClick={() => setDetailRequest(r)}>
                  View details
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <ContinuityRequestWizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        legacyAdminId={legacyAdminId}
        onSubmitted={loadRequests}
      />
      <ContinuityRequestDetails
        open={!!detailRequest}
        onOpenChange={(v) => !v && setDetailRequest(null)}
        request={detailRequest}
      />
    </section>
  );
};

export default LegacyContinuitySection;
