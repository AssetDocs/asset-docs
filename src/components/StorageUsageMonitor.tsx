import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Zap, TrendingUp } from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Link } from 'react-router-dom';

interface StorageUsageMonitorProps {
  usagePercentage: number;
  currentTier: string;
  className?: string;
}

const StorageUsageMonitor: React.FC<StorageUsageMonitorProps> = ({ 
  usagePercentage, 
  currentTier, 
  className 
}) => {
  const { subscriptionTier } = useSubscription();

  const getProgressColor = () => {
    if (usagePercentage >= 90) return '[&>div]:bg-destructive';
    if (usagePercentage >= 80) return '[&>div]:bg-yellow-500';
    if (usagePercentage >= 60) return '[&>div]:bg-orange-500';
    return '[&>div]:bg-primary';
  };

  const getUpgradeMessage = () => {
    if (usagePercentage >= 90) {
      return "Critical: Storage almost full! Upgrade now to avoid service disruption.";
    }
    if (usagePercentage >= 80) {
      return "Warning: You're approaching your storage limit. Consider upgrading.";
    }
    if (usagePercentage >= 60) {
      return "Notice: You're using more than half your storage space.";
    }
    return "Storage usage is within normal limits.";
  };

  const shouldShowUpgradePrompt = usagePercentage >= 80;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Storage Usage Monitor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Usage</span>
            <span className="text-2xl font-bold text-primary">
              {usagePercentage.toFixed(1)}%
            </span>
          </div>
          
          <Progress 
            value={usagePercentage} 
            className={`h-3 ${getProgressColor()}`}
          />
          
          <p className="text-sm text-muted-foreground">
            {getUpgradeMessage()}
          </p>
        </div>

        {shouldShowUpgradePrompt && (
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-4 border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-primary" />
              <span className="font-semibold text-primary">Upgrade Recommended</span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Unlock more storage space and premium features with our upgraded plans.
            </p>
            <div className="flex gap-2">
              <Button asChild size="sm">
                <Link to="/pricing">View Plans</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link to="/account?tab=storage">Manage Storage</Link>
              </Button>
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          Current Plan: <span className="font-medium capitalize">{currentTier}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default StorageUsageMonitor;