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
import { useAccount } from '@/contexts/AccountContext';
import { ViewerRestrictionBanner } from '@/components/ViewerRestriction';
import { useAuth } from '@/contexts/AuthContext';

import { useToast } from '@/hooks/use-toast';
import SecureVault from '@/components/SecureVault';
import FeedbackSection from '@/components/FeedbackSection';
import AdminContributorPlanInfo from '@/components/AdminContributorPlanInfo';
import WelcomeBanner from '@/components/WelcomeBanner';
import FirstDashboardWelcomeModal from '@/components/FirstDashboardWelcomeModal';

import SubscriptionEndingBanner from '@/components/SubscriptionEndingBanner';
import ExpiredSubscriptionBanner from '@/components/ExpiredSubscriptionBanner';
import GracePeriodBanner from '@/components/GracePeriodBanner';
import ScheduledDeletionBanner from '@/components/account/ScheduledDeletionBanner';
import SecurityProgress from '@/components/SecurityProgress';
import MFADropdown from '@/components/MFADropdown';
import DashboardGrid from '@/components/DashboardGrid';
import PersonalWorkspacePreview from '@/components/personal-workspace/PersonalWorkspacePreview';
import InsightsToolsGrid from '@/components/InsightsToolsGrid';
import LifeHubGrid from '@/components/LifeHubGrid';
import NotesAndTraditions from '@/components/NotesAndTraditions';
import QuickNotesSection from '@/components/QuickNotesSection';
import FamilyRecipes from '@/components/FamilyRecipes';
import FamilyMedications from '@/components/FamilyMedications';
import ImportantLocations from '@/components/ImportantLocations';
import MemorySafe from '@/components/MemorySafe';
import AssetDocumentationGrid from '@/components/AssetDocumentationGrid';

import { supabase } from '@/integrations/supabase/client';
import SmartCalendar from '@/components/SmartCalendar';
import UpgradesRepairsSection from '@/components/UpgradesRepairsSection';
import PaintCodesSection from '@/components/PaintCodesSection';
import ServiceProsSection from '@/components/ServiceProsSection';
import AccessActivitySection from '@/components/AccessActivitySection';
import EmergencyInstructions from '@/components/EmergencyInstructions';
import AccountContinuityInstructions from '@/components/AccountContinuityInstructions';
import ContinuityPreferencesPage from '@/components/continuity/ContinuityPreferencesPage';
import ContinuityRequestBanner from '@/components/continuity/ContinuityRequestBanner';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { recordDashboardResumeActivity, type DashboardResumeActivityType } from '@/lib/dashboardResume';

const Account: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showTour, setShowTour] = useState(false);
  const [welcomeModalOpen, setWelcomeModalOpen] = useState(false);
  const [markingWelcomeSeen, setMarkingWelcomeSeen] = useState(false);
  const activeTab = searchParams.get('tab') || 'overview';
  const handleTabChange = (tab: string) => {
    if (tab === 'overview') {
      navigate('/account');
      return;
    }
    navigate(`/account?tab=${encodeURIComponent(tab)}`);
  };
  const setActiveTab = handleTabChange;
  const { subscriptionTier } = useSubscription();
  const { isReadOnly: isViewer, showReadOnlyRestriction: showViewerRestriction, canEdit, accountId, isOwner } = useAccount();
  const { user, profile, profileLoading, refreshProfile } = useAuth();
  const isOverview = activeTab === 'overview';
  const getFirstName = () => {
    return profile?.first_name || user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'there';
  };
  const shouldShowFirstDashboardWelcome = Boolean(
    isOverview &&
    isOwner &&
    canEdit &&
    user &&
    profile &&
    !profile.dashboard_welcome_seen_at
  );

  // Scroll to top when tab changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  useEffect(() => {
    const activityByTab: Record<string, { type: DashboardResumeActivityType; label: string; route: string }> = {
      'asset-documentation': {
        type: 'asset_documentation_opened',
        label: 'Open Asset Documentation',
        route: '/account?tab=asset-documentation',
      },
      'life-hub': {
        type: 'family_archive_opened',
        label: 'Open Family Archive',
        route: '/account?tab=life-hub',
      },
      'password-catalog': {
        type: 'digital_access_opened',
        label: 'Open Digital Access',
        route: '/account?tab=password-catalog',
      },
      'legacy-locker': {
        type: 'legacy_locker_opened',
        label: 'Complete Legacy Locker details',
        route: '/account?tab=legacy-locker',
      },
      'access-activity': {
        type: 'authorized_users_opened',
        label: 'Manage Authorized Users',
        route: '/account?tab=access-activity',
      },
      'emergency-instructions': {
        type: 'emergency_instructions_opened',
        label: 'Add emergency instructions',
        route: '/account?tab=emergency-instructions',
      },
    };

    const activity = activityByTab[activeTab];
    if (!activity) return;

    recordDashboardResumeActivity({
      accountId,
      isOwner,
      activityType: activity.type,
      activityLabel: activity.label,
      destinationRoute: activity.route,
    });
  }, [activeTab, accountId, isOwner]);

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
    if (profileLoading) return;
    if (user && !profile) return;
    const isNewUser = localStorage.getItem('isNewUser');
    const hasSeenTour = localStorage.getItem('hasSeenDashboardTour');
    if (isNewUser && !hasSeenTour && !shouldShowFirstDashboardWelcome) {
      setShowTour(true);
      localStorage.removeItem('isNewUser');
    }
  }, [profileLoading, profile, shouldShowFirstDashboardWelcome, user]);

  useEffect(() => {
    if (shouldShowFirstDashboardWelcome) {
      setWelcomeModalOpen(true);
    }
  }, [shouldShowFirstDashboardWelcome]);

  const markDashboardWelcomeSeen = async () => {
    localStorage.removeItem('isNewUser');
    localStorage.setItem('hasSeenDashboardTour', 'true');

    if (!user || profile?.dashboard_welcome_seen_at || markingWelcomeSeen) return;

    setMarkingWelcomeSeen(true);
    try {
      const seenAt = new Date().toISOString();
      const { error } = await supabase
        .from('profiles')
        .update({ dashboard_welcome_seen_at: seenAt })
        .eq('user_id', user.id);

      if (error) throw error;
      await refreshProfile();
    } catch (error) {
      console.error('Error marking dashboard welcome seen:', error);
    } finally {
      setMarkingWelcomeSeen(false);
    }
  };

  const dismissDashboardWelcome = () => {
    setWelcomeModalOpen(false);
    void markDashboardWelcomeSeen();
  };

  const handleDashboardWelcomeChoice = async (action: 'property' | 'authorized-user' | 'mfa') => {
    setWelcomeModalOpen(false);
    await markDashboardWelcomeSeen();

    if (action === 'property') {
      navigate('/account/properties/new');
      return;
    }

    if (action === 'authorized-user') {
      setActiveTab('access-activity');
      return;
    }

    navigate('/account/settings?tab=security');
  };

  const closeTour = () => {
    setShowTour(false);
    localStorage.setItem('hasSeenDashboardTour', 'true');
  };

  // Get the section title and subtitle for back button context
  const getSectionConfig = () => {
    const configs: Record<string, { title: string; subtitle: string }> = {
      'asset-documentation': { title: 'Asset Documentation', subtitle: 'Claim-ready proof for your home and belongings.' },
      'password-catalog': { title: 'Digital Access', subtitle: 'Encrypted storage for everyday online accounts.' },
      'legacy-locker': { title: 'Legacy Locker', subtitle: 'Guidance and access when you can\'t be there.' },
      'insights-tools': { title: 'Insights & Tools', subtitle: 'Track values, manage repairs, and organize property details.' },
      'life-hub': { title: 'Family Archive', subtitle: 'Everyday life, organized and protected.' },
      
      'asset-values': { title: 'Asset Values', subtitle: 'Track the estimated value of your documented assets.' },
      'source-websites': { title: 'Source Websites', subtitle: 'Save product sources and reference links.' },
      'damage': { title: 'Post Damage Report', subtitle: 'Document damage and submit post-incident details.' },
      'voice-notes': { title: 'Voice Notes', subtitle: 'Record and store voice memos for your records.' },
      'paint-codes': { title: 'Paint Codes', subtitle: 'Store paint colors, brands, and finish details.' },
      'service-pros': { title: 'Trusted Professionals', subtitle: 'Track your trusted service providers and contractors.' },
      'upgrades-repairs': { title: 'Upgrades & Repairs', subtitle: 'Document property improvements and repair history.' },
      'smart-calendar': { title: 'Smart Calendar', subtitle: 'Reminders, records, and timelines — all in one place.' },
      'quick-notes': { title: 'Quick Notes', subtitle: 'Jot down quick reminders or thoughts.' },
      'notes-traditions': { title: 'Notes & Traditions', subtitle: 'Capture family traditions, stories, and important notes.' },
      'family-recipes': { title: 'Family Recipes', subtitle: 'Preserve cherished family recipes for generations.' },
      'medication-list': { title: 'Medication List', subtitle: 'A simple family-reference list for medications, pharmacies, and related notes.' },
      'important-locations': { title: 'Important Locations', subtitle: 'Record where important documents, keys, keepsakes, and physical items are stored.' },
      'memory-safe': { title: 'Memory Safe', subtitle: 'A protected place for the memories you want to keep — and pass on.' },
      'access-activity': { title: 'Access & Activity', subtitle: 'Manage authorized users and monitor recent account activity.' },
      'emergency-instructions': { title: 'Emergency Instructions', subtitle: 'Clear guidance that brings clarity during unexpected situations.' },
    };
    return configs[activeTab] || { title: '', subtitle: '' };
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      

      <div className="flex-grow py-8 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          {/* Viewer Restriction Banner */}
          <ViewerRestrictionBanner />
          <GracePeriodBanner />
          <ExpiredSubscriptionBanner
            onReactivate={() => navigate('/account/settings?tab=manage')}
            onExport={() => setActiveTab('export')}
            onDelete={() => navigate('/account/settings?tab=manage')}
          />


          {/* Welcome Banner + Security Progress - ONLY on overview */}
          {isOverview && (
            <>
              <div className="mb-4">
                <WelcomeBanner
                  onTabChange={setActiveTab}
                  isFirstDashboardVisit={shouldShowFirstDashboardWelcome}
                />
              </div>
              <SubscriptionEndingBanner />
              <ScheduledDeletionBanner />
              <div className="mb-4">
                <SecurityProgress hideChecklist />
              </div>
              
            </>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            {/* Back Navigation Buttons */}
            {!isOverview && (
              <div className="w-full flex flex-wrap gap-2">
                <Button
                  onClick={() => {
                    setActiveTab('overview');
                    navigate('/account', { replace: true });
                  }}
                  variant="outline"
                  size="sm"
                  className="bg-white text-brand-orange border-brand-orange hover:bg-brand-orange/10"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back to Dashboard
                </Button>

                {['voice-notes', 'service-pros', 'notes-traditions', 'family-recipes', 'medication-list', 'important-locations', 'memory-safe'].includes(activeTab) && (
                  <Button
                    onClick={() => {
                      setActiveTab('life-hub');
                      navigate('/account?tab=life-hub', { replace: true });
                    }}
                    variant="outline"
                    size="sm"
                    className="bg-white text-brand-orange border-brand-orange hover:bg-brand-orange/10"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Back to Family Archive
                  </Button>
                )}

                {['source-websites', 'paint-codes', 'upgrades-repairs', 'smart-calendar'].includes(activeTab) && (
                  <Button
                    onClick={() => {
                      setActiveTab('insights-tools');
                      navigate('/account?tab=insights-tools', { replace: true });
                    }}
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
              <OverviewContent setActiveTab={setActiveTab} />
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
                <ContinuityRequestBanner />
                <AccountContinuityInstructions />
                <ContinuityPreferencesPage />
                <SecureVault initialTab="legacy" />
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

            <TabsContent value="smart-calendar">
              <SmartCalendar />
            </TabsContent>

            <TabsContent value="quick-notes">
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{getSectionConfig().title}</h2>
                  <p className="text-muted-foreground text-sm mt-1">{getSectionConfig().subtitle}</p>
                </div>
                <QuickNotesSection />
              </div>
            </TabsContent>

            <TabsContent value="notes-traditions">
              <NotesAndTraditions />
            </TabsContent>

            <TabsContent value="family-recipes">
              <FamilyRecipes />
            </TabsContent>

            <TabsContent value="medication-list">
              <FamilyMedications onNavigate={setActiveTab} />
            </TabsContent>

            <TabsContent value="important-locations">
              <ImportantLocations onNavigate={setActiveTab} />
            </TabsContent>

            <TabsContent value="memory-safe">
              <MemorySafe />
            </TabsContent>

            {/* Access & Activity */}
            <TabsContent value="access-activity">
              <AccessActivitySection />
            </TabsContent>

            {/* Emergency Instructions */}
            <TabsContent value="emergency-instructions">
              <EmergencyInstructions onNavigate={setActiveTab} standalone />
            </TabsContent>

          </Tabs>

          {/* Feedback Section */}
          <FeedbackSection />
        </div>
      </div>

      <Footer />
      <FirstDashboardWelcomeModal
        open={welcomeModalOpen && shouldShowFirstDashboardWelcome}
        firstName={getFirstName()}
        canManageDashboard={canEdit && isOwner}
        onDismiss={dismissDashboardWelcome}
        onChoose={handleDashboardWelcomeChoice}
      />
      <DashboardTour isVisible={showTour} onClose={closeTour} />
    </div>
  );
};

export default Account;

// Renders the personal workspace preview for unpaid Authorized Users viewing
// their own (owner) workspace; otherwise renders the standard dashboard grid.
const OverviewContent: React.FC<{ setActiveTab: (t: string) => void }> = ({ setActiveTab }) => {
  const { isViewingOwnWorkspace } = useAccount();
  const { isPremium, loading: subLoading } = useSubscription();

  if (isViewingOwnWorkspace && !isPremium && !subLoading) {
    return <PersonalWorkspacePreview />;
  }
  return <DashboardGrid onTabChange={setActiveTab} />;
};

