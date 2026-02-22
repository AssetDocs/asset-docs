import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { SubscriptionTier, SUBSCRIPTION_FEATURES, hasFeatureAccess } from '@/config/subscriptionFeatures';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionStatus {
  subscribed: boolean;
  subscription_tier?: string;
  subscription_end?: string;
  plan_status?: string;
  property_limit?: number;
  storage_quota_gb?: number;
  is_trial?: boolean;
  trial_end?: string;
  // New fields from hardened entitlements
  plan_lookup_key?: string;
  base_storage_gb?: number;
  storage_addon_blocks_qty?: number;
  total_storage_gb?: number;
  cancel_at_period_end?: boolean;
}

interface SubscriptionContextType {
  subscriptionStatus: SubscriptionStatus;
  subscriptionTier: SubscriptionTier | null;
  loading: boolean;
  isInTrial: boolean;
  isPremium: boolean;
  propertyLimit: number;
  storageQuotaGb: number;
  hasFeature: (featureKey: string) => boolean;
  checkFeatureAccess: (featureKey: string) => { hasAccess: boolean; feature: any };
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

const mapTierToEnum = (tier?: string): SubscriptionTier | null => {
  if (!tier) return null;
  
  switch (tier.toLowerCase()) {
    case 'standard':
      return 'standard';
    case 'premium':
    case 'enterprise':
      return 'premium';
    case 'free':
      return null;
    default:
      return 'standard';
  }
};

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({ subscribed: false });
  const [loading, setLoading] = useState(true);

  const subscriptionTier = mapTierToEnum(subscriptionStatus.subscription_tier);
  const isInTrial = false;
  const isPremium = subscriptionTier === 'premium';
  const propertyLimit = subscriptionStatus.property_limit || 999999;
  // Use total_storage_gb from entitlements as authoritative quota
  const storageQuotaGb = subscriptionStatus.total_storage_gb || subscriptionStatus.storage_quota_gb || 0;

  const checkSubscription = async () => {
    if (!user) {
      setSubscriptionStatus({ subscribed: false });
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      if (error) throw error;
      setSubscriptionStatus(data);
    } catch (error) {
      console.error('Error checking subscription:', error);
      setSubscriptionStatus({ subscribed: false });
      toast({
        title: "Subscription Check Failed",
        description: "Unable to verify subscription status. Some features may be limited.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const hasFeature = (featureKey: string): boolean => {
    const feature = SUBSCRIPTION_FEATURES[featureKey];
    if (!feature) return true;
    return hasFeatureAccess(subscriptionTier, feature.requiredTier, isInTrial);
  };

  const checkFeatureAccess = (featureKey: string) => {
    const feature = SUBSCRIPTION_FEATURES[featureKey];
    if (!feature) {
      return { hasAccess: true, feature: null };
    }
    const hasAccess = hasFeatureAccess(subscriptionTier, feature.requiredTier, isInTrial);
    return { hasAccess, feature };
  };

  const refreshSubscription = async () => {
    setLoading(true);
    await checkSubscription();
  };

  useEffect(() => {
    checkSubscription();
  }, [user]);

  const value: SubscriptionContextType = {
    subscriptionStatus,
    subscriptionTier,
    loading,
    isInTrial,
    isPremium,
    propertyLimit,
    storageQuotaGb,
    hasFeature,
    checkFeatureAccess,
    refreshSubscription,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};
