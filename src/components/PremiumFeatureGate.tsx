import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Crown, Star, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { SUBSCRIPTION_FEATURES } from '@/config/subscriptionFeatures';

interface PremiumFeatureGateProps {
  featureKey: string;
  children: React.ReactNode;
  title?: string;
  description?: string;
  variant?: 'card' | 'inline' | 'banner';
  showWhenLoading?: boolean;
}

// Consistent upgrade messaging
const PREMIUM_UPGRADE_MESSAGE = 
  "This feature is part of Premium — designed for family access, legacy continuity, and emergency preparedness.";
const UPGRADE_BUTTON_TEXT = "Upgrade to Premium";
const UPGRADE_PATH = "/account/settings?tab=subscription";

export const PremiumFeatureGate: React.FC<PremiumFeatureGateProps> = ({
  featureKey,
  children,
  title,
  description,
  variant = 'card',
  showWhenLoading = false,
}) => {
  const { subscriptionTier, loading, hasFeature } = useSubscription();

  // Show loading state
  if (loading && !showWhenLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-32 bg-muted rounded-lg"></div>
      </div>
    );
  }

  // If user has access, render children
  if (hasFeature(featureKey)) {
    return <>{children}</>;
  }

  // Get feature info for display
  const feature = SUBSCRIPTION_FEATURES[featureKey];
  const displayTitle = title || feature?.name || 'Premium Feature';
  const displayDescription = description || feature?.fallbackMessage || PREMIUM_UPGRADE_MESSAGE;

  // Inline variant - minimal lock indicator
  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Lock className="h-4 w-4" />
        <span className="text-sm italic">{displayDescription}</span>
        <Link to={UPGRADE_PATH} className="text-primary text-sm hover:underline">
          Upgrade
        </Link>
      </div>
    );
  }

  // Banner variant - horizontal alert-style
  if (variant === 'banner') {
    return (
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-800/30 rounded-full">
              <Crown className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">{displayTitle}</h4>
              <p className="text-sm text-muted-foreground mt-1">{displayDescription}</p>
            </div>
          </div>
          <Link to={UPGRADE_PATH}>
            <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white whitespace-nowrap">
              <Star className="h-4 w-4 mr-2" />
              {UPGRADE_BUTTON_TEXT}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Card variant - full card display (default)
  return (
    <Card className="border-2 border-dashed border-amber-300 dark:border-amber-700 bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-900/10 dark:to-orange-900/10">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto mb-4 p-4 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-800/30 dark:to-orange-800/30 rounded-full w-fit">
          <Crown className="h-8 w-8 text-amber-600 dark:text-amber-400" />
        </div>
        <CardTitle className="text-lg flex items-center justify-center gap-2">
          <Lock className="h-4 w-4 text-amber-600" />
          {displayTitle}
          <span className="text-xs font-normal bg-amber-100 dark:bg-amber-800/30 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full">
            Premium
          </span>
        </CardTitle>
        <CardDescription className="text-center max-w-md mx-auto">
          {displayDescription}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2 pb-6">
        <div className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            {PREMIUM_UPGRADE_MESSAGE}
          </p>
          <Button 
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
            onClick={() => window.location.href = UPGRADE_PATH}
          >
            <Star className="h-4 w-4 mr-2" />
            {UPGRADE_BUTTON_TEXT}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Simple hook to check Premium status
export const usePremiumAccess = () => {
  const { subscriptionTier, hasFeature } = useSubscription();
  
  return {
    isPremium: subscriptionTier === 'premium',
    hasLegacyLockerAccess: hasFeature('legacy_locker'),
    hasTrustedContactsAccess: hasFeature('trusted_contacts'),
    hasEmergencyAccess: hasFeature('emergency_access'),
    hasContributorAccess: hasFeature('contributor_roles'),
    hasAdvancedExports: hasFeature('advanced_exports'),
  };
};

export default PremiumFeatureGate;
