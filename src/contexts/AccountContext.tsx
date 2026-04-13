// @ts-nocheck
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';

type AccountRole = 'owner' | 'full_access' | 'read_only' | null;

interface AccountContextType {
  accountId: string | null;
  accountRole: AccountRole;
  isOwner: boolean;
  isFullAccess: boolean;
  isReadOnly: boolean;
  canEdit: boolean;
  canManageBilling: boolean;
  ownerName: string;
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

// Legacy alias so existing `useContributor()` calls don't break during migration
export const useContributor = useAccount;

export const AccountProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [accountId, setAccountId] = useState<string | null>(null);
  const [accountRole, setAccountRole] = useState<AccountRole>(null);
  const [ownerName, setOwnerName] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchAccountMembership = async () => {
    if (!user) {
      setAccountId(null);
      setAccountRole(null);
      setOwnerName('');
      setLoading(false);
      return;
    }

    try {
      // Get the user's active membership
      const { data: membership, error } = await supabase
        .from('account_memberships')
        .select('account_id, role, accounts!inner(owner_user_id)')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching account membership:', error);
        setLoading(false);
        return;
      }

      if (membership) {
        setAccountId(membership.account_id);
        setAccountRole(membership.role as AccountRole);

        // Fetch owner name if not the owner
        const ownerUserId = (membership as any).accounts?.owner_user_id;
        if (ownerUserId && ownerUserId !== user.id) {
          const { data: ownerProfile } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('user_id', ownerUserId)
            .single();

          if (ownerProfile) {
            setOwnerName(
              `${ownerProfile.first_name || ''} ${ownerProfile.last_name || ''}`.trim()
            );
          }
        } else {
          setOwnerName('');
        }
      } else {
        // No membership found — could be a brand new user before trigger fires
        setAccountId(null);
        setAccountRole(null);
        setOwnerName('');
      }
    } catch (error) {
      console.error('Error in account membership check:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshAccount = async () => {
    await fetchAccountMembership();
  };

  useEffect(() => {
    fetchAccountMembership();
  }, [user?.id]);

  const isOwner = accountRole === 'owner';
  const isFullAccess = accountRole === 'full_access';
  const isReadOnly = accountRole === 'read_only';
  const canEdit = isOwner || isFullAccess;
  const canManageBilling = isOwner;

  // Whether the user is a non-owner member (i.e. invited authorized user)
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
  const isContributorRole = isFullAccess; // maps old "contributor" to new "full_access"
  const isAdministrator = isFullAccess;
  const canDelete = isOwner;
  const canAccessSettings = isOwner;
  const canAccessEncryptedVault = isOwner || isFullAccess;
  const accountOwnerId = accountId; // In the new system, accountId is the shared ID
  const contributorName = ''; // No longer tracked here
  const contributorRole = accountRole;

  return (
    <AccountContext.Provider
      value={{
        accountId,
        accountRole,
        isOwner,
        isFullAccess,
        isReadOnly,
        canEdit,
        canManageBilling,
        ownerName,
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
