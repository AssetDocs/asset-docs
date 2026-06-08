// @ts-nocheck
import React from 'react';
import { AlertTriangle, CreditCard, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useAccountStatus } from '@/hooks/useAccountStatus';
import { useAccount } from '@/contexts/AccountContext';
import { useOpenCustomerPortal } from '@/hooks/useOpenCustomerPortal';

/**
 * Owner-only billing grace-period warning.
 * Shown when a payment failed but the account is still active until grace_period_ends_at.
 * Hidden for Authorized Users — they never see billing details.
 */
const GracePeriodBanner: React.FC = () => {
  const { isInGracePeriod, gracePeriodEndsAt, loading } = useAccountStatus();
  const { isOwner } = useAccount() as any;
  const { open: openPortal, loading: opening } = useOpenCustomerPortal({ newTab: true });

  if (loading || !isInGracePeriod || !isOwner) return null;

  const endsAt = gracePeriodEndsAt ? new Date(gracePeriodEndsAt) : null;
  const dateLabel = endsAt
    ? endsAt.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })
    : '';


  return (
    <Alert className="mb-4 border-amber-400 bg-amber-50">
      <AlertTriangle className="h-5 w-5 text-amber-600" />
      <AlertTitle className="text-amber-900">Payment Needs Attention</AlertTitle>
      <AlertDescription className="text-amber-900/90 space-y-3">
        <p>
          We couldn't process your latest payment. Your account remains active
          {dateLabel ? ` until ${dateLabel}` : ''}. Please update your payment method to avoid read-only access.
        </p>
        <Button
          size="sm"
          className="bg-amber-600 text-white hover:bg-amber-700"
          onClick={openPortal}
          disabled={opening}
        >
          {opening ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <CreditCard className="h-4 w-4 mr-1" />}
          Update Payment Method
        </Button>
      </AlertDescription>
    </Alert>
  );
};

export default GracePeriodBanner;
