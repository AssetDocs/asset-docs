
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, Video, FileText, Shield, Plus, Eye } from 'lucide-react';
import DownloadAllFilesButton from './DownloadAllFilesButton';
import { ExportAssetsButton } from './ExportAssetsButton';
import { FeatureButton } from '@/components/FeatureGuard';
import { useSubscription } from '@/contexts/SubscriptionContext';

interface AccountActionsProps {}

const AccountActions: React.FC<AccountActionsProps> = () => {
  const { subscriptionTier } = useSubscription();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Camera className="h-6 w-6 mr-2 text-brand-blue" />
            Photo Management
          </CardTitle>
          <CardDescription>
            Upload photos and document your items with estimated values
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button
              onClick={() => {
                const isOnSampleDashboard = window.location.pathname === '/sample-dashboard';
                if (isOnSampleDashboard) {
                  alert('Asset Safe says\n\nDemo: This allows you to upload photos and document your items with estimated values.');
                  return;
                }
                window.location.href = '/account/photos/upload';
              }}
              className="w-full bg-brand-blue hover:bg-brand-lightBlue"
            >
              <Plus className="h-4 w-4 mr-2" />
              Upload Photos
            </Button>
            <Button 
              onClick={() => {
                const isOnSampleDashboard = window.location.pathname === '/sample-dashboard';
                if (isOnSampleDashboard) {
                  alert('Asset Safe says\n\nDemo: This allows you to view, organize, download, and categorize your uploaded photos.');
                  return;
                }
                window.location.href = '/account/photos';
              }}
              variant="outline" 
              className="w-full"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Photo Gallery
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Video className="h-6 w-6 mr-2 text-brand-blue" />
            Video Documentation
          </CardTitle>
          <CardDescription>
            Upload and manage video recordings of your property and belongings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button
              onClick={() => {
                const isOnSampleDashboard = window.location.pathname === '/sample-dashboard';
                if (isOnSampleDashboard) {
                  alert('Asset Safe says\n\nDemo: This allows you to upload and manage video recordings of your property and belongings.');
                  return;
                }
                window.location.href = '/account/videos/upload';
              }}
              className="w-full bg-brand-blue hover:bg-brand-lightBlue"
            >
              <Plus className="h-4 w-4 mr-2" />
              Upload Videos
            </Button>
            <Button 
              onClick={() => {
                const isOnSampleDashboard = window.location.pathname === '/sample-dashboard';
                if (isOnSampleDashboard) {
                  alert('Asset Safe says\n\nDemo: This allows you to view, watch, download, and categorize your uploaded videos.');
                  return;
                }
                window.location.href = '/account/videos';
              }}
              variant="outline" 
              className="w-full"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Videos
            </Button>
          </div>
        </CardContent>
      </Card>


      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-6 w-6 mr-2 text-brand-blue" />
            Document Storage
          </CardTitle>
          <CardDescription>
            Store PDFs, receipts, warranties, licenses, titles, and other important documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button 
              onClick={() => {
                const isOnSampleDashboard = window.location.pathname === '/sample-dashboard';
                if (isOnSampleDashboard) {
                  alert('Asset Safe says\n\nDemo: This allows you to store PDFs, receipts, warranties, licenses, titles, and other important documents.');
                  return;
                }
                window.location.href = '/account/documents?add=1';
              }}
              className="w-full bg-brand-blue hover:bg-brand-lightBlue"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Document
            </Button>
            <Button 
              onClick={() => {
                const isOnSampleDashboard = window.location.pathname === '/sample-dashboard';
                if (isOnSampleDashboard) {
                  alert('Asset Safe says\n\nDemo: This allows you to view, organize, download, and manage your stored documents.');
                  return;
                }
                window.location.href = '/account/documents';
              }}
              variant="outline" 
              className="w-full"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Documents
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-6 w-6 mr-2 text-brand-blue" />
            Insurance Information
          </CardTitle>
          <CardDescription>
            Manage insurance policies, claims, and related documentation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button 
              onClick={() => {
                const isOnSampleDashboard = window.location.pathname === '/sample-dashboard';
                if (isOnSampleDashboard) {
                  alert('Asset Safe says\n\nDemo: This allows you to add and manage insurance policies, claims, and related documentation.');
                  return;
                }
                window.location.href = '/account/insurance/new';
              }}
              className="w-full bg-brand-blue hover:bg-brand-lightBlue"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Insurance Policy
            </Button>
            <Button 
              onClick={() => {
                const isOnSampleDashboard = window.location.pathname === '/sample-dashboard';
                if (isOnSampleDashboard) {
                  alert('Asset Safe says\n\nDemo: This allows you to view and manage your insurance policies and claims.');
                  return;
                }
                window.location.href = '/account/insurance';
              }}
              variant="outline" 
              className="w-full"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Insurance
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-6 w-6 mr-2 text-brand-blue" />
            Export Assets
          </CardTitle>
          <CardDescription>
            Generate a comprehensive PDF summary and download all your assets in a zip file
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => {
              // Mock export for sample dashboard
              const isOnSampleDashboard = window.location.pathname === '/sample-dashboard';
              if (isOnSampleDashboard) {
                alert('Asset Safe says\n\nDemo: This would export your complete asset summary as a PDF and ZIP file.');
                return;
              }
            }}
            variant="default"
            className="w-full bg-brand-green hover:bg-brand-green/90"
          >
            <FileText className="mr-2 h-4 w-4" />
            Export Assets
          </Button>
        </CardContent>
      </Card>

      <DownloadAllFilesButton />
    </div>
  );
};

export default AccountActions;
