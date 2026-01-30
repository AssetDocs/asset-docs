import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AssetValuesSection from '@/components/AssetValuesSection';
import AccountHeader from '@/components/AccountHeader';
import AccountActions from '@/components/AccountActions';
import ManualEntrySection from '@/components/ManualEntrySection';
import StorageAlert from '@/components/StorageAlert';
import PostDamageSection from '@/components/PostDamageSection';
import VoiceNotesSection from '@/components/VoiceNotesSection';
import SourceWebsitesSection from '@/components/SourceWebsitesSection';
import DashboardTour from '@/components/DashboardTour';
import { FeatureGuard } from '@/components/FeatureGuard';
import DocumentationChecklist from '@/components/DocumentationChecklist';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useContributor } from '@/contexts/ContributorContext';
import { ViewerRestrictionBanner, ViewerRestriction } from '@/components/ViewerRestriction';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';
import EmailVerificationNotice from '@/components/EmailVerificationNotice';
import { StripeTestPanel } from '@/components/StripeTestPanel';
import { useToast } from '@/hooks/use-toast';
import SecureVault from '@/components/SecureVault';
import FeedbackSection from '@/components/FeedbackSection';
import AdminContributorPlanInfo from '@/components/AdminContributorPlanInfo';
import WelcomeBanner from '@/components/WelcomeBanner';
import { ExportAssetsButton } from '@/components/ExportAssetsButton';
import { supabase } from '@/integrations/supabase/client';
import UpgradesRepairsSection from '@/components/UpgradesRepairsSection';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PaintCodesSection from '@/components/PaintCodesSection';
import ServiceProsSection from '@/components/ServiceProsSection';
import { 
  Home, 
  Camera, 
  FileImage, 
  FileText, 
  Settings, 
  Plus, 
  Eye, 
  Lock,
  ChevronDown,
  ChevronLeft
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Account: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showTour, setShowTour] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const { subscriptionTier } = useSubscription();
  const { isViewer, showViewerRestriction, canEdit } = useContributor();
  const isMobile = useIsMobile();
  
  const showFloorPlans = true; // All subscription tiers now have access to floor plans

  // Helper function to handle viewer-restricted actions
  const handleRestrictedAction = (action: () => void, isViewAction = false) => {
    const isOnSampleDashboard = window.location.pathname === '/sample-dashboard';
    if (isOnSampleDashboard) return action();
    
    if (!isViewAction && isViewer) {
      showViewerRestriction();
      return;
    }
    action();
  };

  // Sync subscription and show success message if redirected from successful payment
  useEffect(() => {
    const syncAndNotify = async () => {
      if (searchParams.get('payment_success') === 'true') {
        try {
          // Sync subscription from Stripe to ensure database is updated
          const { data, error } = await supabase.functions.invoke('sync-subscription');
          
          if (error) {
            console.error('Error syncing subscription:', error);
          } else if (data?.synced) {
            console.log('Subscription synced:', data);
          }
          
          toast({
            title: "Payment Successful!",
            description: "Your subscription has been activated. Welcome aboard!",
          });
        } catch (err) {
          console.error('Error in sync:', err);
          toast({
            title: "Payment Successful!",
            description: "Your subscription has been activated. Welcome aboard!",
          });
        }
        
        // Clear the URL parameter
        window.history.replaceState({}, '', '/account');
      }
    };
    
    syncAndNotify();
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
          
          {/* Viewer Restriction Banner */}
          <ViewerRestrictionBanner />
          
          {/* Welcome Banner with Account Status and Onboarding Progress */}
          <div className="mb-4">
            <WelcomeBanner />
          </div>
          
          {/* Admin Contributor Plan Info - shows subscription details for admin contributors */}
          <AdminContributorPlanInfo />
          
          <div id="account-header">
            <AccountHeader />
          </div>


          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6" id="tabs-content">
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
                    {activeTab === 'damage' ? 'Damage Report' : 'Insights & Tools'}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] bg-brand-green border-brand-green">
                  <DropdownMenuItem 
                    onClick={() => setActiveTab('asset-values')}
                    className="text-white hover:bg-brand-green/80 focus:bg-brand-green/80 focus:text-white cursor-pointer"
                  >
                    Asset Values
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => navigate('/account/contacts')}
                    className="text-white hover:bg-brand-green/80 focus:bg-brand-green/80 focus:text-white cursor-pointer"
                  >
                    Contacts
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => navigate('/inventory')}
                    className="text-white hover:bg-brand-green/80 focus:bg-brand-green/80 focus:text-white cursor-pointer"
                  >
                    Manual Entry
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
                    onClick={() => setActiveTab('service-pros')}
                    className="text-white hover:bg-brand-green/80 focus:bg-brand-green/80 focus:text-white cursor-pointer"
                  >
                    Service Pros
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setActiveTab('upgrades-repairs')}
                    className="text-white hover:bg-brand-green/80 focus:bg-brand-green/80 focus:text-white cursor-pointer"
                  >
                    Upgrades & Repairs
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setActiveTab('paint-codes')}
                    className="text-white hover:bg-brand-green/80 focus:bg-brand-green/80 focus:text-white cursor-pointer"
                  >
                    Paint Codes
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <TabsContent value="overview" className="space-y-6">
              
              {/* Primary Blocks - Photo/Video Management and Documents & Records */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Photo/Video Management Card */}
                <Card className="hover:shadow-lg transition-shadow">
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
                      <Button 
                        onClick={() => handleRestrictedAction(() => {
                          navigate('/account/media/upload');
                        })}
                        className="w-full bg-brand-blue hover:bg-brand-lightBlue"
                        disabled={isViewer}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Upload Photos/Videos
                        {isViewer && <Lock className="h-3 w-3 ml-1" />}
                      </Button>
                      <Button 
                        onClick={() => handleRestrictedAction(() => {
                          navigate('/account/media');
                        }, true)}
                        variant="outline"
                        className="w-full"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View All Photos & Videos
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Documents & Records Card (Combined Documents + Insurance) */}
                <Card className="hover:shadow-lg transition-shadow">
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
                      <Button 
                        onClick={() => handleRestrictedAction(() => {
                          navigate('/account/documents?add=1');
                        })}
                        className="w-full bg-brand-blue hover:bg-brand-lightBlue"
                        disabled={isViewer}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Document
                        {isViewer && <Lock className="h-3 w-3 ml-1" />}
                      </Button>
                      <Button 
                        onClick={() => handleRestrictedAction(() => {
                          navigate('/account/documents');
                        }, true)}
                        variant="outline"
                        className="w-full"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Documents & Insurance
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>


              {/* Documentation Checklist - Above Secure Vault */}
              <DocumentationChecklist />

              {/* Secure Vault */}
              <div className="mt-6">
                <SecureVault />
              </div>

              {/* Export Assets, Download All Files - Bottom of page */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
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
                    <ExportAssetsButton 
                      variant="default"
                      className="w-full bg-brand-green hover:bg-brand-green/90"
                    />
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
                          alert('AssetSafe.net says\n\nDemo: This would download all your files in a ZIP archive.');
                          return;
                        }
                      }}
                      variant="default"
                      className="w-full bg-brand-green hover:bg-brand-green/90"
                    >
                      <FileImage className="mr-2 h-4 w-4" />
                      Download All
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>


            <TabsContent value="asset-values">
              <AssetValuesSection />
            </TabsContent>

            <TabsContent value="source-websites">
              <SourceWebsitesSection />
            </TabsContent>

            <TabsContent value="damage">
              <PostDamageSection />
            </TabsContent>

            <TabsContent value="voice-notes">
              <FeatureGuard featureKey="voice_notes">
                <VoiceNotesSection />
              </FeatureGuard>
            </TabsContent>

            <TabsContent value="paint-codes">
              <PaintCodesSection />
            </TabsContent>

            <TabsContent value="service-pros">
              <ServiceProsSection />
            </TabsContent>

            <TabsContent value="upgrades-repairs">
              <UpgradesRepairsSection />
            </TabsContent>

          </Tabs>

          {/* Post Damage Bar - Thin bar above feedback */}
          <div 
            onClick={() => setActiveTab('damage')}
            className="mt-6 w-full border border-brand-orange rounded-md py-2 px-4 cursor-pointer hover:bg-brand-orange/5 transition-colors"
          >
            <p className="text-center text-sm font-medium text-brand-orange">Post Damage Report</p>
          </div>

          {/* Feedback Section */}
          <FeedbackSection />
        </div>
      </div>
      
      <Footer />
      
      <DashboardTour isVisible={showTour} onClose={closeTour} />
    </div>
  );
};

export default Account;
