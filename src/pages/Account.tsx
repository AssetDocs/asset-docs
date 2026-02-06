import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AssetValuesSection from '@/components/AssetValuesSection';
import PostDamageSection from '@/components/PostDamageSection';
import VoiceNotesSection from '@/components/VoiceNotesSection';
import SourceWebsitesSection from '@/components/SourceWebsitesSection';
import DashboardTour from '@/components/DashboardTour';
import { FeatureGuard } from '@/components/FeatureGuard';
import DocumentationChecklist from '@/components/DocumentationChecklist';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useContributor } from '@/contexts/ContributorContext';
import { ViewerRestrictionBanner } from '@/components/ViewerRestriction';
import { useAuth } from '@/contexts/AuthContext';
import EmailVerificationNotice from '@/components/EmailVerificationNotice';
import { useToast } from '@/hooks/use-toast';
import SecureVault from '@/components/SecureVault';
import FeedbackSection from '@/components/FeedbackSection';
import AdminContributorPlanInfo from '@/components/AdminContributorPlanInfo';
import WelcomeBanner from '@/components/WelcomeBanner';
import DashboardGrid from '@/components/DashboardGrid';
import InsightsToolsGrid from '@/components/InsightsToolsGrid';
import LifeHubGrid from '@/components/LifeHubGrid';
import ProtectionScore from '@/components/ProtectionScore';
import { supabase } from '@/integrations/supabase/client';
import UpgradesRepairsSection from '@/components/UpgradesRepairsSection';
import PaintCodesSection from '@/components/PaintCodesSection';
import ServiceProsSection from '@/components/ServiceProsSection';

import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

const Account: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showTour, setShowTour] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const { subscriptionTier } = useSubscription();
  const { isViewer, showViewerRestriction, canEdit } = useContributor();

  // Sync subscription and show success message if redirected from successful payment
  useEffect(() => {
    const syncAndNotify = async () => {
      if (searchParams.get('payment_success') === 'true') {
        try {
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
        window.history.replaceState({}, '', '/account');
      }
    };
    syncAndNotify();
  }, [searchParams, toast]);

  useEffect(() => {
    const isNewUser = localStorage.getItem('isNewUser');
    const hasSeenTour = localStorage.getItem('hasSeenDashboardTour');
    if (isNewUser && !hasSeenTour) {
      setShowTour(true);
      localStorage.removeItem('isNewUser');
    }
  }, []);

  const closeTour = () => {
    setShowTour(false);
    localStorage.setItem('hasSeenDashboardTour', 'true');
  };

  // Get the section title for the back button context
  const getSectionTitle = () => {
    const titles: Record<string, string> = {
      'password-catalog': 'Password Catalog',
      'legacy-locker': 'Legacy Locker',
      'insights-tools': 'Insights & Tools',
      'life-hub': 'Life Hub',
      'protection-progress': 'Protection Progress',
      'asset-values': 'Asset Values',
      'source-websites': 'Source Websites',
      'damage': 'Damage Report',
      'voice-notes': 'Voice Notes',
      'paint-codes': 'Paint Codes',
      'service-pros': 'Service Pros',
      'upgrades-repairs': 'Upgrades & Repairs',
    };
    return titles[activeTab] || '';
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <EmailVerificationNotice />

      <div className="flex-grow py-8 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          {/* Viewer Restriction Banner */}
          <ViewerRestrictionBanner />

          {/* Welcome Banner with Protection Score and Onboarding */}
          <div className="mb-4">
            <WelcomeBanner />
          </div>

          {/* Admin Contributor Plan Info */}
          <AdminContributorPlanInfo />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            {/* Back to Dashboard Button */}
            {activeTab !== 'overview' && (
              <div className="w-full flex items-center gap-3">
                <Button
                  onClick={() => {
                    // If in a sub-section of insights-tools or life-hub, go back to that grid first
                    const insightsSubTabs = ['asset-values', 'source-websites', 'paint-codes', 'upgrades-repairs'];
                    const lifeHubSubTabs = ['voice-notes', 'service-pros'];

                    if (insightsSubTabs.includes(activeTab)) {
                      setActiveTab('insights-tools');
                    } else if (lifeHubSubTabs.includes(activeTab)) {
                      setActiveTab('life-hub');
                    } else {
                      setActiveTab('overview');
                    }
                  }}
                  variant="outline"
                  className="bg-white hover:bg-gray-50 border-gray-200"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
                <span className="text-sm font-medium text-muted-foreground">
                  {getSectionTitle()}
                </span>
              </div>
            )}

            {/* Dashboard Grid Overview */}
            <TabsContent value="overview">
              <DashboardGrid onTabChange={setActiveTab} />
            </TabsContent>

            {/* Password Catalog - opens SecureVault focused on passwords */}
            <TabsContent value="password-catalog">
              <SecureVault initialTab="passwords" />
            </TabsContent>

            {/* Legacy Locker - opens SecureVault focused on legacy */}
            <TabsContent value="legacy-locker">
              <SecureVault initialTab="legacy" />
            </TabsContent>

            {/* Protection Progress (merged Checklist + Score) */}
            <TabsContent value="protection-progress">
              <div className="space-y-6">
                <ProtectionScore defaultOpen />
                <DocumentationChecklist />
              </div>
            </TabsContent>

            {/* Insights & Tools Sub-Grid */}
            <TabsContent value="insights-tools">
              <InsightsToolsGrid onTabChange={setActiveTab} />
            </TabsContent>

            {/* Life Hub Sub-Grid */}
            <TabsContent value="life-hub">
              <LifeHubGrid onTabChange={setActiveTab} />
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
