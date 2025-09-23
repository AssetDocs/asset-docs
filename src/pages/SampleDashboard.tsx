import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AssetValuesSection from '@/components/AssetValuesSection';
import PostDamageSection from '@/components/PostDamageSection';
import VoiceNotesSection from '@/components/VoiceNotesSection';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, 
  Mail, 
  Home, 
  Camera, 
  Video, 
  FileImage, 
  FileText, 
  Shield, 
  Settings, 
  Plus, 
  Users, 
  Copy,
  HelpCircle,
  Share2,
  BarChart3,
  DollarSign,
  FolderOpen,
  Clock
} from 'lucide-react';

const SampleDashboard: React.FC = () => {
  // Demo Welcome Message Component
  const DemoWelcomeMessage = () => (
    <div className="bg-gradient-to-r from-brand-blue to-brand-lightBlue p-6 rounded-lg text-white mb-6">
      <h1 className="text-2xl font-bold">
        Welcome, Demo User!
      </h1>
      <p className="text-brand-blue/80 mt-1">
        Manage your assets and documentation from your dashboard
      </p>
    </div>
  );

  // Demo Account Header Component
  const DemoAccountHeader = () => (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Account Dashboard</h2>
          <p className="text-gray-600">Manage your properties, photos, videos, documents and more</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            Account #DEMO123
            <Button
              size="sm"
              variant="ghost"
              className="h-4 w-4 p-0"
              onClick={() => alert('AssetDocs.net says\n\nDemo: Account number copied to clipboard!')}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </Badge>
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => alert('AssetDocs.net says\n\nDemo: This would show video tutorials and help content.')}
        >
          <HelpCircle className="h-4 w-4 mr-2" />
          Video Help
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => alert('AssetDocs.net says\n\nDemo: This would allow sharing your account with others.')}
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </div>
    </div>
  );

  // Demo Account Stats Component
  const DemoAccountStats = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Items</p>
              <p className="text-2xl font-bold text-brand-blue">247</p>
            </div>
            <BarChart3 className="h-8 w-8 text-brand-blue" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-green-600">$48,329</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Properties</p>
              <p className="text-2xl font-bold text-brand-blue">3</p>
            </div>
            <Home className="h-8 w-8 text-brand-blue" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Storage Used</p>
              <p className="text-2xl font-bold text-orange-600">2.4GB</p>
            </div>
            <FolderOpen className="h-8 w-8 text-orange-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Demo Storage Alert Component
  const DemoStorageAlert = () => (
    <Alert className="mb-6 border-orange-200 bg-orange-50">
      <Clock className="h-4 w-4" />
      <AlertDescription>
        <strong>Demo Account:</strong> You're currently using 2.4GB of your 5GB storage limit. 
        This would show real storage usage in a live account.
      </AlertDescription>
    </Alert>
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="flex-grow py-8 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          {/* Demo Banner */}
          <Alert className="mb-6 border-brand-blue bg-brand-blue/5">
            <Eye className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>
                <strong>Demo Dashboard</strong> - This is a sample view of the Asset Docs dashboard. 
                Features are read-only for demonstration purposes.
              </span>
            </AlertDescription>
          </Alert>

          {/* Demo Welcome Message */}
          <DemoWelcomeMessage />
          
          {/* Demo Account Header */}
          <DemoAccountHeader />

          {/* Demo Storage Alert */}
          <DemoStorageAlert />

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="asset-values">Asset Values</TabsTrigger>
              <TabsTrigger value="damage">Post Damage</TabsTrigger>
              <TabsTrigger value="voice-notes">Voice Notes</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <DemoAccountStats />
              
              {/* First Row - Management Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Account Settings Card */}
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
                        onClick={() => alert('AssetDocs.net says\n\nDemo: This allows you to update your profile, security settings, and preferences.')}
                        variant="orange" 
                        className="w-full"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Manage Settings
                      </Button>
                      <Button 
                        onClick={() => alert('AssetDocs.net says\n\nDemo: This allows you to add and manage users who can help document your assets.')}
                        variant="outline" 
                        className="w-full"
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Manage Contributors
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Property Profiles Card */}
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
                        onClick={() => alert('AssetDocs.net says\n\nDemo: This allows you to create new property profiles with square footage, room details, and property information.')}
                        className="w-full bg-brand-blue hover:bg-brand-lightBlue"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create New Property
                      </Button>
                      <Button 
                        onClick={() => alert('AssetDocs.net says\n\nDemo: This allows you to view and manage all your documented properties.')}
                        variant="outline" 
                        className="w-full"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View All Properties
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Photo Management Card */}
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
                        onClick={() => alert('AssetDocs.net says\n\nDemo: This allows you to upload photos and document your items with estimated values.')}
                        className="w-full bg-brand-blue hover:bg-brand-lightBlue"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Upload Photos
                      </Button>
                      <Button 
                        onClick={() => alert('AssetDocs.net says\n\nDemo: This allows you to view, organize, download, and categorize your uploaded photos.')}
                        variant="outline" 
                        className="w-full"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Photo Gallery
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Second Row - Media and Documents */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Video Documentation Card */}
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
                        onClick={() => alert('AssetDocs.net says\n\nDemo: This allows you to upload and manage video recordings of your property and belongings.')}
                        className="w-full bg-brand-blue hover:bg-brand-lightBlue"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Upload Videos
                      </Button>
                      <Button 
                        onClick={() => alert('AssetDocs.net says\n\nDemo: This allows you to view, watch, download, and categorize your uploaded videos.')}
                        variant="outline" 
                        className="w-full"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Videos
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Document Storage Card */}
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
                        onClick={() => alert('AssetDocs.net says\n\nDemo: This allows you to store PDFs, receipts, warranties, licenses, titles, and other important documents.')}
                        className="w-full bg-brand-blue hover:bg-brand-lightBlue"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Upload Documents
                      </Button>
                      <Button 
                        onClick={() => alert('AssetDocs.net says\n\nDemo: This allows you to view, organize, download, and manage your stored documents.')}
                        variant="outline" 
                        className="w-full"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Documents
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Insurance Information Card */}
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Shield className="h-6 w-6 mr-2 text-brand-blue" />
                      Insurance Information
                    </CardTitle>
                    <CardDescription>
                      Manage your insurance policies and claims documentation
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button 
                        onClick={() => alert('AssetDocs.net says\n\nDemo: This allows you to manage your insurance policies and claims documentation.')}
                        className="w-full bg-brand-blue hover:bg-brand-lightBlue"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Insurance Info
                      </Button>
                      <Button 
                        onClick={() => alert('AssetDocs.net says\n\nDemo: This allows you to view and manage your insurance information.')}
                        variant="outline" 
                        className="w-full"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Insurance
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="asset-values">
              <AssetValuesSection />
            </TabsContent>

            <TabsContent value="damage">
              <PostDamageSection />
            </TabsContent>

            <TabsContent value="voice-notes">
              <VoiceNotesSection />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default SampleDashboard;