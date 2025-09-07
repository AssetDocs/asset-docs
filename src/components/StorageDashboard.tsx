import React, { useEffect, useState } from 'react';
import StorageQuotaCard from './StorageQuotaCard';
import StorageBreakdownCard from './StorageBreakdownCard';
import StorageUsageMonitor from './StorageUsageMonitor';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { StorageService } from '@/services/StorageService';
import { supabase } from '@/integrations/supabase/client';

interface StorageDashboardProps {
  className?: string;
}

const StorageDashboard: React.FC<StorageDashboardProps> = ({ className }) => {
  const { subscriptionTier } = useSubscription();
  const [usagePercentage, setUsagePercentage] = useState(0);

  useEffect(() => {
    const loadUsageData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const quota = await StorageService.getStorageQuota(user.id, subscriptionTier);
        setUsagePercentage(quota.percentage);
      } catch (error) {
        console.error('Failed to load usage data:', error);
      }
    };

    loadUsageData();
  }, [subscriptionTier]);

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="grid gap-6 md:grid-cols-2">
        <StorageQuotaCard />
        <StorageBreakdownCard />
      </div>
      <StorageUsageMonitor 
        usagePercentage={usagePercentage}
        currentTier={subscriptionTier || 'basic'}
      />
    </div>
  );
};

export default StorageDashboard;