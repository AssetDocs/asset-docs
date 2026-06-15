import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ExternalLink, Loader2, Settings } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useAccount } from '@/contexts/AccountContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useOpenCustomerPortal } from '@/hooks/useOpenCustomerPortal';

const SubscriptionEndingBanner: React.FC = () => {
  const navigate = useNavigate();
  const { isOwner } = useAccount();
  const { subscriptionStatus, loading } = useSubscription();
  const { open: openPortal, loading: openingPortal } = useOpenCustomerPortal({ newTab: true });

  if (loading || !isOwner || !subscriptionStatus.cancel_at_period_end) {
    return null;
  }

  const endDate = subscriptionStatus.subscription_end
    ? new Date(subscriptionStatus.subscription_end)
    : null;
  const dateLabel = endDate
    ? endDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <Alert className="mb-4 border-orange-400 bg-orange-50">
      <AlertTriangle className="h-5 w-5 text-orange-600" />
      <AlertTitle className="text-orange-900">Subscription Ending</AlertTitle>
      <AlertDescription className="text-orange-900/90 space-y-3">
        <p>
          {dateLabel
            ? `Your subscription will end on ${dateLabel}.`
            : 'Your subscription is scheduled to end.'}{' '}
          You can reactivate from the billing portal before then.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            className="bg-brand-orange text-white hover:bg-brand-orange/90"
            onClick={openPortal}
            disabled={openingPortal}
          >
            {openingPortal ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <ExternalLink className="h-4 w-4 mr-1" />
            )}
            Reactivate in Billing Portal
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate('/account/settings?tab=manage')}
          >
            <Settings className="h-4 w-4 mr-1" />
            Review Manage Tab
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default SubscriptionEndingBanner;
