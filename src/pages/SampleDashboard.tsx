import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Eye, 
  Home, 
  Camera, 
  FileText,
  FileImage,
  Settings, 
  Plus, 
  HardDrive,
  BarChart3,
  DollarSign,
  FolderOpen,
  Lock,
  CheckCircle2,
  AlertCircle,
  Globe,
  ExternalLink,
  Paintbrush,
  Mic,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  Shield,
  Key,
  Users,
  FileCheck
} from 'lucide-react';

const SampleDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [storageOpen, setStorageOpen] = useState(false);

  // Demo alert function for all interactive elements
  const showDemoAlert = (title: string, description: string) => {
    alert(`Asset Safe Demo\n\n${title}\n\n${description}`);
  };

  // Demo Welcome Banner Component
  const DemoWelcomeBanner = () => (
    <div className="space-y-3">
      <div className="bg-gradient-to-r from-brand-blue to-brand-lightBlue p-6 rounded-lg text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h1 className="text-2xl font-bold">
            Welcome, Demo User!
          </h1>
          <span className="text-white/90 font-medium text-sm bg-white/20 px-3 py-1 rounded-md">
            Account #: DEMO-12345
          </span>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          <Button 
            onClick={() => showDemoAlert(
              'Account Settings',
              'Access your profile settings, notification preferences, billing information, subscription management, and authorized user settings. This is where you manage all aspects of your Asset Safe account.'
            )}
            variant="outline" 
            className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 border-yellow-400"
          >
            <Settings className="mr-2 h-4 w-4" />
            Account Settings
          </Button>
          <Button 
            onClick={() => showDemoAlert(
              'Property Profiles',
              'Create and manage profiles for each of your properties. Add details like address, square footage, year built, and estimated value. Each property can have its own photos, videos, documents, and inventory.'
            )}
            variant="outline" 
            className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 border-yellow-400"
          >
            <Home className="mr-2 h-4 w-4" />
            Property Profiles
          </Button>
        </div>
      </div>
    </div>
  );

  // Demo Account Header with stats
  const DemoAccountHeader = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => showDemoAlert('Total Items', 'This shows the total number of items you have documented across all properties, including photos, videos, documents, and inventory items.')}>
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
      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => showDemoAlert('Total Value', 'The estimated total value of all your documented assets. This helps you understand your coverage needs and provides documentation for insurance claims.')}>
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
      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => showDemoAlert('Properties', 'The number of property profiles you have created. Each property can be documented separately with its own photos, videos, and inventory.')}>
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
      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => showDemoAlert('Storage Used', 'Your current storage usage. Upgrade your plan for additional storage space to store more photos, videos, and documents.')}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Storage Used</p>
              <p className="text-2xl font-bold text-orange-600">2.4 GB</p>
            </div>
            <FolderOpen className="h-8 w-8 text-orange-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Demo Storage Dashboard Component
  const DemoStorageDashboard = () => (
    <Collapsible open={storageOpen} onOpenChange={setStorageOpen} className="mb-6">
      <div className="flex items-center justify-between p-4 bg-card border rounded-lg">
        <div className="flex items-center gap-2">
          <HardDrive className="h-5 w-5 text-brand-blue" />
          <h3 className="font-semibold text-lg">Storage Usage</h3>
        </div>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm">
            {storageOpen ? (
              <>
                <span className="mr-2 text-sm">Hide Details</span>
                <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                <span className="mr-2 text-sm">Show Details</span>
                <ChevronDown className="h-4 w-4" />
              </>
            )}
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="mt-4">
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="cursor-pointer" onClick={() => showDemoAlert('Storage Quota', 'Monitor your storage usage and available space. Upgrade your subscription to get more storage for photos, videos, and documents.')}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FolderOpen className="h-5 w-5 mr-2 text-brand-blue" />
                Storage Quota
              </CardTitle>
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
          <Card className="cursor-pointer" onClick={() => showDemoAlert('Storage Breakdown', 'See how your storage is distributed across photos, videos, and documents. This helps you manage your space effectively.')}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-brand-blue" />
                Storage Breakdown
              </CardTitle>
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
                  <FileImage className="h-4 w-4 text-purple-500" />
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
      </CollapsibleContent>
    </Collapsible>
  );

  // Demo Documentation Checklist
  const DemoDocumentationChecklist = () => (
    <Card className="cursor-pointer" onClick={() => showDemoAlert('Documentation Checklist', 'Track your documentation progress across different categories. The checklist helps ensure you have comprehensive coverage for insurance purposes and peace of mind.')}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileCheck className="h-5 w-5 mr-2 text-brand-blue" />
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

  // Demo Secure Vault
  const DemoSecureVault = () => (
    <Card className="cursor-pointer border-2 border-brand-blue/20" onClick={() => showDemoAlert('Secure Vault (Legacy Locker)', 'The Secure Vault is a password-protected section for storing sensitive information like estate planning documents, wills, trust information, financial account details, and important contacts. Only you and your designated delegates can access this information.')}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Lock className="h-6 w-6 mr-2 text-brand-blue" />
          Secure Vault
          <Badge className="ml-2 bg-brand-blue/10 text-brand-blue">Protected</Badge>
        </CardTitle>
        <CardDescription>
          Encrypted storage for estate plans, wills, and sensitive documents
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Shield className="h-5 w-5 text-brand-blue" />
            <div>
              <p className="font-medium text-sm">Estate Planning</p>
              <p className="text-xs text-gray-500">Wills, trusts, directives</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Key className="h-5 w-5 text-brand-blue" />
            <div>
              <p className="font-medium text-sm">Password Catalog</p>
              <p className="text-xs text-gray-500">Secure credential storage</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Users className="h-5 w-5 text-brand-blue" />
            <div>
              <p className="font-medium text-sm">VIP Contacts</p>
              <p className="text-xs text-gray-500">Important contacts list</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Demo Asset Values Section
  const DemoAssetValues = () => (
    <Card className="cursor-pointer" onClick={() => showDemoAlert('Asset Values', 'View and manage the estimated values of all your documented items. Track total asset value by property, category, or individual item. This information is invaluable for insurance claims and estate planning.')}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <DollarSign className="h-6 w-6 mr-2 text-green-600" />
          Asset Values Summary
        </CardTitle>
        <CardDescription>
          Track the value of your documented assets
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg text-center">
              <p className="text-sm text-gray-600">Primary Residence</p>
              <p className="text-2xl font-bold text-green-600">$32,450</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg text-center">
              <p className="text-sm text-gray-600">Vacation Home</p>
              <p className="text-2xl font-bold text-blue-600">$12,300</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg text-center">
              <p className="text-sm text-gray-600">Storage Unit</p>
              <p className="text-2xl font-bold text-purple-600">$3,579</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Demo Source Websites Section
  const DemoSourceWebsites = () => (
    <Card className="cursor-pointer" onClick={() => showDemoAlert('Source Websites', 'Keep track of where you purchased items for warranty claims, returns, and price verification. Add retailer websites and categorize them for easy reference when filing insurance claims.')}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Globe className="h-6 w-6 mr-2 text-brand-blue" />
          Source Websites
        </CardTitle>
        <CardDescription>
          Track where you purchased items for warranty and reference
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {['Amazon', 'Best Buy', 'Wayfair', 'Home Depot'].map((store) => (
            <div key={store} className="p-4 border rounded-lg text-center hover:shadow-md transition-shadow">
              <Globe className="h-8 w-8 mx-auto mb-2 text-brand-blue" />
              <p className="font-medium">{store}</p>
              <Badge variant="secondary" className="mt-1 text-xs">E-commerce</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  // Demo Voice Notes Section
  const DemoVoiceNotes = () => (
    <Card className="cursor-pointer" onClick={() => showDemoAlert('Voice Notes', 'Record audio notes to document items, describe conditions, or leave instructions for family members. Voice notes are stored securely and can be attached to specific items or properties.')}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Mic className="h-6 w-6 mr-2 text-brand-blue" />
          Voice Notes
        </CardTitle>
        <CardDescription>
          Record audio notes for detailed documentation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Mic className="h-5 w-5 text-brand-blue" />
              <div>
                <p className="font-medium text-sm">Living Room Inventory</p>
                <p className="text-xs text-gray-500">2:34 duration • Jan 15, 2024</p>
              </div>
            </div>
            <Button variant="outline" size="sm">Play</Button>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Mic className="h-5 w-5 text-brand-blue" />
              <div>
                <p className="font-medium text-sm">Garage Equipment Notes</p>
                <p className="text-xs text-gray-500">1:45 duration • Jan 10, 2024</p>
              </div>
            </div>
            <Button variant="outline" size="sm">Play</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Demo Paint Codes Section
  const DemoPaintCodes = () => (
    <Card className="cursor-pointer" onClick={() => showDemoAlert('Paint Codes', 'Store paint colors, codes, and brand information for every room in your property. Never forget a paint color again—perfect for touch-ups, repairs, or future renovations.')}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Paintbrush className="h-6 w-6 mr-2 text-brand-blue" />
          Paint Codes
        </CardTitle>
        <CardDescription>
          Track paint colors for every room
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 border rounded-lg">
            <div className="w-full h-8 rounded mb-2" style={{ backgroundColor: '#E8E4DF' }}></div>
            <p className="font-medium text-sm">Agreeable Gray</p>
            <p className="text-xs text-gray-500">Sherwin Williams • SW 7029</p>
            <p className="text-xs text-gray-400 mt-1">Living Room</p>
          </div>
          <div className="p-3 border rounded-lg">
            <div className="w-full h-8 rounded mb-2" style={{ backgroundColor: '#FFFFFF' }}></div>
            <p className="font-medium text-sm">Pure White</p>
            <p className="text-xs text-gray-500">Sherwin Williams • SW 7005</p>
            <p className="text-xs text-gray-400 mt-1">Trim & Ceilings</p>
          </div>
          <div className="p-3 border rounded-lg">
            <div className="w-full h-8 rounded mb-2" style={{ backgroundColor: '#4A6274' }}></div>
            <p className="font-medium text-sm">Smoky Blue</p>
            <p className="text-xs text-gray-500">Benjamin Moore • HC-147</p>
            <p className="text-xs text-gray-400 mt-1">Master Bedroom</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Demo Post Damage Section
  const DemoPostDamage = () => (
    <Card className="cursor-pointer border-2 border-yellow-200" onClick={() => showDemoAlert('Post Damage Documentation', 'After an incident (fire, flood, theft, storm), use this section to document damage for insurance claims. Upload photos and videos of affected areas, describe the damage, and track your claim progress.')}>
      <CardHeader className="bg-yellow-50">
        <CardTitle className="flex items-center">
          <AlertTriangle className="h-6 w-6 mr-2 text-yellow-600" />
          Post Damage Documentation
        </CardTitle>
        <CardDescription>
          Document damage after an incident for insurance claims
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="text-center py-6">
          <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-yellow-500" />
          <p className="text-gray-600 mb-4">No damage reports on file</p>
          <Button className="bg-yellow-500 hover:bg-yellow-600 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Report Damage
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="flex-grow py-8 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          {/* Demo Banner */}
          <Alert className="mb-6 border-brand-blue bg-brand-blue/5">
            <Eye className="h-4 w-4" />
            <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <span>
                <strong>Sample Dashboard</strong> — Click on any section to learn what it does. Features are disabled for demonstration.
              </span>
              <Button 
                onClick={() => navigate('/pricing')}
                size="sm"
                className="bg-brand-green hover:bg-brand-green/90"
              >
                Start Your Free Trial
              </Button>
            </AlertDescription>
          </Alert>

          {/* Welcome Banner */}
          <div className="mb-6">
            <DemoWelcomeBanner />
          </div>

          {/* Account Stats */}
          <DemoAccountHeader />

          {/* Storage Dashboard */}
          <DemoStorageDashboard />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            {/* Insights & Tools Dropdown with Back Button */}
            <div className="w-full flex items-center gap-2">
              {/* Back to Dashboard Button - only show when not on overview */}
              {activeTab !== 'overview' && (
                <Button
                  onClick={() => setActiveTab('overview')}
                  className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white h-12 w-12 min-w-12 p-0 rounded-lg flex-shrink-0 shadow-md"
                  aria-label="Back to Dashboard"
                >
                  <ChevronLeft className="h-7 w-7" />
                </Button>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="w-full bg-brand-green hover:bg-brand-green/90 text-white justify-between">
                    Insights & Tools
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] bg-brand-green border-brand-green">
                  <DropdownMenuItem 
                    onClick={() => showDemoAlert('Contacts', 'Store important contacts like insurance agents, contractors, attorneys, and family members. Keep all your important contacts in one secure location.')}
                    className="text-white hover:bg-brand-green/80 focus:bg-brand-green/80 focus:text-white cursor-pointer"
                  >
                    Contacts
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => showDemoAlert('Manual Entry', 'Manually add items to your inventory without photos. Perfect for documenting items with descriptions, values, and purchase information.')}
                    className="text-white hover:bg-brand-green/80 focus:bg-brand-green/80 focus:text-white cursor-pointer"
                  >
                    Manual Entry
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setActiveTab('asset-values')}
                    className="text-white hover:bg-brand-green/80 focus:bg-brand-green/80 focus:text-white cursor-pointer"
                  >
                    Asset Values
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setActiveTab('source-websites')}
                    className="text-white hover:bg-brand-green/80 focus:bg-brand-green/80 focus:text-white cursor-pointer"
                  >
                    Source Websites
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setActiveTab('voice-notes')}
                    className="text-white hover:bg-brand-green/80 focus:bg-brand-green/80 focus:text-white cursor-pointer"
                  >
                    Voice Notes
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setActiveTab('paint-codes')}
                    className="text-white hover:bg-brand-green/80 focus:bg-brand-green/80 focus:text-white cursor-pointer"
                  >
                    Paint Codes
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setActiveTab('damage')}
                    className="text-white hover:bg-brand-green/80 focus:bg-brand-green/80 focus:text-white cursor-pointer"
                  >
                    <span className="text-yellow-400 font-bold mr-1">!</span>
                    Post Damage
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <TabsContent value="overview" className="space-y-6">
              {/* Primary Blocks - Photo/Video Management and Documents & Records */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Photo/Video Management Card */}
                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => showDemoAlert('Photo/Video Management', 'Upload and organize photos and videos of your property and belongings. Document room-by-room, create folders, and add descriptions. All media is stored securely in the cloud.')}>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Camera className="h-6 w-6 mr-2 text-brand-blue" />
                      Photo/Video Management
                    </CardTitle>
                    <CardDescription>
                      Capture photos or videos to document your property and belongings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button className="w-full bg-brand-blue hover:bg-brand-lightBlue">
                        <Plus className="h-4 w-4 mr-2" />
                        Upload Photos/Videos
                      </Button>
                      <Button variant="outline" className="w-full">
                        <Eye className="h-4 w-4 mr-2" />
                        View All Photos & Videos
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Documents & Records Card */}
                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => showDemoAlert('Documents & Records', 'Store important documents like insurance policies, warranties, receipts, titles, and contracts. Organize by category and attach documents to specific properties or items.')}>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="h-6 w-6 mr-2 text-brand-blue" />
                      Documents & Records
                    </CardTitle>
                    <CardDescription>
                      Store policies, receipts, warranties, titles, licenses, and other critical records
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button className="w-full bg-brand-blue hover:bg-brand-lightBlue">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Document
                      </Button>
                      <Button variant="outline" className="w-full">
                        <Eye className="h-4 w-4 mr-2" />
                        View Documents & Insurance
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Documentation Checklist */}
              <DemoDocumentationChecklist />

              {/* Secure Vault */}
              <div className="mt-6">
                <DemoSecureVault />
              </div>

              {/* Export Assets & Download All Files */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => showDemoAlert('Export Assets', 'Generate a comprehensive PDF report of all your documented assets. Perfect for sharing with insurance agents, attorneys, or family members. Includes photos, descriptions, and values.')}>
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
                    <Button variant="default" className="w-full bg-brand-green hover:bg-brand-green/90">
                      <FileText className="mr-2 h-4 w-4" />
                      Export Assets
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => showDemoAlert('Download All Files', 'Download all your photos, videos, and documents in a single ZIP file. Great for creating local backups or transferring to another storage service.')}>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileImage className="h-6 w-6 mr-2 text-brand-blue" />
                      Download All Files
                    </CardTitle>
                    <CardDescription>
                      Download all your photos, videos, and documents in a single ZIP file
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="default" className="w-full bg-brand-green hover:bg-brand-green/90">
                      <FileImage className="mr-2 h-4 w-4" />
                      Download All
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="asset-values">
              <DemoAssetValues />
            </TabsContent>

            <TabsContent value="source-websites">
              <DemoSourceWebsites />
            </TabsContent>

            <TabsContent value="voice-notes">
              <DemoVoiceNotes />
            </TabsContent>

            <TabsContent value="paint-codes">
              <DemoPaintCodes />
            </TabsContent>

            <TabsContent value="damage">
              <DemoPostDamage />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default SampleDashboard;
