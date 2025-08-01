
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AssetValuesSection from '@/components/AssetValuesSection';
import AccountHeader from '@/components/AccountHeader';
import AccountStats from '@/components/AccountStats';
import AccountActions from '@/components/AccountActions';

import FloorPlansSection from '@/components/FloorPlansSection';
import StorageAlert from '@/components/StorageAlert';

import PostDamageSection from '@/components/PostDamageSection';
import VoiceNotesSection from '@/components/VoiceNotesSection';
import DashboardTour from '@/components/DashboardTour';

import DocumentationChecklist from '@/components/DocumentationChecklist';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useIsMobile } from '@/hooks/use-mobile';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Account: React.FC = () => {
  
  const [showTour, setShowTour] = useState(false);
  const { subscriptionTier } = useSubscription();
  const isMobile = useIsMobile();
  
  const showFloorPlans = subscriptionTier !== 'basic';

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

  const handleCreateFloorPlan = () => {
    console.log('Create Floor Plan clicked - will connect to CubiCasa');
    // TODO: Integrate with CubiCasa software
  };


  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="flex-grow py-8 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          
          
          <div id="account-header">
            <AccountHeader />
          </div>

          <div id="storage-alert">
            <StorageAlert />
          </div>

          <Tabs defaultValue="overview" className="space-y-6" id="tabs-content">
            <TabsList className={`${isMobile ? 'flex overflow-x-auto' : `grid ${showFloorPlans ? 'grid-cols-5' : 'grid-cols-4'}`} w-full`}>
              <TabsTrigger value="overview" className={isMobile ? 'flex-shrink-0' : ''}>
                {isMobile ? 'Home' : 'Overview'}
              </TabsTrigger>
              {showFloorPlans && (
                <TabsTrigger value="floor-plans" className={isMobile ? 'flex-shrink-0' : ''}>
                  {isMobile ? 'Plans' : 'Floor Plans'}
                </TabsTrigger>
              )}
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
              <AccountActions onCreateFloorPlan={handleCreateFloorPlan} showFloorPlans={showFloorPlans} />
              <DocumentationChecklist />
              
            </TabsContent>

            {showFloorPlans && (
              <TabsContent value="floor-plans">
                <FloorPlansSection />
              </TabsContent>
            )}

            <TabsContent value="asset-values">
              <AssetValuesSection />
            </TabsContent>

            <TabsContent value="damage">
              <PostDamageSection />
            </TabsContent>

            <TabsContent value="voice-notes">
              <VoiceNotesSection />
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
