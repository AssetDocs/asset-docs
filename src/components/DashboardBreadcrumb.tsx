import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DashboardBreadcrumbProps {
  showBackButton?: boolean;
  parentRoute?: string;
  parentLabel?: string;
  hidePageName?: boolean;
}

const DashboardBreadcrumb: React.FC<DashboardBreadcrumbProps> = ({ 
  showBackButton = true,
  parentRoute,
  parentLabel,
  hidePageName = false,
}) => {
  const location = useLocation();

  // Define route mappings for automatic breadcrumb generation
  const routeMap: Record<string, string> = {
    '/account': 'Dashboard',
    '/account/properties': 'My Properties',
    '/account/properties/new': 'Add Property',
    '/account/photos': 'Photo Gallery',
    '/account/photos/upload': 'Upload Photos',
    '/account/videos': 'Video Gallery',
    '/account/videos/upload': 'Upload Videos',
    '/account/documents': 'Documents',
    '/account/documents/upload': 'Upload Documents',
    '/account/insurance': 'Insurance',
    '/account/insurance/new': 'Add Insurance',
    '/account/settings': 'Account Settings',
    '/account/inventory': 'Inventory',
    '/account/legacy-locker': 'Legacy Locker',
    '/account/contacts': 'VIP Contacts'
  };

  // Get current page name
  const getCurrentPageName = () => {
    // Try exact match first
    if (routeMap[location.pathname]) {
      return routeMap[location.pathname];
    }
    
    // Try to find a partial match for dynamic routes
    const pathSegments = location.pathname.split('/').filter(Boolean);
    if (pathSegments.length > 1) {
      const lastSegment = pathSegments[pathSegments.length - 1];
      return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1).replace(/-/g, ' ');
    }
    
    return 'Page';
  };

  // Don't show breadcrumb on the main dashboard
  if (location.pathname === '/account') {
    return null;
  }

  const currentPageName = getCurrentPageName();

  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="flex flex-wrap items-center gap-2">
        {showBackButton && (
          <Button
            variant="outline"
            size="sm"
            asChild
            className="flex items-center gap-2 bg-white text-brand-orange border-brand-orange hover:bg-brand-orange/10"
          >
            <Link to="/account">
              <ChevronLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        )}

        {parentRoute && parentLabel && (
          <Button
            variant="outline"
            size="sm"
            asChild
            className="flex items-center gap-2 bg-white text-brand-orange border-brand-orange hover:bg-brand-orange/10"
          >
            <Link to={parentRoute}>
              <ChevronLeft className="h-4 w-4" />
              {parentLabel}
            </Link>
          </Button>
        )}
      </div>
      
      {!hidePageName && (
        <div className="flex items-center gap-2 text-gray-600">
          <ChevronRight className="h-4 w-4" />
          <span className="font-medium text-gray-900">{currentPageName}</span>
        </div>
      )}
    </div>
  );
};

export default DashboardBreadcrumb;