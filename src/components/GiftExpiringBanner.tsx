import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Gift, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';

const thresholdForDays = (days: number) => {
  if (days <= 3) return 3;
  if (days <= 15) return 15;
  return 30;
};

const GiftExpiringBanner: React.FC = () => {
  const { user } = useAuth();
  const { subscriptionStatus } = useSubscription();
  const [dismissedKey, setDismissedKey] = useState<string | null>(null);

  const banner = useMemo(() => {
    if (!user?.id) return null;
    if (subscriptionStatus.entitlement_source !== 'gift') return null;
    if (subscriptionStatus.billing_status === 'expired') return null;
    if (!subscriptionStatus.subscribed || !subscriptionStatus.subscription_end) return null;

    const expiresAt = new Date(subscriptionStatus.subscription_end);
    if (Number.isNaN(expiresAt.getTime())) return null;

    const msRemaining = expiresAt.getTime() - Date.now();
    const daysRemaining = Math.ceil(msRemaining / (24 * 60 * 60 * 1000));
    if (daysRemaining < 0 || daysRemaining > 30) return null;

    const threshold = thresholdForDays(daysRemaining);
    const key = `assetSafe.giftExpiring.${user.id}.${subscriptionStatus.subscription_end}.${threshold}`;
    if (dismissedKey === key) return null;
    if (typeof window !== 'undefined' && localStorage.getItem(key) === 'dismissed') return null;

    return {
      key,
      threshold,
      daysRemaining,
      expirationDate: expiresAt.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    };
  }, [dismissedKey, subscriptionStatus, user?.id]);

  if (!banner) return null;

  const dayLabel = banner.daysRemaining === 0
    ? 'today'
    : `in ${banner.daysRemaining} day${banner.daysRemaining === 1 ? '' : 's'}`;

  const dismiss = () => {
    localStorage.setItem(banner.key, 'dismissed');
    setDismissedKey(banner.key);
  };

  return (
    <Alert className="mb-4 border-blue-300 bg-blue-50">
      <Gift className="h-5 w-5 text-blue-700" />
      <div className="flex items-start justify-between gap-3">
        <div>
          <AlertTitle className="text-blue-950">Your gifted plan ends {dayLabel}</AlertTitle>
          <AlertDescription className="mt-1 text-blue-900/90">
            Your Asset Safe gift plan expires on {banner.expirationDate}. Continue with a monthly or yearly plan to keep uploads, edits, and other paid features active.
            <div className="mt-3">
              <Button asChild size="sm" className="bg-brand-orange text-white hover:bg-brand-orange/90">
                <Link to="/pricing">View Plans</Link>
              </Button>
            </div>
          </AlertDescription>
        </div>
        <Button type="button" variant="ghost" size="icon" onClick={dismiss} aria-label="Dismiss gift expiration notice">
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Alert>
  );
};

export default GiftExpiringBanner;
