// @ts-nocheck
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';

type AccountRole = 'owner' | 'full_access' | 'read_only' | null;

interface AccountInfo {
  accountId: string;
  accountName: string;
  role: AccountRole;
  ownerName: string;
}

interface AccountContextType {
  // Current active account
  accountId: string | null;
  accountRole: AccountRole;
  accountName: string;
  ownerName: string;
  
  // All accessible accounts
  accounts: AccountInfo[];
  hasMultipleAccounts: boolean;
  
  // Switch function
  switchAccount: (accountId: string) => Promise<void>;

  // Permission flags
  isOwner: boolean;
  isFullAccess: boolean;
  isReadOnly: boolean;
  canEdit: boolean;
  canManageBilling: boolean;
  loading: boolean;

  // Legacy compat aliases
  isContributor: boolean;
  isViewer: boolean;
  isContributorRole: boolean;
  isAdministrator: boolean;
  canDelete: boolean;
  canAccessSettings: boolean;
  canAccessEncryptedVault: boolean;
  accountOwnerId: string | null;
  contributorName: string;
  contributorRole: string | null;
  showViewerRestriction: () => void;
  showContributorRestriction: () => void;
  showReadOnlyRestriction: () => void;
  refreshAccount: () => Promise<void>;
  refreshContributor: () => Promise<void>;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export const useAccount = () => {
  const context = useContext(AccountContext);
  if (context === undefined) {
    throw new Error('useAccount must be used within an AccountProvider');
  }
  return context;
};

// Legacy alias
export const useContributor = useAccount;

export const AccountProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<AccountInfo[]>([]);
  const [activeAccountId, setActiveAccountId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAllMemberships = useCallback(async () => {
    if (!user) {
      setAccounts([]);
      setActiveAccountId(null);
      setLoading(false);
      return;
    }

    try {
      // Fetch all active memberships with account info
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
        setLoading(false);
        return;
      }

      // Collect unique owner user IDs to fetch names
      const ownerIds = [...new Set(memberships.map((m: any) => m.accounts?.owner_user_id).filter(Boolean))];
      
      let ownerProfiles: Record<string, string> = {};
      if (ownerIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
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
        };
      });

      // Sort: owned accounts first, then by name
      accountList.sort((a, b) => {
        if (a.role === 'owner' && b.role !== 'owner') return -1;
        if (a.role !== 'owner' && b.role === 'owner') return 1;
        return a.accountName.localeCompare(b.accountName);
      });

      setAccounts(accountList);

      // Determine which account to activate
      // 1. If we already have an active account that's still valid, keep it
      if (activeAccountId && accountList.some(a => a.accountId === activeAccountId)) {
        // keep current
      } else {
        // 2. Check last_used_account_id from profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('last_used_account_id')
          .eq('user_id', user.id)
          .single();

        const lastUsed = profileData?.last_used_account_id;
        if (lastUsed && accountList.some(a => a.accountId === lastUsed)) {
          setActiveAccountId(lastUsed);
        } else {
          // 3. Default to first account
          setActiveAccountId(accountList[0]?.accountId || null);
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

    // Persist to profiles
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

  // Derive current account info
  const currentAccount = accounts.find(a => a.accountId === activeAccountId) || null;
  const accountRole = currentAccount?.role || null;
  const accountName = currentAccount?.accountName || '';
  const ownerName = currentAccount?.ownerName || '';

  const isOwner = accountRole === 'owner';
  const isFullAccess = accountRole === 'full_access';
  const isReadOnly = accountRole === 'read_only';
  const canEdit = isOwner || isFullAccess;
  const canManageBilling = isOwner;
  const hasMultipleAccounts = accounts.length > 1;

  const isMember = !isOwner && accountRole !== null;

  const showReadOnlyRestriction = () => {
    toast({
      title: "Access Restricted",
      description: "Authorized users with Read Only access are not allowed to make changes to this account.",
      variant: "destructive",
    });
  };

  const showContributorRestriction = () => {
    toast({
      title: "Access Restricted",
      description: "Authorized users with limited access cannot modify account settings. Please contact the account owner.",
      variant: "destructive",
    });
  };

  // Legacy compat values
  const isContributor = isMember;
  const isViewer = isReadOnly;
  const isContributorRole = isFullAccess;
  const isAdministrator = isFullAccess;
  const canDelete = isOwner;
  const canAccessSettings = isOwner;
  const canAccessEncryptedVault = isOwner || isFullAccess;
  const accountOwnerId = activeAccountId;
  const contributorName = '';
  const contributorRole = accountRole;

  return (
    <AccountContext.Provider
      value={{
        accountId: activeAccountId,
        accountRole,
        accountName,
        ownerName,
        accounts,
        hasMultipleAccounts,
        switchAccount,
        isOwner,
        isFullAccess,
        isReadOnly,
        canEdit,
        canManageBilling,
        loading,
        // Legacy compat
        isContributor,
        isViewer,
        isContributorRole,
        isAdministrator,
        canDelete,
        canAccessSettings,
        canAccessEncryptedVault,
        accountOwnerId,
        contributorName,
        contributorRole,
        showViewerRestriction: showReadOnlyRestriction,
        showContributorRestriction,
        showReadOnlyRestriction,
        refreshAccount,
        refreshContributor: refreshAccount,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};

// Re-export as ContributorProvider for backward compat
export const ContributorProvider = AccountProvider;
