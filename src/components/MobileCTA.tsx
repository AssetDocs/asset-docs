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
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border safe-area-bottom w-full max-w-full overflow-hidden">
      <div className="px-4 py-4 max-w-full">
        <Button asChild className="w-full" size="lg">
          <Link to="/pricing">Create Your Digital Safety Net</Link>
        </Button>
      </div>
    </div>
  );
};

export default MobileCTA;
