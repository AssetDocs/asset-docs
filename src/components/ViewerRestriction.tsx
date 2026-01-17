import React from 'react';
import { useContributor } from '@/contexts/ContributorContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Lock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ViewerRestrictionProps {
  children: React.ReactNode;
  fallbackMessage?: string;
  showCard?: boolean;
}

// Full page/section restriction - shows a card with lock message
export const ViewerRestriction: React.FC<ViewerRestrictionProps> = ({ 
  children, 
  fallbackMessage = "Authorized users with a Viewer role are not allowed to make changes to this account.",
  showCard = true
}) => {
  const { isViewer } = useContributor();

  if (isViewer) {
    if (showCard) {
      return (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <Eye className="h-5 w-5" />
              View Only Access
            </CardTitle>
            <CardDescription className="text-amber-700">
              {fallbackMessage}
            </CardDescription>
          </CardHeader>
        </Card>
      );
    }
    return (
      <Alert className="border-amber-200 bg-amber-50">
        <Eye className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800">
          {fallbackMessage}
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
};

// Inline restriction - shows alert banner above content
export const ViewerRestrictionBanner: React.FC = () => {
  const { isViewer, contributorName, ownerName } = useContributor();

  if (!isViewer) return null;

  return (
    <Alert className="border-amber-200 bg-amber-50 mb-4">
      <Eye className="h-4 w-4 text-amber-600" />
      <AlertDescription className="text-amber-800">
        You are viewing <strong>{ownerName || 'this account'}</strong>'s dashboard as a <strong>Viewer</strong>. 
        Viewers have read-only access and cannot make changes.
      </AlertDescription>
    </Alert>
  );
};

// Hook for checking viewer status in event handlers
export const useViewerCheck = () => {
  const { isViewer, showViewerRestriction, canEdit, canDelete } = useContributor();
  
  const checkCanEdit = (action?: () => void): boolean => {
    if (isViewer) {
      showViewerRestriction();
      return false;
    }
    if (action) action();
    return true;
  };

  const checkCanDelete = (action?: () => void): boolean => {
    if (!canDelete) {
      showViewerRestriction();
      return false;
    }
    if (action) action();
    return true;
  };

  return { isViewer, canEdit, canDelete, checkCanEdit, checkCanDelete };
};

export default ViewerRestriction;
