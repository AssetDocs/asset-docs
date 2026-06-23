// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Row = ({ label, value }: any) => (
  <div className="flex justify-between gap-4 py-1 text-sm">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium text-right break-all">{value ?? '-'}</span>
  </div>
);

const CurrentOwnershipSummary: React.FC<{ accountId: string }> = ({ accountId }) => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!accountId) return;
    (async () => {
      const { data: acc } = await supabase.from('accounts').select('*').eq('id', accountId).maybeSingle();
      if (!acc) return;
      const { data: profile } = await supabase.from('profiles').select('first_name,last_name,plan_status,subscription_tier,storage_quota_gb').eq('user_id', acc.owner_user_id).maybeSingle();
      const { count: memberCount } = await supabase.from('account_memberships').select('id', { count: 'exact', head: true }).eq('account_id', accountId).eq('status', 'active');
      const { data: legacyAdmins } = await supabase
        .from('legacy_admins')
        .select('legacy_admin_user_id,status,designation_role,designation_priority')
        .eq('account_id', accountId)
        .eq('status', 'active')
        .order('designation_priority', { ascending: true })
        .order('assigned_at', { ascending: true });
      setData({ account: acc, profile, memberCount, legacyAdmins: legacyAdmins || [] });
    })();
  }, [accountId]);

  if (!data) return <div className="text-sm text-muted-foreground p-4">Loading account...</div>;
  const { account, profile, memberCount, legacyAdmins } = data;
  const legacyAdminSummary = legacyAdmins?.length
    ? legacyAdmins
      .map((admin: any) => `${admin.designation_role || 'legacy'}:${admin.legacy_admin_user_id?.slice(0, 8)}...`)
      .join(', ')
    : 'None designated';

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span>Current Account Ownership</span>
          {account.owner_state && account.owner_state !== 'active' && (
            <Badge variant="outline" className="bg-amber-50 text-amber-900 border-amber-200">{account.owner_state}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <Row label="Name" value={[profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || '-'} />
        <Row label="User ID" value={<span className="font-mono text-xs">{account.owner_user_id?.slice(0, 8)}...</span>} />
        <Row label="Account ID" value={<span className="font-mono text-xs">{account.id.slice(0, 8)}...</span>} />
        <Row label="Account created" value={new Date(account.created_at).toLocaleDateString()} />
        <Row label="Plan" value={profile?.subscription_tier || '-'} />
        <Row label="Subscription status" value={profile?.plan_status || '-'} />
        <Row label="Storage quota" value={`${profile?.storage_quota_gb ?? '-'} GB`} />
        <Row label="Owner state" value={account.owner_state || 'active'} />
        <Row label="Active authorized users" value={memberCount ?? 0} />
        <Row label="Legacy Admins" value={legacyAdminSummary} />
        <Row label="Preservation hold" value={account.continuity_setup_required ? 'Required' : 'No'} />
      </CardContent>
    </Card>
  );
};

export default CurrentOwnershipSummary;
