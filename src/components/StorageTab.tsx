import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, ArrowUp, HardDrive } from 'lucide-react';
import StorageDashboard from './StorageDashboard';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { getStorageLimit, formatStorageSize } from '@/config/subscriptionFeatures';
import { FeatureGuard } from './FeatureGuard';

const StorageTab: React.FC = () => {
  const { subscriptionTier, hasFeature } = useSubscription();
  const [showUpgradeOptions, setShowUpgradeOptions] = useState(false);

  const storageLimit = getStorageLimit(subscriptionTier);
  const isUnlimited = storageLimit === null;

  const getUpgradeRecommendation = () => {
    switch (subscriptionTier) {
      case 'free':
        return {
          tier: 'Basic',
          storage: '250GB',
          price: '$7.99/month',
          benefits: ['250GB storage', 'AI valuations', 'Basic support']
        };
      case 'basic':
        return {
          tier: 'Standard',
          storage: '500GB',
          price: '$19.99/month',
          benefits: ['500GB storage', 'Multiple properties', 'Priority support']
        };
      case 'standard':
        return {
          tier: 'Premium',
          storage: 'Unlimited',
          price: '$39.99/month',
          benefits: ['Unlimited storage', 'Advanced AI', 'Professional services']
        };
      default:
        return null;
    }
  };

  const upgradeOption = getUpgradeRecommendation();

  return (
    <div className="space-y-6">
      {/* Current Storage Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Storage Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">
                {subscriptionTier ? 
                  `${subscriptionTier.charAt(0).toUpperCase() + subscriptionTier.slice(1)} Plan` : 
                  'Free Plan'
                }
              </h3>
              <p className="text-sm text-muted-foreground">
                {isUnlimited ? 
                  'Unlimited storage space' : 
                  `${formatStorageSize(storageLimit || 0)} storage limit`
                }
              </p>
            </div>
            <Badge variant={isUnlimited ? 'default' : 'secondary'}>
              {isUnlimited ? 'Unlimited' : formatStorageSize(storageLimit || 0)}
            </Badge>
          </div>

          {!isUnlimited && upgradeOption && (
            <div className="border rounded-lg p-4 bg-muted/50">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium text-sm">Need more storage?</h4>
                  <p className="text-xs text-muted-foreground">
                    Upgrade to {upgradeOption.tier} for {upgradeOption.storage}
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => setShowUpgradeOptions(!showUpgradeOptions)}
                  variant="outline"
                >
                  <ArrowUp className="h-4 w-4 mr-1" />
                  Upgrade
                </Button>
              </div>
              
              {showUpgradeOptions && (
                <div className="border-t pt-3 mt-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{upgradeOption.tier} Plan</span>
                      <span className="font-medium">{upgradeOption.price}</span>
                    </div>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {upgradeOption.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-center gap-1">
                          <span className="w-1 h-1 bg-current rounded-full"></span>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                    <Button 
                      size="sm" 
                      className="w-full mt-3"
                      onClick={() => window.open('/pricing', '_blank')}
                    >
                      View Pricing Plans
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Storage Usage Dashboard */}
      <FeatureGuard
        featureKey="storage_limits"
        fallback={
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-center space-y-2">
                <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto" />
                <p className="text-muted-foreground">Storage monitoring requires a subscription</p>
                <Button variant="outline" onClick={() => window.open('/pricing', '_blank')}>
                  View Plans
                </Button>
              </div>
            </CardContent>
          </Card>
        }
      >
        <StorageDashboard />
      </FeatureGuard>

      {/* Storage Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Storage Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <span className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0"></span>
              <div>
                <p className="font-medium">Optimize file sizes</p>
                <p className="text-muted-foreground">Compress images and videos before uploading to save space.</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0"></span>
              <div>
                <p className="font-medium">Remove unused files</p>
                <p className="text-muted-foreground">Regularly review and delete files you no longer need.</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0"></span>
              <div>
                <p className="font-medium">Use appropriate formats</p>
                <p className="text-muted-foreground">JPEG for photos, MP4 for videos, and PDF for documents.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StorageTab;