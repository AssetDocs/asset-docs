import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
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

import { useToast } from '@/hooks/use-toast';
import SecureVault from '@/components/SecureVault';
import FeedbackSection from '@/components/FeedbackSection';
import AdminContributorPlanInfo from '@/components/AdminContributorPlanInfo';
import WelcomeBanner from '@/components/WelcomeBanner';
import SecurityProgress from '@/components/SecurityProgress';
import MFADropdown from '@/components/MFADropdown';
import DashboardGrid from '@/components/DashboardGrid';
import InsightsToolsGrid from '@/components/InsightsToolsGrid';
import LifeHubGrid from '@/components/LifeHubGrid';
import NotesAndTraditions from '@/components/NotesAndTraditions';
import FamilyRecipes from '@/components/FamilyRecipes';
import MemorySafe from '@/components/MemorySafe';
import AssetDocumentationGrid from '@/components/AssetDocumentationGrid';
import ProtectionScore from '@/components/ProtectionScore';
import { supabase } from '@/integrations/supabase/client';
import UpgradesRepairsSection from '@/components/UpgradesRepairsSection';
import PaintCodesSection from '@/components/PaintCodesSection';
import ServiceProsSection from '@/components/ServiceProsSection';
import AccessActivitySection from '@/components/AccessActivitySection';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

const Account: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [showTour, setShowTour] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    // Check query param first (e.g., from breadcrumb links), then navigation state
    const queryTab = searchParams.get('tab');
    const stateTab = (location.state as any)?.tab;
    return queryTab || stateTab || 'overview';
  });
  const { subscriptionTier } = useSubscription();
  const { isViewer, showViewerRestriction, canEdit } = useContributor();

  // Scroll to top when tab changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

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

  // Get the section title and subtitle for back button context
  const getSectionConfig = () => {
    const configs: Record<string, { title: string; subtitle: string }> = {
      'asset-documentation': { title: 'Asset Documentation', subtitle: 'Claim-ready proof for your home and belongings.' },
      'password-catalog': { title: 'Password Catalog', subtitle: 'Your most private information, fully encrypted.' },
      'legacy-locker': { title: 'Legacy Locker', subtitle: 'Guidance and access when you can\'t be there.' },
      'insights-tools': { title: 'Insights & Tools', subtitle: 'Track values, manage repairs, and organize property details.' },
      'life-hub': { title: 'Family Archive', subtitle: 'Everyday life, organized and protected.' },
      'protection-progress': { title: 'Protection Progress', subtitle: 'Track your documentation checklist and protection score in one place.' },
      'asset-values': { title: 'Asset Values', subtitle: 'Track the estimated value of your documented assets.' },
      'source-websites': { title: 'Source Websites', subtitle: 'Save product sources and reference links.' },
      'damage': { title: 'Post Damage Report', subtitle: 'Document damage and submit post-incident details.' },
      'voice-notes': { title: 'Voice Notes', subtitle: 'Record and store voice memos for your records.' },
      'paint-codes': { title: 'Paint Codes', subtitle: 'Store paint colors, brands, and finish details.' },
      'service-pros': { title: 'Trusted Professionals', subtitle: 'Track your trusted service providers and contractors.' },
      'upgrades-repairs': { title: 'Upgrades & Repairs', subtitle: 'Document property improvements and repair history.' },
      'notes-traditions': { title: 'Notes & Traditions', subtitle: 'Capture family traditions, stories, and important notes.' },
      'family-recipes': { title: 'Family Recipes', subtitle: 'Preserve cherished family recipes for generations.' },
      'memory-safe': { title: 'Memory Safe', subtitle: 'A protected place for the memories you want to keep — and pass on.' },
      'access-activity': { title: 'Access & Activity', subtitle: 'Manage authorized users and monitor recent account activity.' },
    };
    return configs[activeTab] || { title: '', subtitle: '' };
  };

  const isOverview = activeTab === 'overview';

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      

      <div className="flex-grow py-8 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          {/* Viewer Restriction Banner */}
          <ViewerRestrictionBanner />

          {/* Welcome Banner + Security Progress - ONLY on overview */}
          {isOverview && (
            <>
              <div className="mb-4">
                <WelcomeBanner />
              </div>
              <div className="mb-4">
                <SecurityProgress hideChecklist />
              </div>
              <AdminContributorPlanInfo />
            </>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            {/* Back Navigation Buttons */}
            {!isOverview && (
              <div className="w-full flex flex-wrap gap-2">
                <Button
                  onClick={() => setActiveTab('overview')}
                  variant="outline"
                  size="sm"
                  className="bg-white text-brand-orange border-brand-orange hover:bg-brand-orange/10"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back to Dashboard
                </Button>

                {['voice-notes', 'service-pros', 'notes-traditions', 'family-recipes', 'memory-safe'].includes(activeTab) && (
                  <Button
                    onClick={() => setActiveTab('life-hub')}
                    variant="outline"
                    size="sm"
                    className="bg-white text-brand-orange border-brand-orange hover:bg-brand-orange/10"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Back to Family Archive
                  </Button>
                )}

                {['source-websites', 'paint-codes', 'upgrades-repairs'].includes(activeTab) && (
                  <Button
                    onClick={() => setActiveTab('insights-tools')}
                    variant="outline"
                    size="sm"
                    className="bg-white text-brand-orange border-brand-orange hover:bg-brand-orange/10"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Back to Insights & Tools
                  </Button>
                )}
              </div>
            )}

            {/* Dashboard Grid Overview */}
            <TabsContent value="overview">
              <DashboardGrid onTabChange={setActiveTab} />
            </TabsContent>

            {/* Asset Documentation Grid */}
            <TabsContent value="asset-documentation">
              <AssetDocumentationGrid />
            </TabsContent>

            {/* Password Catalog - opens SecureVault focused on passwords */}
            <TabsContent value="password-catalog">
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{getSectionConfig().title}</h2>
                  <p className="text-muted-foreground text-sm mt-1">{getSectionConfig().subtitle}</p>
                </div>
                <SecureVault initialTab="passwords" />
              </div>
            </TabsContent>

            {/* Legacy Locker - opens SecureVault focused on legacy */}
            <TabsContent value="legacy-locker">
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{getSectionConfig().title}</h2>
                  <p className="text-muted-foreground text-sm mt-1">{getSectionConfig().subtitle}</p>
                </div>
                <SecureVault initialTab="legacy" />
              </div>
            </TabsContent>

            {/* Protection Progress (merged Checklist + Score) */}
            <TabsContent value="protection-progress">
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{getSectionConfig().title}</h2>
                  <p className="text-muted-foreground text-sm mt-1">{getSectionConfig().subtitle}</p>
                </div>
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
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{getSectionConfig().title}</h2>
                  <p className="text-muted-foreground text-sm mt-1">{getSectionConfig().subtitle}</p>
                </div>
                <AssetValuesSection />
              </div>
            </TabsContent>

            <TabsContent value="source-websites">
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{getSectionConfig().title}</h2>
                  <p className="text-muted-foreground text-sm mt-1">{getSectionConfig().subtitle}</p>
                </div>
                <SourceWebsitesSection />
              </div>
            </TabsContent>

            <TabsContent value="damage">
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{getSectionConfig().title}</h2>
                  <p className="text-muted-foreground text-sm mt-1">{getSectionConfig().subtitle}</p>
                </div>
                <PostDamageSection />
              </div>
            </TabsContent>

            <TabsContent value="voice-notes">
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{getSectionConfig().title}</h2>
                  <p className="text-muted-foreground text-sm mt-1">{getSectionConfig().subtitle}</p>
                </div>
                <FeatureGuard featureKey="voice_notes">
                  <VoiceNotesSection />
                </FeatureGuard>
              </div>
            </TabsContent>

            <TabsContent value="paint-codes">
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{getSectionConfig().title}</h2>
                  <p className="text-muted-foreground text-sm mt-1">{getSectionConfig().subtitle}</p>
                </div>
                <PaintCodesSection />
              </div>
            </TabsContent>

            <TabsContent value="service-pros">
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{getSectionConfig().title}</h2>
                  <p className="text-muted-foreground text-sm mt-1">{getSectionConfig().subtitle}</p>
                </div>
                <ServiceProsSection />
              </div>
            </TabsContent>

            <TabsContent value="upgrades-repairs">
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{getSectionConfig().title}</h2>
                  <p className="text-muted-foreground text-sm mt-1">{getSectionConfig().subtitle}</p>
                </div>
                <UpgradesRepairsSection />
              </div>
            </TabsContent>

            <TabsContent value="notes-traditions">
              <NotesAndTraditions />
            </TabsContent>

            <TabsContent value="family-recipes">
              <FamilyRecipes />
            </TabsContent>

            <TabsContent value="memory-safe">
              <MemorySafe />
            </TabsContent>

            {/* Access & Activity */}
            <TabsContent value="access-activity">
              <AccessActivitySection />
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
