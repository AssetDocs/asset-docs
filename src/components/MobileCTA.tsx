import React from 'react';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';
import { useSubscription } from '@/contexts/SubscriptionContext';

const MobileCTA: React.FC = () => {
  const location = useLocation();
  const { subscriptionTier } = useSubscription();
  
  // Don't show on auth/checkout pages
  const hiddenPaths = ['/login', '/signup', '/auth', '/subscription-checkout', '/gift-checkout', '/account', '/properties'];
  const shouldHide = hiddenPaths.some(path => location.pathname.startsWith(path));
  
  // Hide for active subscribers
  if (shouldHide || subscriptionTier) return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border p-4 safe-area-bottom">
      <Button asChild className="w-full" size="lg">
        <Link to="/pricing">Create Your Digital Safety Net</Link>
      </Button>
    </div>
  );
};

export default MobileCTA;
