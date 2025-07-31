
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, Camera, Video, FileImage, FileText, Shield, Settings, Plus, Eye, Building } from 'lucide-react';
import DownloadAllFilesButton from './DownloadAllFilesButton';
import { ExportAssetsButton } from './ExportAssetsButton';
import { FeatureButton } from '@/components/FeatureGuard';

interface AccountActionsProps {
  onCreateFloorPlan: () => void;
  showFloorPlans?: boolean;
}

const AccountActions: React.FC<AccountActionsProps> = ({ onCreateFloorPlan, showFloorPlans = true }) => {
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
          <Button asChild variant="outline" className="w-full">
            <Link to="/account/settings">
              <Settings className="h-4 w-4 mr-2" />
              Manage Settings
            </Link>
          </Button>
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
            <Button asChild className="w-full bg-brand-blue hover:bg-brand-lightBlue">
              <Link to="/account/properties/new">
                <Plus className="h-4 w-4 mr-2" />
                Create New Property
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/account/properties">
                <Eye className="h-4 w-4 mr-2" />
                View All Properties
              </Link>
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
            <FeatureButton 
              featureKey="photo_upload"
              className="w-full bg-brand-orange hover:bg-brand-orange/90"
              onClick={() => window.location.href = '/account/photos/upload'}
            >
              <Plus className="h-4 w-4 mr-2" />
              Upload Photos
            </FeatureButton>
            <Button asChild variant="outline" className="w-full">
              <Link to="/account/photos">
                <Eye className="h-4 w-4 mr-2" />
                View Photo Gallery
              </Link>
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
            <FeatureButton 
              featureKey="video_upload"
              className="w-full bg-brand-orange hover:bg-brand-orange/90"
              onClick={() => window.location.href = '/account/videos/upload'}
            >
              <Plus className="h-4 w-4 mr-2" />
              Upload Videos
            </FeatureButton>
            <Button asChild variant="outline" className="w-full">
              <Link to="/account/videos">
                <Eye className="h-4 w-4 mr-2" />
                View Videos
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {showFloorPlans && (
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileImage className="h-6 w-6 mr-2 text-brand-blue" />
              Floor Plans
            </CardTitle>
            <CardDescription>
              Upload and manage architectural drawings and floor plans
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <FeatureButton 
                featureKey="floor_plan_scanning"
                onClick={onCreateFloorPlan}
                className="w-full bg-brand-orange hover:bg-brand-orange/90"
              >
                <Building className="h-4 w-4 mr-2" />
                Create Floor Plan
              </FeatureButton>
              <Button asChild className="w-full bg-brand-blue hover:bg-brand-lightBlue">
                <Link to="/account/floorplans/upload">
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Floor Plans
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link to="/account/floorplans">
                  <Eye className="h-4 w-4 mr-2" />
                  View Floor Plans
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
            <Button asChild className="w-full bg-brand-blue hover:bg-brand-lightBlue">
              <Link to="/account/documents/upload">
                <Plus className="h-4 w-4 mr-2" />
                Upload Documents
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/account/documents">
                <Eye className="h-4 w-4 mr-2" />
                View Documents
              </Link>
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
            <Button asChild className="w-full bg-brand-orange hover:bg-brand-orange/90">
              <Link to="/account/insurance/new">
                <Plus className="h-4 w-4 mr-2" />
                Add Insurance Policy
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/account/insurance">
                <Eye className="h-4 w-4 mr-2" />
                View Insurance
              </Link>
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
          <ExportAssetsButton 
            variant="default"
            className="w-full bg-brand-green hover:bg-brand-green/90"
          />
        </CardContent>
      </Card>

      <DownloadAllFilesButton />
    </div>
  );
};

export default AccountActions;
