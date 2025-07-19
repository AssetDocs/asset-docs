import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Home, ChevronLeft } from 'lucide-react';

interface DashboardBreadcrumbProps {
  items?: Array<{
    label: string;
    href?: string;
  }>;
  showBackButton?: boolean;
}

const DashboardBreadcrumb: React.FC<DashboardBreadcrumbProps> = ({ 
  items = [], 
  showBackButton = true 
}) => {
  const location = useLocation();

  // Define route mappings for automatic breadcrumb generation
  const routeMap: Record<string, string> = {
    '/account': 'Dashboard',
    '/account/properties': 'Properties',
    '/account/properties/new': 'Add Property',
    '/account/photos': 'Photo Gallery',
    '/account/photos/upload': 'Upload Photos',
    '/account/videos': 'Video Gallery',
    '/account/videos/upload': 'Upload Videos',
    '/account/floorplans': 'Floor Plans',
    '/account/floorplans/upload': 'Upload Floor Plans',
    '/account/documents': 'Documents',
    '/account/documents/upload': 'Upload Documents',
    '/account/insurance': 'Insurance',
    '/account/insurance/new': 'Add Insurance',
    '/account/settings': 'Account Settings'
  };

  // Generate breadcrumb items from current path if none provided
  const breadcrumbItems = items.length > 0 ? items : (() => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const generatedItems = [];
    
    // Always start with Dashboard
    generatedItems.push({
      label: 'Dashboard',
      href: '/account'
    });

    // Build path incrementally
    let currentPath = '';
    for (const segment of pathSegments) {
      currentPath += `/${segment}`;
      
      // Skip the base 'account' segment as it's already included as Dashboard
      if (segment === 'account') continue;
      
      const label = routeMap[currentPath] || segment.charAt(0).toUpperCase() + segment.slice(1);
      generatedItems.push({
        label,
        href: currentPath
      });
    }

    return generatedItems;
  })();

  // Don't show breadcrumb on the main dashboard
  if (location.pathname === '/account') {
    return null;
  }

  return (
    <div className="flex items-center gap-4 mb-6">
      {showBackButton && (
        <Button
          variant="outline"
          size="sm"
          asChild
          className="flex items-center gap-2"
        >
          <Link to="/account">
            <ChevronLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      )}
      
      <Breadcrumb className="flex-1">
        <BreadcrumbList>
          {breadcrumbItems.map((item, index) => (
            <div key={item.href || item.label} className="contents">
              <BreadcrumbItem>
                {index === breadcrumbItems.length - 1 ? (
                  <BreadcrumbPage className="flex items-center gap-1">
                    {index === 0 && <Home className="h-4 w-4" />}
                    {item.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={item.href!} className="flex items-center gap-1">
                      {index === 0 && <Home className="h-4 w-4" />}
                      {item.label}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {index < breadcrumbItems.length - 1 && <BreadcrumbSeparator />}
            </div>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};

export default DashboardBreadcrumb;