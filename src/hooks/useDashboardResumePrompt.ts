import { useEffect, useMemo, useState } from 'react';
import { useVerification } from '@/hooks/useVerification';
import { useAuth } from '@/contexts/AuthContext';
import { useAccount } from '@/contexts/AccountContext';
import { supabase } from '@/integrations/supabase/client';

export type DashboardResumePrompt =
  | {
      kind: 'resume' | 'recommended';
      prefix: 'Continue where you left off:' | 'Recommended next step:';
      label: string;
      route: string;
    }
  | {
      kind: 'status';
      message: string;
    };

type ResumeActivityRow = {
  activity_label: string;
  destination_route: string;
};

const getRecommendedRoute = (label: string): string => {
  if (label === 'Complete Your Profile') return '/account/settings';
  if (label === 'Create Your First Property') return '/account/properties';
  if (label === 'Upload Your First Photos or Videos') return '/account/photos';
  if (label === 'Add an Authorized User') return '/account?tab=access-activity';
  if (label === 'Enable Multi-Factor Authentication') return '/account/settings?tab=security';
  if (label === 'Upload Important Documents & Records') return '/account/documents';
  if (label === 'Enable Secure Vault Protection') return '/account?tab=password-catalog';
  if (label === 'Add Legacy Locker Details') return '/account?tab=legacy-locker';
  if (label === 'Assign a Recovery Delegate') return '/account?tab=access-activity';
  return '/account';
};

export function useDashboardResumePrompt(): DashboardResumePrompt | null {
  const { user, profile } = useAuth();
  const { accountId } = useAccount();
  const { status } = useVerification();
  const [activity, setActivity] = useState<ResumeActivityRow | null>(null);
  const [loadingActivity, setLoadingActivity] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadActivity = async () => {
      if (!user || !accountId) {
        setActivity(null);
        setLoadingActivity(false);
        return;
      }

      setLoadingActivity(true);
      const { data, error } = await (supabase as any)
        .from('dashboard_resume_activities')
        .select('activity_label,destination_route')
        .eq('user_id', user.id)
        .eq('account_id', accountId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        console.error('Failed to load dashboard resume activity:', error);
        setActivity(null);
      } else {
        setActivity((data || null) as ResumeActivityRow | null);
      }
      setLoadingActivity(false);
    };

    loadActivity();
    return () => { cancelled = true; };
  }, [user, accountId]);

  return useMemo(() => {
    if (loadingActivity) return null;

    if (activity?.activity_label && activity.destination_route) {
      return {
        kind: 'resume',
        prefix: 'Continue where you left off:',
        label: activity.activity_label,
        route: activity.destination_route,
      };
    }

    const criteria = status?.criteria;
    const allTasks = [
      { label: 'Complete Your Profile', completed: criteria?.profile_complete ?? !!(profile?.first_name), phase: 1 },
      { label: 'Create Your First Property', completed: criteria?.has_property ?? false, phase: 1 },
      { label: 'Upload Your First Photos or Videos', completed: (criteria?.upload_count ?? 0) >= 1, phase: 1 },
      { label: 'Add an Authorized User', completed: criteria?.has_contributors ?? false, phase: 2 },
      { label: 'Enable Multi-Factor Authentication', completed: criteria?.has_2fa ?? false, phase: 2 },
      { label: 'Upload Important Documents & Records', completed: criteria?.has_documents ?? false, phase: 2 },
      { label: 'Enable Secure Vault Protection', completed: criteria?.has_vault_encryption ?? false, phase: 3 },
      { label: 'Add Legacy Locker Details', completed: criteria?.has_vault_data_and_passwords ?? false, phase: 3 },
      { label: 'Assign a Recovery Delegate', completed: criteria?.has_recovery_delegate ?? false, phase: 3 },
    ];

    const nextTask = (() => {
      if (status?.is_verified_plus) return null;
      if (status?.is_verified) {
        return allTasks.find(task => task.label === 'Enable Multi-Factor Authentication' && !task.completed) ?? null;
      }
      return allTasks.find(task => !task.completed) ?? null;
    })();

    if (nextTask) {
      return {
        kind: 'recommended',
        prefix: 'Recommended next step:',
        label: nextTask.label,
        route: getRecommendedRoute(nextTask.label),
      };
    }

    return {
      kind: 'status',
      message: 'Great progress - your account is well on its way.',
    };
  }, [activity, loadingActivity, profile?.first_name, status]);
}
