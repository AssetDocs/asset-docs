import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
  Lock
} from 'lucide-react';

// Welcome Message Component
const WelcomeMessage: React.FC = () => {
  const { profile, user } = useAuth();
  const [contributorInfo, setContributorInfo] = useState<{
    first_name: string | null;
    last_name: string | null;
    role: string;
    ownerName: string;
  } | null>(null);

  useEffect(() => {
    const fetchContributorInfo = async () => {
      if (!user) return;

      // Check if user is a contributor
      const { data: contributorData } = await supabase
        .from('contributors')
        .select('account_owner_id, first_name, last_name, role')
        .eq('contributor_user_id', user.id)
        .eq('status', 'accepted')
        .maybeSingle();

      if (contributorData) {
        // Get owner's name
        const { data: ownerProfile } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('user_id', contributorData.account_owner_id)
          .single();

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
      <h1 className="text-2xl font-bold">
        Welcome, {getDisplayName()}!
      </h1>
      {contributorInfo ? (
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
      ) : (
        <p className="text-brand-blue/80 mt-1">
          Manage your assets and documentation from your dashboard
        </p>
      )}
    </div>
  );
};

const Account: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showTour, setShowTour] = useState(false);
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


          <Tabs defaultValue="overview" className="space-y-6" id="tabs-content">
            <div className="space-y-2">
              {/* First Row - 3 tabs */}
              <TabsList className={`${isMobile ? 'flex overflow-x-auto' : 'grid grid-cols-3'} w-full`}>
                <TabsTrigger value="overview" className={`${isMobile ? 'flex-shrink-0' : ''} border-2 border-yellow-400`}>
                  {isMobile ? 'Home' : 'Overview'}
                </TabsTrigger>
                <TabsTrigger value="asset-values" className={`${isMobile ? 'flex-shrink-0' : ''} border-2 border-yellow-400`}>
                  {isMobile ? 'Assets' : 'Asset Values'}
                </TabsTrigger>
                <TabsTrigger value="source-websites" className={`${isMobile ? 'flex-shrink-0' : ''} border-2 border-yellow-400`}>
                  {isMobile ? 'Websites' : 'Source Websites'}
                </TabsTrigger>
              </TabsList>
              {/* Second Row - 3 tabs */}
              <TabsList className={`${isMobile ? 'flex overflow-x-auto' : 'grid grid-cols-3'} w-full`}>
                <TabsTrigger value="damage" className={`${isMobile ? 'flex-shrink-0' : ''} border-2 border-yellow-400`}>
                  {isMobile ? 'Damage' : 'Post Damage'}
                </TabsTrigger>
                <TabsTrigger value="voice-notes" className={`${isMobile ? 'flex-shrink-0' : ''} border-2 border-yellow-400`}>
                  {isMobile ? 'Notes' : 'Voice Notes'}
                </TabsTrigger>
                <TabsTrigger value="paint-codes" className={`${isMobile ? 'flex-shrink-0' : ''} border-2 border-yellow-400`}>
                  {isMobile ? 'Paint' : 'Paint Codes'}
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="space-y-6">
              
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
                        onClick={() => handleRestrictedAction(() => {
                          window.location.href = '/account/settings';
                        }, true)}
                        variant="orange" 
                        className="w-full"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Manage Settings
                      </Button>
                      <Button 
                        onClick={() => handleRestrictedAction(() => {
                          window.location.href = '/account/settings?tab=contributors';
                        })}
                        variant="outline" 
                        className="w-full"
                        disabled={isViewer}
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Manage Contributors
                        {isViewer && <Lock className="h-3 w-3 ml-1" />}
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
                        onClick={() => handleRestrictedAction(() => {
                          window.location.href = '/account/properties/new';
                        })}
                        className="w-full bg-brand-blue hover:bg-brand-lightBlue"
                        disabled={isViewer}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create New Property
                        {isViewer && <Lock className="h-3 w-3 ml-1" />}
                      </Button>
                      <Button 
                        onClick={() => handleRestrictedAction(() => {
                          window.location.href = '/account/properties';
                        }, true)}
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

              {/* Third Row - Other Cards */}
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

              {/* Secure Vault - Moved to bottom, above Documentation Checklist */}
              <div className="mt-6">
                <SecureVault />
              </div>

              <DocumentationChecklist />
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
