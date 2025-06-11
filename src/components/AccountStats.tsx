
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Home, Camera, Video, FileText, Shield } from 'lucide-react';

const AccountStats: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <Home className="h-8 w-8 text-brand-blue" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Properties</p>
              <p className="text-2xl font-bold">2</p>
              <p className="text-xs text-gray-500">$810K total value</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <Camera className="h-8 w-8 text-brand-blue" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Photos</p>
              <p className="text-2xl font-bold">147</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <Video className="h-8 w-8 text-brand-blue" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Videos</p>
              <p className="text-2xl font-bold">8</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-brand-blue" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Documents</p>
              <p className="text-2xl font-bold">23</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-brand-blue" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold">$858.2K</p>
              <p className="text-xs text-gray-500">Including real estate</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountStats;
