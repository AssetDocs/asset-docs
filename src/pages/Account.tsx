
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AssetValuesSection from '@/components/AssetValuesSection';
import AccountHeader from '@/components/AccountHeader';
import AccountStats from '@/components/AccountStats';
import AccountActions from '@/components/AccountActions';
import ManualEntrySection from '@/components/ManualEntrySection';
import StorageAlert from '@/components/StorageAlert';
import StorageDashboard from '@/components/StorageDashboard';
import PostDamageSection from '@/components/PostDamageSection';
import VoiceNotesSection from '@/components/VoiceNotesSection';
import DashboardTour from '@/components/DashboardTour';
import { FeatureGuard } from '@/components/FeatureGuard';
import DocumentationChecklist from '@/components/DocumentationChecklist';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';
import EmailVerificationNotice from '@/components/EmailVerificationNotice';
import { StripeTestPanel } from '@/components/StripeTestPanel';
import { useToast } from '@/hooks/use-toast';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Camera, 
  Video, 
  FileImage, 
  FileText, 
  Shield, 
  Settings, 
  Plus, 
  Eye, 
  Users 
} from 'lucide-react';

// Welcome Message Component
const WelcomeMessage: React.FC = () => {
  const { profile, user } = useAuth();
  
  const getDisplayName = () => {
    if (profile?.first_name) {
      return profile.first_name;
    }
    if (user?.user_metadata?.first_name) {
      return user.user_metadata.first_name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  return (
    <div className="bg-gradient-to-r from-brand-blue to-brand-lightBlue p-6 rounded-lg text-white">
      <h1 className="text-2xl font-bold">
        Welcome, {getDisplayName()}!
      </h1>
      <p className="text-brand-blue/80 mt-1">
        Manage your assets and documentation from your dashboard
      </p>
    </div>
  );
};

const Account: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [showTour, setShowTour] = useState(false);
  const { subscriptionTier } = useSubscription();
  const isMobile = useIsMobile();
  
  const showFloorPlans = true; // All subscription tiers now have access to floor plans

  // Show success message if redirected from successful payment
  useEffect(() => {
    if (searchParams.get('payment_success') === 'true') {
      toast({
        title: "Payment Successful!",
        description: "Your subscription has been activated. Welcome aboard!",
      });
      // Clear the URL parameter
      window.history.replaceState({}, '', '/account');
    }
  }, [searchParams, toast]);

  useEffect(() => {
    // Check if user is a new user and hasn't seen the tour
    const isNewUser = localStorage.getItem('isNewUser');
    const hasSeenTour = localStorage.getItem('hasSeenDashboardTour');
    
    if (isNewUser && !hasSeenTour) {
      setShowTour(true);
      // Clear the new user flag
      localStorage.removeItem('isNewUser');
    }
  }, []);

  const closeTour = () => {
    setShowTour(false);
    localStorage.setItem('hasSeenDashboardTour', 'true');
  };



  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <EmailVerificationNotice />
      
      <div className="flex-grow py-8 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          
          
          {/* Welcome Message */}
          <div className="mb-6">
            <WelcomeMessage />
          </div>
          
          <div id="account-header">
            <AccountHeader />
          </div>

          <div id="storage-dashboard" className="mb-6">
            <StorageDashboard />
          </div>

          <Tabs defaultValue="overview" className="space-y-6" id="tabs-content">
            <TabsList className={`${isMobile ? 'flex overflow-x-auto' : 'grid grid-cols-4'} w-full`}>
              <TabsTrigger value="overview" className={isMobile ? 'flex-shrink-0' : ''}>
                {isMobile ? 'Home' : 'Overview'}
              </TabsTrigger>
              <TabsTrigger value="asset-values" className={isMobile ? 'flex-shrink-0' : ''}>
                {isMobile ? 'Assets' : 'Asset Values'}
              </TabsTrigger>
              <TabsTrigger value="damage" className={isMobile ? 'flex-shrink-0' : ''}>
                {isMobile ? 'Damage' : 'Post Damage'}
              </TabsTrigger>
              <TabsTrigger value="voice-notes" className={isMobile ? 'flex-shrink-0' : ''}>
                {isMobile ? 'Notes' : 'Voice Notes'}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <AccountStats />
              
              {/* First Row */}
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
                        onClick={() => {
                          const isOnSampleDashboard = window.location.pathname === '/sample-dashboard';
                          if (isOnSampleDashboard) {
                            alert('AssetDocs.net says\n\nDemo: This allows you to upload photos and document your items with estimated values.');
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
              </div>

              {/* Second Row */}
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
                        onClick={() => {
                          const isOnSampleDashboard = window.location.pathname === '/sample-dashboard';
                          if (isOnSampleDashboard) {
                            alert('AssetDocs.net says\n\nDemo: This allows you to manually add items to your inventory without photos.');
                            return;
                          }
                          // Add manual entry functionality here
                        }}
                        className="w-full bg-brand-blue hover:bg-brand-lightBlue"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Manual Entry
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Third Row */}
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
                      onClick={() => {
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

                {/* Download All Files Card */}
                <Card className="hover:shadow-lg transition-shadow">
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
                    <Button 
                      onClick={() => {
                        const isOnSampleDashboard = window.location.pathname === '/sample-dashboard';
                        if (isOnSampleDashboard) {
                          alert('AssetDocs.net says\n\nDemo: This would download all your files in a ZIP archive.');
                          return;
                        }
                      }}
                      variant="outline"
                      className="w-full"
                    >
                      <FileImage className="mr-2 h-4 w-4" />
                      Download All
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <DocumentationChecklist />
            </TabsContent>


            <TabsContent value="asset-values">
              <AssetValuesSection />
            </TabsContent>

            <TabsContent value="damage">
              <FeatureGuard featureKey="post_damage_reports">
                <PostDamageSection />
              </FeatureGuard>
            </TabsContent>

            <TabsContent value="voice-notes">
              <FeatureGuard featureKey="voice_notes">
                <VoiceNotesSection />
              </FeatureGuard>
            </TabsContent>

          </Tabs>
        </div>
      </div>
      
      <Footer />
      
      <DashboardTour isVisible={showTour} onClose={closeTour} />
    </div>
  );
};

export default Account;
