
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, Camera, Video, FileImage, FileText, Shield, Settings, Plus, Eye, Building, Users } from 'lucide-react';
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
            <Settings className="h-6 w-6 mr-2 text-brand-blue" />
            Account Settings
          </CardTitle>
          <CardDescription>
            Update your profile, security settings, and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button 
              onClick={() => {
                const isOnSampleDashboard = window.location.pathname === '/sample-dashboard';
                if (isOnSampleDashboard) {
                  alert('AssetDocs.net says\n\nDemo: This allows you to update your profile, security settings, and preferences.');
                  return;
                }
                window.location.href = '/account/settings';
              }}
              variant="orange" 
              className="w-full"
            >
              <Settings className="h-4 w-4 mr-2" />
              Manage Settings
            </Button>
            <Button 
              onClick={() => {
                const isOnSampleDashboard = window.location.pathname === '/sample-dashboard';
                if (isOnSampleDashboard) {
                  alert('AssetDocs.net says\n\nDemo: This allows you to add and manage users who can help document your assets.');
                  return;
                }
                window.location.href = '/account/settings?tab=contributors';
              }}
              variant="outline" 
              className="w-full"
            >
              <Users className="h-4 w-4 mr-2" />
              Manage Contributors
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Home className="h-6 w-6 mr-2 text-brand-blue" />
            Property Profiles
          </CardTitle>
          <CardDescription>
            Create and manage property information, square footage, and details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button 
              onClick={() => {
                const isOnSampleDashboard = window.location.pathname === '/sample-dashboard';
                if (isOnSampleDashboard) {
                  alert('AssetDocs.net says\n\nDemo: This allows you to create new property profiles with square footage, room details, and property information.');
                  return;
                }
                window.location.href = '/account/properties/new';
              }}
              className="w-full bg-brand-blue hover:bg-brand-lightBlue"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Property
            </Button>
            <Button 
              onClick={() => {
                const isOnSampleDashboard = window.location.pathname === '/sample-dashboard';
                if (isOnSampleDashboard) {
                  alert('AssetDocs.net says\n\nDemo: This allows you to view and manage all your documented properties.');
                  return;
                }
                window.location.href = '/account/properties';
              }}
              variant="outline" 
              className="w-full"
            >
              <Eye className="h-4 w-4 mr-2" />
              View All Properties
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Camera className="h-6 w-6 mr-2 text-brand-blue" />
            Photo Management
          </CardTitle>
          <CardDescription>
            Upload photos and get AI-powered value estimates for your items
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button
              onClick={() => {
                const isOnSampleDashboard = window.location.pathname === '/sample-dashboard';
                if (isOnSampleDashboard) {
                  alert('AssetDocs.net says\n\nDemo: This allows you to upload photos and get AI-powered value estimates for your items.');
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
                  alert('AssetDocs.net says\n\nDemo: This allows you to view, organize, download, and categorize your uploaded photos.');
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
                  alert('AssetDocs.net says\n\nDemo: This allows you to upload and manage video recordings of your property and belongings.');
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
                  alert('AssetDocs.net says\n\nDemo: This allows you to view, watch, download, and categorize your uploaded videos.');
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
                  alert('AssetDocs.net says\n\nDemo: This allows you to store PDFs, receipts, warranties, licenses, titles, and other important documents.');
                  return;
                }
                window.location.href = '/account/documents/upload';
              }}
              className="w-full bg-brand-blue hover:bg-brand-lightBlue"
            >
              <Plus className="h-4 w-4 mr-2" />
              Upload Documents
            </Button>
            <Button 
              onClick={() => {
                const isOnSampleDashboard = window.location.pathname === '/sample-dashboard';
                if (isOnSampleDashboard) {
                  alert('AssetDocs.net says\n\nDemo: This allows you to view, organize, download, and manage your stored documents.');
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
                  alert('AssetDocs.net says\n\nDemo: This allows you to add and manage insurance policies, claims, and related documentation.');
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
                  alert('AssetDocs.net says\n\nDemo: This allows you to view and manage your insurance policies and claims.');
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
                alert('AssetDocs.net says\n\nDemo: This would export your complete asset summary as a PDF and ZIP file.');
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
