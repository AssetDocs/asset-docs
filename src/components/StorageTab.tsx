import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, HardDrive, Plus, Loader2 } from 'lucide-react';
import StorageDashboard from './StorageDashboard';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { getStorageLimit, formatStorageSize } from '@/config/subscriptionFeatures';
import { FeatureGuard } from './FeatureGuard';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const StorageTab: React.FC = () => {
  const { subscriptionTier, billingStatus } = useSubscription();
  const { toast } = useToast();
  const [addingStorage, setAddingStorage] = useState(false);

  const storageLimit = getStorageLimit(subscriptionTier);
  const isUnlimited = storageLimit === null;

  const handleAddStorage = async () => {
    setAddingStorage(true);
    try {
      const { data, error } = await supabase.functions.invoke('add-storage-25gb');
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err: any) {
      toast({
        title: 'Could not start storage add-on checkout',
        description: err?.message || 'Please try again in a moment.',
        variant: 'destructive',
      });
      setAddingStorage(false);
    }
  };

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
                {subscriptionTier ? 'Asset Safe Plan' : 'Free Plan'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {isUnlimited
                  ? 'Unlimited storage space'
                  : `${formatStorageSize(storageLimit || 0)} storage limit`}
              </p>
            </div>
            <Badge variant={isUnlimited ? 'default' : 'secondary'}>
              {isUnlimited ? 'Unlimited' : formatStorageSize(storageLimit || 0)}
            </Badge>
          </div>

          {!isUnlimited && billingStatus !== 'gifted' && (
            <div className="border rounded-lg p-4 bg-muted/50">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-medium text-sm">Need more space?</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Add a 25GB storage block to your current plan. Billed monthly via Stripe.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={handleAddStorage}
                  disabled={addingStorage}
                >
                  {addingStorage ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4 mr-1" />
                  )}
                  Add 25GB
                </Button>
              </div>
              <div className="mt-3">
                <a
                  href="/pricing"
                  className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
                >
                  View Pricing
                </a>
              </div>
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
