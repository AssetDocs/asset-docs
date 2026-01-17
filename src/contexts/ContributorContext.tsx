import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';

type ContributorRole = 'administrator' | 'contributor' | 'viewer' | null;

interface ContributorContextType {
  isContributor: boolean;
  contributorRole: ContributorRole;
  isViewer: boolean;
  isContributorRole: boolean;
  isAdministrator: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canAccessSettings: boolean;
  canAccessEncryptedVault: boolean;
  accountOwnerId: string | null;
  contributorName: string;
  ownerName: string;
  loading: boolean;
  showViewerRestriction: () => void;
  showContributorRestriction: () => void;
}

const ContributorContext = createContext<ContributorContextType | undefined>(undefined);

export const useContributor = () => {
  const context = useContext(ContributorContext);
  if (context === undefined) {
    throw new Error('useContributor must be used within a ContributorProvider');
  }
  return context;
};

export const ContributorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isContributor, setIsContributor] = useState(false);
  const [contributorRole, setContributorRole] = useState<ContributorRole>(null);
  const [accountOwnerId, setAccountOwnerId] = useState<string | null>(null);
  const [contributorName, setContributorName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContributorStatus = async () => {
      if (!user) {
        setIsContributor(false);
        setContributorRole(null);
        setAccountOwnerId(null);
        setContributorName('');
        setOwnerName('');
        setLoading(false);
        return;
      }

      try {
        // Check if user is a contributor to another account
        const { data: contributorData, error } = await supabase
          .from('contributors')
          .select('account_owner_id, first_name, last_name, role')
          .eq('contributor_user_id', user.id)
          .eq('status', 'accepted')
          .maybeSingle();

        if (error) {
          console.error('Error fetching contributor status:', error);
          setLoading(false);
          return;
        }

        if (contributorData) {
          setIsContributor(true);
          setContributorRole(contributorData.role as ContributorRole);
          setAccountOwnerId(contributorData.account_owner_id);
          setContributorName(
            `${contributorData.first_name || ''} ${contributorData.last_name || ''}`.trim()
          );

          // Fetch owner's name
          const { data: ownerProfile } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('user_id', contributorData.account_owner_id)
            .single();

          if (ownerProfile) {
            setOwnerName(
              `${ownerProfile.first_name || ''} ${ownerProfile.last_name || ''}`.trim()
            );
          }
        } else {
          setIsContributor(false);
          setContributorRole(null);
          setAccountOwnerId(null);
          setContributorName('');
          setOwnerName('');
        }
      } catch (error) {
        console.error('Error in contributor status check:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContributorStatus();
  }, [user]);

  const isViewer = isContributor && contributorRole === 'viewer';
  const isContributorRole = isContributor && contributorRole === 'contributor';
  const isAdministrator = isContributor && contributorRole === 'administrator';
  
  // Viewers can only view, contributors can edit but have settings restrictions, administrators can do everything
  const canEdit = !isContributor || contributorRole === 'contributor' || contributorRole === 'administrator';
  const canDelete = !isContributor || contributorRole === 'administrator';
  
  // Only administrators and owners can access settings tabs (billing, subscription, TFA, alerts, privacy, contributors)
  const canAccessSettings = !isContributor || contributorRole === 'administrator';
  
  // Only administrators and owners can access encrypted vault
  const canAccessEncryptedVault = !isContributor || contributorRole === 'administrator';

  const showViewerRestriction = () => {
    toast({
      title: "Access Restricted",
      description: "Authorized users with a Viewer role are not allowed to make changes to this account.",
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

  return (
    <ContributorContext.Provider
      value={{
        isContributor,
        contributorRole,
        isViewer,
        isContributorRole,
        isAdministrator,
        canEdit,
        canDelete,
        canAccessSettings,
        canAccessEncryptedVault,
        accountOwnerId,
        contributorName,
        ownerName,
        loading,
        showViewerRestriction,
        showContributorRestriction,
      }}
    >
      {children}
    </ContributorContext.Provider>
  );
};
