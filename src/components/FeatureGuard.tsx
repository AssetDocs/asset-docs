import React from 'react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FeatureGuardProps {
  featureKey: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgrade?: boolean;
}

export const FeatureGuard: React.FC<FeatureGuardProps> = ({
  featureKey,
  children,
  fallback,
  showUpgrade = true,
}) => {
  const { hasFeature, checkFeatureAccess, loading } = useSubscription();

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-muted rounded w-1/2"></div>
      </div>
    );
  }

  const { hasAccess, feature } = checkFeatureAccess(featureKey);

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showUpgrade) {
    return null;
  }

  return (
    <Card className="border-dashed border-2 border-muted-foreground/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-amber-500" />
          <CardTitle className="text-base">{feature?.name || 'Premium Feature'}</CardTitle>
        </div>
        <CardDescription>
          {feature?.fallbackMessage || 'This feature requires a subscription upgrade.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Link to="/pricing">
          <Button size="sm" className="w-full">
            <Lock className="h-4 w-4 mr-2" />
            Upgrade Plan
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

interface InlineFeatureGuardProps {
  featureKey: string;
  children: React.ReactNode;
  fallbackText?: string;
}

export const InlineFeatureGuard: React.FC<InlineFeatureGuardProps> = ({
  featureKey,
  children,
  fallbackText,
}) => {
  const { hasFeature, checkFeatureAccess } = useSubscription();
  const { hasAccess, feature } = checkFeatureAccess(featureKey);

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallbackText) {
    return <span className="text-muted-foreground italic">{fallbackText}</span>;
  }

  return (
    <span className="text-muted-foreground italic">
      {feature?.fallbackMessage || 'Premium feature'}
    </span>
  );
};

interface FeatureButtonProps {
  featureKey: string;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export const FeatureButton: React.FC<FeatureButtonProps> = ({
  featureKey,
  children,
  onClick,
  disabled = false,
  ...buttonProps
}) => {
  const { hasFeature, checkFeatureAccess } = useSubscription();
  const { hasAccess, feature } = checkFeatureAccess(featureKey);

  const handleClick = () => {
    if (hasAccess && onClick) {
      onClick();
    } else if (!hasAccess) {
      // Could show a toast or redirect to pricing
      window.location.href = '/pricing';
    }
  };

  return (
    <Button
      {...buttonProps}
      onClick={handleClick}
      disabled={disabled}
      title={!hasAccess ? feature?.fallbackMessage : undefined}
    >
      {!hasAccess && <Lock className="h-4 w-4 mr-2" />}
      {children}
    </Button>
  );
};