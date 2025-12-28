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
import { supabase } from '@/integrations/supabase/client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PaintCodesSection from '@/components/PaintCodesSection';
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
  Users,
  Paintbrush,
  Lock,
  ChevronDown
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

  return (
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
          <Link to="/account-settings">
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
          
          <div id="account-header">
            <AccountHeader />
          </div>


          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6" id="tabs-content">
            {/* Insights & Tools Dropdown */}
            <div className="w-full">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="w-full bg-brand-green hover:bg-brand-green/90 text-white justify-between">
                    Insights & Tools
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
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <TabsContent value="overview" className="space-y-6">
              
              {/* First Row - Photo Management, Document Storage, Insurance Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                        onClick={() => handleRestrictedAction(() => {
                          navigate('/account/photos/upload');
                        })}
                        className="w-full bg-brand-blue hover:bg-brand-lightBlue"
                        disabled={isViewer}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Upload Photos
                        {isViewer && <Lock className="h-3 w-3 ml-1" />}
                      </Button>
                      <Button 
                        onClick={() => handleRestrictedAction(() => {
                          navigate('/account/photos');
                        }, true)}
                        variant="outline"
                        className="w-full"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Gallery
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
                        onClick={() => handleRestrictedAction(() => {
                          navigate('/account/documents/upload');
                        })}
                        className="w-full bg-brand-blue hover:bg-brand-lightBlue"
                        disabled={isViewer}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Upload Documents
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
                      Manage insurance policies, claims, and related documentation
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button 
                        onClick={() => handleRestrictedAction(() => {
                          window.location.href = '/account/insurance/new';
                        })}
                        className="w-full bg-brand-blue hover:bg-brand-lightBlue"
                        disabled={isViewer}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Insurance Policy
                        {isViewer && <Lock className="h-3 w-3 ml-1" />}
                      </Button>
                      <Button 
                        onClick={() => handleRestrictedAction(() => {
                          window.location.href = '/account/insurance';
                        }, true)}
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

              {/* Second Row - Video Documentation, Manual Entry */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        onClick={() => handleRestrictedAction(() => {
                          navigate('/account/videos/upload');
                        })}
                        className="w-full bg-brand-blue hover:bg-brand-lightBlue"
                        disabled={isViewer}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Upload Videos
                        {isViewer && <Lock className="h-3 w-3 ml-1" />}
                      </Button>
                      <Button 
                        onClick={() => handleRestrictedAction(() => {
                          navigate('/account/videos');
                        }, true)}
                        variant="outline"
                        className="w-full"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Gallery
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
                        onClick={() => handleRestrictedAction(() => {
                          window.location.href = '/inventory?mode=manual';
                        })}
                        className="w-full bg-brand-blue hover:bg-brand-lightBlue"
                        disabled={isViewer}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Manual Entry
                        {isViewer && <Lock className="h-3 w-3 ml-1" />}
                      </Button>
                      <Button 
                        onClick={() => handleRestrictedAction(() => {
                          navigate('/inventory');
                        }, true)}
                        variant="outline" 
                        className="w-full"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Entries
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
        </div>
      </div>
      
      <Footer />
      
      <DashboardTour isVisible={showTour} onClose={closeTour} />
    </div>
  );
};

export default Account;
