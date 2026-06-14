// @ts-nocheck
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';

type AccountRole = 'owner' | 'full_access' | 'read_only' | null;
type OwnerAccountStatus =
  | 'active'
  | 'cancelled_billing_active'
  | 'expired_read_only'
  | 'deletion_requested'
  | 'scheduled_for_deletion'
  | 'deleted'
  | 'inactive'
  | string;

const READ_ONLY_ACCOUNT_STATUSES = new Set([
  'expired_read_only',
  'deletion_requested',
  'scheduled_for_deletion',
  'deleted',
  'inactive',
]);

interface AccountInfo {
  accountId: string;
  accountName: string;
  role: AccountRole;
  ownerName: string;
  ownerUserId: string;
}

interface AccountContextType {
  // Current active account
  accountId: string | null;
  accountRole: AccountRole;
  accountName: string;
  ownerName: string;
  ownerUserId: string | null;
  
  // All accessible accounts
  accounts: AccountInfo[];
  hasMultipleAccounts: boolean;
  
  // Switch function
  switchAccount: (accountId: string) => Promise<void>;

  // Workspace context flags
  isViewingOwnWorkspace: boolean;
  isViewingSharedWorkspace: boolean;
  hasPersonalWorkspace: boolean;
  ownedWorkspaceId: string | null;
  sharedWorkspaceIds: string[];

  // Permission flags
  isOwner: boolean;
  isFullAccess: boolean;
  isReadOnly: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canManageBilling: boolean;
  canAccessSettings: boolean;
  canAccessEncryptedVault: boolean;
  ownerAccountStatus: OwnerAccountStatus;
  isAccountReadOnly: boolean;
  loading: boolean;

  // Member status
  isContributor: boolean; // true if user is a non-owner member on current account
  isMember: boolean;

  // Actions
  showReadOnlyRestriction: () => void;
  refreshAccount: () => Promise<void>;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export const useAccount = () => {
  const context = useContext(AccountContext);
  if (context === undefined) {
    throw new Error('useAccount must be used within an AccountProvider');
  }
  return context;
};

// Legacy alias — kept for backward compat in App.tsx ProtectedRoute
export const useContributor = useAccount;

export const AccountProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<AccountInfo[]>([]);
  const [activeAccountId, setActiveAccountId] = useState<string | null>(null);
  const [ownerAccountStatus, setOwnerAccountStatus] = useState<OwnerAccountStatus>('active');
  const [isAccountReadOnly, setIsAccountReadOnly] = useState(false);
  const [writeStateRefreshKey, setWriteStateRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchAllMemberships = useCallback(async () => {
    if (!user) {
      setAccounts([]);
      setActiveAccountId(null);
      setOwnerAccountStatus('active');
      setIsAccountReadOnly(false);
      setLoading(false);
      return;
    }

    try {
      const { data: memberships, error } = await supabase
        .from('account_memberships')
        .select('account_id, role, accounts!inner(owner_user_id, account_name)')
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (error) {
        console.error('Error fetching memberships:', error);
        setLoading(false);
        return;
      }

      if (!memberships || memberships.length === 0) {
        setAccounts([]);
        setActiveAccountId(null);
        setOwnerAccountStatus('active');
        setIsAccountReadOnly(false);
        setLoading(false);
        return;
      }

      const ownerIds = [...new Set(memberships.map((m: any) => m.accounts?.owner_user_id).filter(Boolean))];
      
      let ownerProfiles: Record<string, string> = {};
      if (ownerIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles_safe' as any)
          .select('user_id, first_name, last_name')
          .in('user_id', ownerIds);
        
        if (profiles) {
          for (const p of profiles) {
            ownerProfiles[p.user_id] = `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Account Owner';
          }
        }
      }

      const accountList: AccountInfo[] = memberships.map((m: any) => {
        const ownerUserId = m.accounts?.owner_user_id;
        const ownerName = ownerUserId === user.id ? '' : (ownerProfiles[ownerUserId] || '');
        return {
          accountId: m.account_id,
          accountName: m.accounts?.account_name || 'My Account',
          role: m.role as AccountRole,
          ownerName,
          ownerUserId,
        };
      });

      accountList.sort((a, b) => {
        if (a.role === 'owner' && b.role !== 'owner') return -1;
        if (a.role !== 'owner' && b.role === 'owner') return 1;
        return a.accountName.localeCompare(b.accountName);
      });

      setAccounts(accountList);

      if (activeAccountId && accountList.some(a => a.accountId === activeAccountId)) {
        // keep current
      } else {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('last_used_account_id')
          .eq('user_id', user.id)
          .single();

        const lastUsed = profileData?.last_used_account_id;
        if (lastUsed && accountList.some(a => a.accountId === lastUsed)) {
          setActiveAccountId(lastUsed);
        } else {
          // If user has any shared (non-owner) memberships, prefer those by default.
          // This ensures unpaid Authorized Users land in their working shared
          // workspace instead of an unpaid personal workspace preview.
          const firstShared = accountList.find(a => a.role !== 'owner');
          setActiveAccountId(firstShared?.accountId || accountList[0]?.accountId || null);
        }
      }
    } catch (error) {
      console.error('Error in account membership check:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const switchAccount = useCallback(async (targetAccountId: string) => {
    const target = accounts.find(a => a.accountId === targetAccountId);
    if (!target) {
      toast({
        title: "Account Not Found",
        description: "You do not have access to that account.",
        variant: "destructive",
      });
      return;
    }

    setActiveAccountId(targetAccountId);

    if (user) {
      await supabase
        .from('profiles')
        .update({ last_used_account_id: targetAccountId } as any)
        .eq('user_id', user.id);
    }
  }, [accounts, user]);

  const refreshAccount = useCallback(async () => {
    setLoading(true);
    await fetchAllMemberships();
  }, [fetchAllMemberships]);

  useEffect(() => {
    fetchAllMemberships();
  }, [user?.id]);

  // Realtime: react to role changes / membership revocation pushed by the Owner.
  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel(`account-memberships-${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'account_memberships', filter: `user_id=eq.${user.id}` },
        (payload: any) => {
          const newRow = payload.new || {};
          const oldRow = payload.old || {};
          const isActiveAccount =
            newRow.account_id === activeAccountId || oldRow.account_id === activeAccountId;

          if (payload.eventType === 'UPDATE' && isActiveAccount && newRow.role !== oldRow.role) {
            const label = newRow.role === 'full_access'
              ? 'Full Access'
              : newRow.role === 'read_only' ? 'Read Only' : newRow.role;
            toast({
              title: 'Access level updated',
              description: `The account owner changed your access to ${label}.`,
            });
          }

          if (payload.eventType === 'DELETE' && isActiveAccount) {
            toast({
              title: 'Access removed',
              description: 'Your access to this account was revoked by the owner.',
              variant: 'destructive',
            });
          }

          fetchAllMemberships();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, activeAccountId, fetchAllMemberships, toast]);

  // Derive current account info
  const currentAccount = accounts.find(a => a.accountId === activeAccountId) || null;
  const accountRole = currentAccount?.role || null;
  const accountName = currentAccount?.accountName || '';
  const ownerName = currentAccount?.ownerName || '';
  const ownerUserId = currentAccount?.ownerUserId || null;

  const isOwner = accountRole === 'owner';
  const isFullAccess = accountRole === 'full_access';
  const isRoleReadOnly = accountRole === 'read_only';
  const isReadOnly = isRoleReadOnly || isAccountReadOnly;
  const canEdit = !isAccountReadOnly && (isOwner || isFullAccess);
  const canDelete = !isAccountReadOnly && isOwner;
  const canManageBilling = isOwner;
  const canAccessSettings = isOwner;
  const canAccessEncryptedVault = isOwner || isFullAccess;
  const hasMultipleAccounts = accounts.length > 1;
  const isMember = !isOwner && accountRole !== null;
  const isContributor = isMember; // legacy compat: true when non-owner member

  const ownedAccounts = accounts.filter(a => a.role === 'owner');
  const sharedAccounts = accounts.filter(a => a.role !== 'owner');
  const isViewingOwnWorkspace = accountRole === 'owner';
  const isViewingSharedWorkspace = accountRole === 'full_access' || accountRole === 'read_only';
  const hasPersonalWorkspace = ownedAccounts.length > 0;
  const ownedWorkspaceId = ownedAccounts[0]?.accountId || null;
  const sharedWorkspaceIds = sharedAccounts.map(a => a.accountId);

  useEffect(() => {
    let cancelled = false;

    const reset = () => {
      if (cancelled) return;
      setOwnerAccountStatus('active');
      setIsAccountReadOnly(false);
    };

    const loadWriteState = async () => {
      if (!user?.id || !activeAccountId) {
        reset();
        return;
      }

      try {
        const { data, error } = await supabase
          .rpc('get_account_write_state' as any, { p_account_id: activeAccountId } as any)
          .maybeSingle();

        if (!cancelled && !error && data) {
          const status = data.owner_account_status || 'active';
          setOwnerAccountStatus(status);
          setIsAccountReadOnly(!!data.is_read_only);
          return;
        }

        if (error) {
          console.error('Error fetching account write state:', error);
        }

        // Fallback for the owner if the RPC has not been applied yet.
        if (currentAccount?.ownerUserId === user.id) {
          const { data: ownProfile } = await supabase
            .from('profiles')
            .select('account_status')
            .eq('user_id', user.id)
            .maybeSingle();

          if (!cancelled) {
            const status = ownProfile?.account_status || 'active';
            setOwnerAccountStatus(status);
            setIsAccountReadOnly(READ_ONLY_ACCOUNT_STATUSES.has(status));
          }
          return;
        }

        reset();
      } catch (error) {
        console.error('Error loading account write state:', error);
        reset();
      }
    };

    loadWriteState();

    return () => {
      cancelled = true;
    };
  }, [user?.id, activeAccountId, currentAccount?.ownerUserId, writeStateRefreshKey]);

  useEffect(() => {
    if (!ownerUserId) return;

    const channel = supabase
      .channel(`owner-profile-status-${ownerUserId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `user_id=eq.${ownerUserId}` },
        (payload: { new?: { account_status?: OwnerAccountStatus }; old?: { account_status?: OwnerAccountStatus } }) => {
          const nextStatus = payload.new?.account_status;
          const previousStatus = payload.old?.account_status;

          if (nextStatus && nextStatus !== previousStatus) {
            setOwnerAccountStatus(nextStatus);
            setIsAccountReadOnly(READ_ONLY_ACCOUNT_STATUSES.has(nextStatus));
            return;
          }

          setWriteStateRefreshKey((key) => key + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [ownerUserId]);

  const showReadOnlyRestriction = () => {
    if (isAccountReadOnly) {
      toast({
        title: "Account is read-only",
        description: "This account is currently read-only. Reactivate billing or resolve the account status before making changes.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Access Restricted",
      description: "Authorized users with Read Only access are not allowed to make changes to this account.",
      variant: "destructive",
    });
  };

  return (
    <AccountContext.Provider
      value={{
        accountId: activeAccountId,
        accountRole,
        accountName,
        ownerName,
        ownerUserId,
        accounts,
        hasMultipleAccounts,
        switchAccount,
        isViewingOwnWorkspace,
        isViewingSharedWorkspace,
        hasPersonalWorkspace,
        ownedWorkspaceId,
        sharedWorkspaceIds,
        isOwner,
        isFullAccess,
        isReadOnly,
        canEdit,
        canDelete,
        canManageBilling,
        canAccessSettings,
        canAccessEncryptedVault,
        ownerAccountStatus,
        isAccountReadOnly,
        loading,
        isContributor,
        isMember,
        showReadOnlyRestriction,
        refreshAccount,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};

// Re-export as ContributorProvider for backward compat
export const ContributorProvider = AccountProvider;
