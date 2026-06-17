import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAccount } from '@/contexts/AccountContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { StorageService } from '@/services/StorageService';

interface DashboardAtAGlanceCardProps {
  onTabChange: (tab: string) => void;
}

type ProtectionStatus = 'In Progress' | 'Verified' | 'Verified+' | null;

interface AtAGlanceState {
  protectionStatus: ProtectionStatus;
  authorizedUserCount: number | null;
  legacyAdminAssigned: boolean | null;
  storageUsedGb: number | null;
  storageQuotaGb: number | null;
  storagePercentage: number | null;
}

const initialState: AtAGlanceState = {
  protectionStatus: null,
  authorizedUserCount: null,
  legacyAdminAssigned: null,
  storageUsedGb: null,
  storageQuotaGb: null,
  storagePercentage: null,
};

const bytesToGb = (bytes: number) => bytes / 1024 / 1024 / 1024;

const formatGb = (value: number | null) => {
  if (value === null || Number.isNaN(value)) return '-';
  if (value < 0.1 && value > 0) return '<0.1';
  return value.toFixed(value >= 10 ? 0 : 1);
};

const DashboardAtAGlanceCard: React.FC<DashboardAtAGlanceCardProps> = ({ onTabChange }) => {
  const navigate = useNavigate();
  const { accountId, ownerUserId, isOwner } = useAccount();
  const { storageQuotaGb } = useSubscription();
  const [state, setState] = useState<AtAGlanceState>(initialState);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!accountId || !ownerUserId) {
        setState(initialState);
        return;
      }

      const next: AtAGlanceState = { ...initialState };

      try {
        const { count } = await supabase
          .from('account_memberships')
          .select('id', { count: 'exact', head: true })
          .eq('account_id', accountId)
          .eq('status', 'active')
          .neq('role', 'owner');
        next.authorizedUserCount = count ?? 0;
      } catch {
        next.authorizedUserCount = null;
      }

      if (isOwner) {
        try {
          const { data } = await supabase
            .from('legacy_admins')
            .select('id')
            .eq('account_id', accountId)
            .eq('status', 'active')
            .maybeSingle();
          next.legacyAdminAssigned = !!data;
        } catch {
          next.legacyAdminAssigned = null;
        }

        try {
          const { data } = await supabase
            .from('account_verification')
            .select('is_verified, is_verified_plus')
            .eq('user_id', ownerUserId)
            .maybeSingle();

          if (data?.is_verified_plus) {
            next.protectionStatus = 'Verified+';
          } else if (data?.is_verified) {
            next.protectionStatus = 'Verified';
          } else {
            next.protectionStatus = 'In Progress';
          }
        } catch {
          next.protectionStatus = null;
        }

        try {
          if (storageQuotaGb > 0) {
            const quota = await StorageService.getStorageQuotaWithLimit(ownerUserId, storageQuotaGb);
            next.storageUsedGb = bytesToGb(quota.used);
            next.storageQuotaGb = storageQuotaGb;
            next.storagePercentage = quota.percentage;
          }
        } catch {
          next.storageUsedGb = null;
          next.storageQuotaGb = null;
          next.storagePercentage = null;
        }
      }

      if (!cancelled) setState(next);
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [accountId, ownerUserId, isOwner, storageQuotaGb]);

  const protectionNeedsAction = isOwner && state.protectionStatus === 'In Progress';
  const usersNeedAction = isOwner && state.authorizedUserCount === 0;
  const legacyNeedsAction = isOwner && state.legacyAdminAssigned === false;
  const storageNeedsAction = isOwner && (state.storagePercentage ?? 0) > 85;

  const rows = [
    {
      label: 'Protection Status',
      value: state.protectionStatus ?? '-',
      action: protectionNeedsAction
        ? { label: 'Complete', onClick: () => onTabChange('protection-progress') }
        : null,
    },
    {
      label: 'Authorized Users',
      value: state.authorizedUserCount === null ? '-' : String(state.authorizedUserCount),
      action: usersNeedAction
        ? { label: 'Add', onClick: () => onTabChange('access-activity') }
        : null,
    },
    {
      label: 'Legacy Admin',
      value: state.legacyAdminAssigned === null ? '-' : state.legacyAdminAssigned ? 'Assigned' : 'Not Assigned',
      action: legacyNeedsAction
        ? { label: 'Assign', onClick: () => onTabChange('access-activity') }
        : null,
    },
    {
      label: 'Storage Used',
      value: state.storageUsedGb === null || state.storageQuotaGb === null
        ? '-'
        : `${formatGb(state.storageUsedGb)} GB / ${formatGb(state.storageQuotaGb)} GB`,
      action: storageNeedsAction
        ? { label: 'Manage', onClick: () => navigate('/account/settings?tab=manage') }
        : null,
    },
  ];

  return (
    <section className="h-full text-white">
      <div className="mb-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
          Readiness
        </p>
      </div>

      <div className="space-y-2.5">
        {rows.map((row) => (
          <div key={row.label} className="flex items-baseline gap-3 border-b border-white/10 pb-2 last:border-0 last:pb-0">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] leading-tight text-white/55">{row.label}</p>
              <p className="text-sm font-semibold text-white truncate">{row.value}</p>
            </div>
            {row.action && (
              <button
                type="button"
                onClick={row.action.onClick}
                className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-white/70 hover:text-white transition-colors"
              >
                {row.action.label}
                <ArrowRight className="h-3 w-3" />
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default DashboardAtAGlanceCard;
