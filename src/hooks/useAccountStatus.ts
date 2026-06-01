// @ts-nocheck
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type AccountStatus =
  | 'active'
  | 'cancelled_billing_active'
  | 'expired_read_only'
  | 'deletion_requested'
  | 'scheduled_for_deletion'
  | 'deleted';

const READ_ONLY_STATUSES: AccountStatus[] = [
  'expired_read_only',
  'deletion_requested',
  'scheduled_for_deletion',
];

export function useAccountStatus() {
  const { user } = useAuth();
  const [accountStatus, setAccountStatus] = useState<AccountStatus>('active');
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    if (!user?.id) {
      setAccountStatus('active');
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from('profiles')
      .select('account_status')
      .eq('user_id', user.id)
      .maybeSingle();
    setAccountStatus((data?.account_status as AccountStatus) || 'active');
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, [user?.id]);

  return {
    accountStatus,
    isReadOnly: READ_ONLY_STATUSES.includes(accountStatus),
    isDeletionRequested:
      accountStatus === 'deletion_requested' ||
      accountStatus === 'scheduled_for_deletion',
    loading,
    refresh,
  };
}

export function useCanWrite(): boolean {
  const { isReadOnly } = useAccountStatus();
  return !isReadOnly;
}
