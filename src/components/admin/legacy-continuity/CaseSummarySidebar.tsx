// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Separator } from '@/components/ui/separator';

const Row = ({ label, value }: any) => (
  <div className="flex justify-between gap-3 py-1 text-xs">
    <span className="text-muted-foreground">{label}</span>
    <span className="text-right break-all">{value || '—'}</span>
  </div>
);

const Section = ({ title, children }: any) => (
  <div className="space-y-1">
    <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{title}</h4>
    <div className="space-y-0">{children}</div>
  </div>
);

const CaseSummarySidebar: React.FC<{ caseData: any }> = ({ caseData }) => {
  const [holder, setHolder] = useState<any>(null);
  const [legacyAdmin, setLegacyAdmin] = useState<any>(null);
  const [legacyAdminProfile, setLegacyAdminProfile] = useState<any>(null);

  useEffect(() => {
    (async () => {
      // Account holder = account owner via accounts table
      if (caseData.account_id) {
        const { data: acc } = await supabase.from('accounts').select('owner_user_id, created_at, account_name').eq('id', caseData.account_id).maybeSingle();
        if (acc?.owner_user_id) {
          const { data: prof } = await supabase.from('profiles').select('*').eq('user_id', acc.owner_user_id).maybeSingle();
          setHolder({ ...prof, account_created: acc.created_at, account_name: acc.account_name });
        }
      }
      // Legacy admin = requester
      if (caseData.requested_by_user_id) {
        const { data: prof } = await supabase.from('profiles').select('*').eq('user_id', caseData.requested_by_user_id).maybeSingle();
        setLegacyAdminProfile(prof);
        const { data: la } = await supabase.from('legacy_admins').select('*').eq('account_id', caseData.account_id).eq('legacy_admin_user_id', caseData.requested_by_user_id).maybeSingle();
        setLegacyAdmin(la);
      }
    })();
  }, [caseData?.id]);

  return (
    <div className="p-4 space-y-5">
      <Section title="Case">
        <Row label="Case ID" value={<span className="font-mono">{caseData.id?.slice(0, 8)}…</span>} />
        <Row label="Submitted" value={new Date(caseData.created_at).toLocaleString()} />
        <Row label="Last Updated" value={new Date(caseData.updated_at || caseData.created_at).toLocaleString()} />
        <Row label="Assigned Reviewer" value={caseData.assigned_reviewer_id ? `${caseData.assigned_reviewer_id.slice(0, 8)}…` : 'Unassigned'} />
        <Row label="Preservation Hold" value={caseData.preservation_hold ? 'Applied' : 'No'} />
      </Section>
      <Separator />
      <Section title="Account Holder">
        <Row label="Name" value={holder ? `${holder.first_name || ''} ${holder.last_name || ''}`.trim() : '—'} />
        <Row label="Account #" value={holder?.account_number} />
        <Row label="Plan Status" value={holder?.plan_status} />
        <Row label="Account Created" value={holder?.account_created ? new Date(holder.account_created).toLocaleDateString() : '—'} />
      </Section>
      <Separator />
      <Section title="Legacy Admin">
        <Row label="Name" value={legacyAdminProfile ? `${legacyAdminProfile.first_name || ''} ${legacyAdminProfile.last_name || ''}`.trim() : '—'} />
        <Row label="Relationship" value={caseData.metadata?.relationship} />
        <Row label="Legal Authority" value={caseData.metadata?.legal_authorization} />
        <Row label="Account Holder Passed Away" value={caseData.metadata?.passed_away} />
        <Row label="Designated" value={legacyAdmin?.created_at ? new Date(legacyAdmin.created_at).toLocaleDateString() : '—'} />
        <Row label="Designation Status" value={legacyAdmin?.status} />
      </Section>
    </div>
  );
};

export default CaseSummarySidebar;
