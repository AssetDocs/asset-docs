
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Info, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

const StorageAlert: React.FC = () => {
  return (
    <Alert className="border-orange-200 bg-orange-50 mb-6">
      <Info className="h-4 w-4 text-orange-600" />
      <AlertDescription className="flex items-center justify-between">
        <span className="text-orange-800">
          Running low on storage? Upgrade your subscription for more space.
        </span>
        <Button asChild variant="outline" size="sm" className="ml-4">
          <Link to="/account-settings">
            <Settings className="h-4 w-4 mr-2" />
            Account Settings
          </Link>
        </Button>
      </AlertDescription>
    </Alert>
  );
};

export default StorageAlert;
