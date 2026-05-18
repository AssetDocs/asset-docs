// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Row = ({ label, value }: any) => (
  <div className="flex justify-between gap-4 py-1 text-sm">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium text-right break-all">{value ?? '—'}</span>
  </div>
);

const ProposedSuccessorSummary: React.FC<{ caseData: any }> = ({ caseData }) => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!caseData?.requester_user_id) return;
    (async () => {
      const { data: profile } = await supabase.from('profiles').select('first_name,last_name').eq('user_id', caseData.requester_user_id).maybeSingle();
      const { data: legacy } = await supabase.from('legacy_admins').select('*').eq('legacy_admin_user_id', caseData.requester_user_id).eq('account_id', caseData.account_id).maybeSingle();
      const { data: membership } = await supabase.from('account_memberships').select('role,created_at').eq('user_id', caseData.requester_user_id).eq('account_id', caseData.account_id).maybeSingle();
      setData({ profile, legacy, membership });
    })();
  }, [caseData?.requester_user_id, caseData?.account_id]);

  if (!data) return <div className="text-sm text-muted-foreground p-4">Loading successor…</div>;
  const { profile, legacy, membership } = data;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Proposed Successor (Legacy Admin)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <Row label="Name" value={[profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || '—'} />
        <Row label="User ID" value={<span className="font-mono text-xs">{caseData.requester_user_id?.slice(0,8)}…</span>} />
        <Row label="Relationship" value={caseData.relationship || legacy?.relationship || '—'} />
        <Row label="Current role" value={membership?.role || 'none'} />
        <Row label="Added as authorized user" value={membership?.created_at ? new Date(membership.created_at).toLocaleDateString() : '—'} />
        <Row label="Legacy Admin since" value={legacy?.designated_at ? new Date(legacy.designated_at).toLocaleDateString() : '—'} />
        <Row label="Identity verification" value={<Badge variant="outline">{caseData.identity_verification_status || 'pending'}</Badge>} />
        <Row label="Documentation review" value={<Badge variant="outline">{caseData.documentation_status || 'pending'}</Badge>} />
        <Row label="Legal authority review" value={<Badge variant="outline">{caseData.legal_authority_status || 'pending'}</Badge>} />
      </CardContent>
    </Card>
  );
};

export default ProposedSuccessorSummary;
