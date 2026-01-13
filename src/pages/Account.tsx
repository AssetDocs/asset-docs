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
import { supabase } from '@/integrations/supabase/client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PaintCodesSection from '@/components/PaintCodesSection';
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

// Welcome Message Component
const WelcomeMessage: React.FC = () => {
  const { profile, user } = useAuth();
  const [contributorInfo, setContributorInfo] = useState<{
    first_name: string | null;
    last_name: string | null;
    role: string;
    ownerName: string;
  } | null>(null);
  const [accountNumber, setAccountNumber] = useState<string>('');

  useEffect(() => {
    const fetchContributorInfo = async () => {
      if (!user) return;

      // Get user's profile for account number
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('account_number')
        .eq('user_id', user.id)
        .single();

      if (userProfile?.account_number) {
        setAccountNumber(userProfile.account_number);
      }

      // Check if user is a contributor
      const { data: contributorData } = await supabase
        .from('contributors')
        .select('account_owner_id, first_name, last_name, role')
        .eq('contributor_user_id', user.id)
        .eq('status', 'accepted')
        .maybeSingle();

      if (contributorData) {
        // Get owner's name and account number
        const { data: ownerProfile } = await supabase
          .from('profiles')
          .select('first_name, last_name, account_number')
          .eq('user_id', contributorData.account_owner_id)
          .single();

        if (ownerProfile?.account_number) {
          setAccountNumber(ownerProfile.account_number);
        }

        setContributorInfo({
          first_name: contributorData.first_name,
          last_name: contributorData.last_name,
          role: contributorData.role,
          ownerName: ownerProfile ? `${ownerProfile.first_name || ''} ${ownerProfile.last_name || ''}`.trim() : ''
        });
      }
    };

    fetchContributorInfo();
  }, [user]);
  
  const getDisplayName = () => {
    // If contributor, show their name from contributor record
    if (contributorInfo) {
      const name = `${contributorInfo.first_name || ''} ${contributorInfo.last_name || ''}`.trim();
      return name || user?.email?.split('@')[0] || 'Contributor';
    }
    // Owner - show their full name from profile
    const firstName = profile?.first_name || user?.user_metadata?.first_name || '';
    const lastName = profile?.last_name || user?.user_metadata?.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim();
    if (fullName) {
      return fullName;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  const getRoleDisplay = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  const isMobile = useIsMobile();
  const [hideInstallPrompt, setHideInstallPrompt] = useState(false);
  const [isAppInstalled, setIsAppInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed (standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsAppInstalled(true);
    }
    // Check if user dismissed the prompt before
    const dismissed = localStorage.getItem('installPromptDismissed');
    if (dismissed) {
      setHideInstallPrompt(true);
    }
  }, []);

  const handleDismissInstallPrompt = () => {
    setHideInstallPrompt(true);
    localStorage.setItem('installPromptDismissed', 'true');
  };

  return (
    <div className="space-y-3">
      <div className="bg-gradient-to-r from-brand-blue to-brand-lightBlue p-6 rounded-lg text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h1 className="text-2xl font-bold">
            Welcome, {getDisplayName()}!
          </h1>
          {accountNumber && (
            <span className="text-white/90 font-medium text-sm bg-white/20 px-3 py-1 rounded-md">
              Account #: {accountNumber}
            </span>
          )}
        </div>
        {contributorInfo && (
          <div className="mt-1 space-y-1">
            <p className="text-white/90 font-medium">
              Contributor - {getRoleDisplay(contributorInfo.role)}
            </p>
            {contributorInfo.ownerName && (
              <p className="text-white/70 text-sm">
                Account Owner: {contributorInfo.ownerName}
              </p>
            )}
          </div>
        )}
        <div className="flex flex-wrap gap-2 mt-4">
          <Button asChild variant="outline" className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 border-yellow-400">
            <Link to="/account/settings">
              <Settings className="mr-2 h-4 w-4" />
              Account Settings
            </Link>
          </Button>
          <Button asChild variant="outline" className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 border-yellow-400">
            <Link to="/properties">
              <Home className="mr-2 h-4 w-4" />
              Property Profiles
            </Link>
          </Button>
        </div>
      </div>

      {/* Mobile Install Prompt - only shows on mobile devices, not already installed, and not dismissed */}
      {isMobile && !isAppInstalled && !hideInstallPrompt && (
        <div className="bg-gradient-to-r from-brand-orange to-orange-500 p-4 rounded-lg text-white relative">
          <button 
            onClick={handleDismissInstallPrompt}
            className="absolute top-2 right-2 text-white/70 hover:text-white text-lg font-bold leading-none"
            aria-label="Dismiss"
          >
            ×
          </button>
          <div className="flex items-start gap-3 pr-6">
            <span className="text-2xl">📲</span>
            <div className="flex-1">
              <p className="font-semibold text-sm">Add Asset Safe to Your Home Screen</p>
              <p className="text-white/90 text-xs mt-1">
                One-tap access to your dashboard — even during emergencies with limited internet.
              </p>
              <Button 
                asChild 
                size="sm"
                className="mt-2 bg-white text-brand-orange hover:bg-white/90 font-medium"
              >
                <Link to="/install">
                  Learn How
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

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
          
          {/* Welcome Message */}
          <div className="mb-6">
            <WelcomeMessage />
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
                    Insights & Tools
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] bg-brand-green border-brand-green">
                  <DropdownMenuItem 
                    onClick={() => navigate('/inventory')}
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
                    onClick={() => setActiveTab('damage')}
                    className="text-white hover:bg-brand-green/80 focus:bg-brand-green/80 focus:text-white cursor-pointer"
                  >
                    Post Damage
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
                    onClick={() => navigate('/account/contacts')}
                    className="text-white hover:bg-brand-green/80 focus:bg-brand-green/80 focus:text-white cursor-pointer"
                  >
                    Contacts
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
                    <Button 
                      onClick={() => {
                        const isOnSampleDashboard = window.location.pathname === '/sample-dashboard';
                        if (isOnSampleDashboard) {
                          alert('AssetSafe.net says\n\nDemo: This would export your complete asset summary as a PDF and ZIP file.');
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
              <FeatureGuard featureKey="post_damage_reports">
                <PostDamageSection />
              </FeatureGuard>
            </TabsContent>

            <TabsContent value="voice-notes">
              <FeatureGuard featureKey="voice_notes">
                <VoiceNotesSection />
              </FeatureGuard>
            </TabsContent>

            <TabsContent value="paint-codes">
              <PaintCodesSection />
            </TabsContent>

          </Tabs>

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
