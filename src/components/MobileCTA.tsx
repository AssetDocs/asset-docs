import React from 'react';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';

const MobileCTA: React.FC = () => {
  const location = useLocation();
  
  // Don't show on auth/checkout pages
  const hiddenPaths = ['/login', '/signup', '/auth', '/subscription-checkout', '/gift-checkout', '/account', '/properties'];
  const shouldHide = hiddenPaths.some(path => location.pathname.startsWith(path));
  
  if (shouldHide) return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border p-4 safe-area-bottom">
      <Button asChild className="w-full" size="lg">
        <Link to="/signup">Start Your Free 30-Day Trial</Link>
      </Button>
    </div>
  );
};

export default MobileCTA;
