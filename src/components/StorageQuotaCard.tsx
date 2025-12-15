import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { AlertTriangle, HardDrive, RefreshCw } from 'lucide-react';
import { StorageService, type StorageQuota } from '@/services/StorageService';
import { formatStorageSize } from '@/config/subscriptionFeatures';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface StorageQuotaCardProps {
  className?: string;
}

const StorageQuotaCard: React.FC<StorageQuotaCardProps> = ({ className }) => {
  const { subscriptionTier, storageQuotaGb } = useSubscription();
  const [quota, setQuota] = useState<StorageQuota | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadStorageQuota = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Use actual storage quota from profile, not tier defaults
      const storageQuota = await StorageService.getStorageQuotaWithLimit(user.id, storageQuotaGb);
      setQuota(storageQuota);
    } catch (error) {
      console.error('Failed to load storage quota:', error);
      toast.error('Failed to load storage information');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await StorageService.refreshStorageUsage(user.id);
      await loadStorageQuota();
      toast.success('Storage usage refreshed');
    } catch (error) {
      console.error('Failed to refresh storage:', error);
      toast.error('Failed to refresh storage usage');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadStorageQuota();
  }, [subscriptionTier, storageQuotaGb]);

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Storage Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded mb-2"></div>
            <div className="h-2 bg-muted rounded mb-4"></div>
            <div className="h-4 bg-muted rounded w-24"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!quota) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Storage Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Unable to load storage information</p>
        </CardContent>
      </Card>
    );
  }

  const getProgressColor = () => {
    if (quota.isOverLimit) return '[&>div]:bg-destructive';
    if (quota.isNearLimit) return '[&>div]:bg-yellow-500';
    return '[&>div]:bg-primary';
  };

  const getStatusMessage = () => {
    if (quota.isUnlimited) return 'Unlimited storage';
    if (quota.isOverLimit) return 'Storage limit exceeded';
    if (quota.isNearLimit) return 'Approaching storage limit';
    return 'Storage usage normal';
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2">
          <HardDrive className="h-5 w-5" />
          Storage Usage
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              {(quota.isOverLimit || quota.isNearLimit) && (
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              )}
              {getStatusMessage()}
            </span>
            <span className="font-medium">
              {formatStorageSize(quota.used)}
              {quota.limit && ` / ${formatStorageSize(quota.limit)}`}
            </span>
          </div>
          
          {!quota.isUnlimited && (
            <Progress 
              value={quota.percentage} 
              className={`h-2 ${getProgressColor()}`}
            />
          )}
        </div>

        {quota.isUnlimited ? (
          <p className="text-sm text-muted-foreground">
            You have unlimited storage with your Premium subscription.
          </p>
        ) : (
          <div className="text-sm text-muted-foreground">
            <div className="flex items-center justify-between mb-2">
              <span>Storage Usage</span>
              <span className="text-lg font-semibold text-foreground">
                {quota.percentage.toFixed(1)}%
              </span>
            </div>
            {quota.percentage >= 90 && (
              <p className="text-yellow-600 font-medium mt-1">
                ⚠️ Consider upgrading your plan for more storage space.
              </p>
            )}
            {quota.percentage >= 80 && quota.percentage < 90 && (
              <p className="text-orange-600 font-medium mt-1">
                📊 You're approaching your storage limit.
              </p>
            )}
            {quota.isOverLimit && (
              <p className="text-destructive font-medium mt-1">
                🚫 You've exceeded your storage limit. Some features may be restricted.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StorageQuotaCard;