import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AssetValuesSection from '@/components/AssetValuesSection';
import PostDamageSection from '@/components/PostDamageSection';
import VoiceNotesSection from '@/components/VoiceNotesSection';
import DemoLegacyLocker from "@/components/DemoLegacyLocker";
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Eye, 
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
  Clock,
  Download,
  Lock,
  CheckCircle2,
  AlertCircle,
  Globe,
  ExternalLink
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

  // Demo Storage Dashboard Component
  const DemoStorageDashboard = () => (
    <div className="grid gap-6 md:grid-cols-2 mb-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FolderOpen className="h-5 w-5 mr-2 text-brand-blue" />
            Storage Usage
          </CardTitle>
          <CardDescription>
            Track your storage usage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Used</span>
              <span className="font-semibold">2.4 GB of 5 GB</span>
            </div>
            <Progress value={48} className="h-2" />
            <p className="text-xs text-gray-500">48% of storage used</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-brand-blue" />
            Storage Breakdown
          </CardTitle>
          <CardDescription>
            How your storage is allocated
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Camera className="h-4 w-4 text-blue-500" />
              <span className="text-sm">Photos</span>
            </div>
            <span className="text-sm font-semibold">1.2 GB</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Video className="h-4 w-4 text-purple-500" />
              <span className="text-sm">Videos</span>
            </div>
            <span className="text-sm font-semibold">0.8 GB</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-green-500" />
              <span className="text-sm">Documents</span>
            </div>
            <span className="text-sm font-semibold">0.4 GB</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Demo Documentation Checklist Component
  const DemoDocumentationChecklist = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <CheckCircle2 className="h-5 w-5 mr-2 text-brand-blue" />
          Documentation Checklist
        </CardTitle>
        <CardDescription>
          Track your documentation progress
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium">Property Profile Created</span>
            </div>
            <Badge variant="outline" className="bg-green-100 text-green-800">Complete</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium">Photos Uploaded</span>
            </div>
            <Badge variant="outline" className="bg-green-100 text-green-800">Complete</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <span className="text-sm font-medium">Insurance Information</span>
            </div>
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800">In Progress</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-gray-400" />
              <span className="text-sm font-medium">Video Documentation</span>
            </div>
            <Badge variant="outline" className="bg-gray-100 text-gray-600">Not Started</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Demo Source Websites Component
  const DemoSourceWebsites = () => {
    const dummyWebsites = [
      {
        id: '1',
        website_name: 'Amazon',
        website_url: 'https://www.amazon.com',
        description: 'Online retailer for electronics, furniture, and household items',
        category: 'E-commerce'
      },
      {
        id: '2',
        website_name: 'Best Buy',
        website_url: 'https://www.bestbuy.com',
        description: 'Electronics and appliance retailer',
        category: 'Electronics'
      },
      {
        id: '3',
        website_name: 'Wayfair',
        website_url: 'https://www.wayfair.com',
        description: 'Furniture and home decor online store',
        category: 'Furniture'
      },
      {
        id: '4',
        website_name: 'Home Depot',
        website_url: 'https://www.homedepot.com',
        description: 'Home improvement and hardware supplies',
        category: 'Home Improvement'
      }
    ];

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Globe className="h-6 w-6 mr-2 text-brand-blue" />
                Source Websites
              </CardTitle>
              <CardDescription>
                Track where you purchased your items for warranty and reference purposes
              </CardDescription>
            </div>
            <Button 
              onClick={() => alert('AssetDocs.net says\n\nDemo: This would allow you to add a new source website to track where you purchased items.')}
              className="bg-brand-blue hover:bg-brand-lightBlue"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Website
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dummyWebsites.map((website) => (
              <Card key={website.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1 flex items-center">
                        <Globe className="h-4 w-4 mr-2 text-brand-blue" />
                        {website.website_name}
                      </h3>
                      {website.category && (
                        <Badge variant="secondary" className="mb-2">
                          {website.category}
                        </Badge>
                      )}
                      <p className="text-sm text-gray-600 mb-3">{website.description}</p>
                      <Button
                        onClick={() => alert('AssetDocs.net says\n\nDemo: This would open the website in a new tab.')}
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        <ExternalLink className="h-3 w-3 mr-2" />
                        Visit Website
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

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

          {/* Demo Storage Dashboard */}
          <DemoStorageDashboard />

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="asset-values">Asset Values</TabsTrigger>
              <TabsTrigger value="source-websites">Source Websites</TabsTrigger>
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

                {/* Manual Entry Card */}
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="h-6 w-6 mr-2 text-brand-blue" />
                      Manual Entry
                    </CardTitle>
                    <CardDescription>
                      Add items to your inventory without photos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button
                        onClick={() => alert('AssetDocs.net says\n\nDemo: This allows you to manually add items to your inventory without photos.')}
                        className="w-full bg-brand-blue hover:bg-brand-lightBlue"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Manual Entry
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Third Row - Password Catalog, Insurance, Export */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Password and Accounts Catalog Card */}
                <Card className="hover:shadow-lg transition-shadow col-span-1 md:col-span-2 lg:col-span-3">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Lock className="h-6 w-6 mr-2 text-brand-blue" />
                      Password and Accounts Catalog (Locked)
                    </CardTitle>
                    <CardDescription>
                      Your password and accounts catalog is protected with end-to-end encryption
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Alert className="border-blue-200 bg-blue-50">
                        <Lock className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Password and Accounts Catalog Locked</strong>
                          <br />
                          Enter your master password to access your encrypted passwords and Account Summary
                        </AlertDescription>
                      </Alert>
                      <div className="flex gap-3">
                        <Button 
                          onClick={() => alert("AssetDocs.net says\n\nDemo: This would allow you to unlock and access your password and accounts catalog with your master password.")}
                          className="flex-1 bg-brand-blue hover:bg-brand-lightBlue"
                        >
                          <Lock className="h-4 w-4 mr-2" />
                          Unlock Password and Accounts Catalog
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Legacy Locker */}
              <DemoLegacyLocker />

              {/* Fourth Row - Insurance, Export, Download */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Insurance Information Card */}
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
                        onClick={() => alert('AssetDocs.net says\n\nDemo: This allows you to add and manage insurance policies, claims, and related documentation.')}
                        className="w-full bg-brand-blue hover:bg-brand-lightBlue"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Insurance Policy
                      </Button>
                      <Button 
                        onClick={() => alert('AssetDocs.net says\n\nDemo: This allows you to view and manage your insurance policies and claims.')}
                        variant="outline" 
                        className="w-full"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Insurance
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Export Assets Card */}
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
                      onClick={() => alert('AssetDocs.net says\n\nDemo: This would export your complete asset summary as a PDF and ZIP file.')}
                      variant="default"
                      className="w-full bg-brand-green hover:bg-brand-green/90"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Export Assets
                    </Button>
                  </CardContent>
                </Card>

                {/* Download All Files Card */}
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Download className="h-6 w-6 mr-2 text-brand-blue" />
                      Download All Files
                    </CardTitle>
                    <CardDescription>
                      Download all your photos, videos, and documents in a single ZIP file
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      onClick={() => alert('AssetDocs.net says\n\nDemo: This would download all your files in a ZIP archive.')}
                      variant="outline"
                      className="w-full"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download All
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Documentation Checklist */}
              <DemoDocumentationChecklist />
            </TabsContent>

            <TabsContent value="asset-values">
              <Alert className="mb-4 border-blue-200 bg-blue-50">
                <Eye className="h-4 w-4" />
                <AlertDescription>
                  <strong>Demo Mode:</strong> This shows sample asset values. In the live dashboard, this would display your actual items and values.
                </AlertDescription>
              </Alert>
              <AssetValuesSection />
            </TabsContent>

            <TabsContent value="source-websites">
              <Alert className="mb-4 border-blue-200 bg-blue-50">
                <Eye className="h-4 w-4" />
                <AlertDescription>
                  <strong>Demo Mode:</strong> This shows sample source websites. In the live dashboard, you could save websites where you purchased items for reference.
                </AlertDescription>
              </Alert>
              <DemoSourceWebsites />
            </TabsContent>

            <TabsContent value="damage">
              <Alert className="mb-4 border-blue-200 bg-blue-50">
                <Eye className="h-4 w-4" />
                <AlertDescription>
                  <strong>Demo Mode:</strong> This shows post-damage documentation features. In the live dashboard, you could document damage to your property and assets.
                </AlertDescription>
              </Alert>
              <PostDamageSection />
            </TabsContent>

            <TabsContent value="voice-notes">
              <Alert className="mb-4 border-blue-200 bg-blue-50">
                <Eye className="h-4 w-4" />
                <AlertDescription>
                  <strong>Demo Mode:</strong> This shows voice notes features. In the live dashboard, you could record and manage voice notes about your assets.
                </AlertDescription>
              </Alert>
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