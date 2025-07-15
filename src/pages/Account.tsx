
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AssetValuesSection from '@/components/AssetValuesSection';
import AccountHeader from '@/components/AccountHeader';
import AccountStats from '@/components/AccountStats';
import AccountActions from '@/components/AccountActions';
import QRCodeSection from '@/components/QRCodeSection';
import FloorPlansSection from '@/components/FloorPlansSection';
import StorageAlert from '@/components/StorageAlert';
import HouseholdIncomeSection from '@/components/HouseholdIncomeSection';
import PostDamageSection from '@/components/PostDamageSection';
import VoiceNotesSection from '@/components/VoiceNotesSection';
import DashboardTour from '@/components/DashboardTour';
import AppDownloadButtons from '@/components/AppDownloadButtons';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Account: React.FC = () => {
  const [showQRCode, setShowQRCode] = useState(false);
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    // Check if user has seen the tour before
    const hasSeenTour = localStorage.getItem('hasSeenDashboardTour');
    if (!hasSeenTour) {
      setShowTour(true);
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

  const generatePropertyQR = () => {
    setShowQRCode(true);
    console.log('Generating QR code for property access');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="flex-grow py-8 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <AppDownloadButtons />
          
          <div id="account-header">
            <AccountHeader 
              showQRCode={showQRCode}
              onGenerateQR={generatePropertyQR}
            />
          </div>

          <div id="storage-alert">
            <StorageAlert />
          </div>

          <Tabs defaultValue="overview" className="space-y-6" id="tabs-content">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="floor-plans">Floor Plans</TabsTrigger>
              <TabsTrigger value="asset-values">Asset Values</TabsTrigger>
              <TabsTrigger value="damage">Post Damage</TabsTrigger>
              <TabsTrigger value="voice-notes">Voice Notes</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <AccountStats />
              <AccountActions onCreateFloorPlan={handleCreateFloorPlan} />
              <QRCodeSection />
            </TabsContent>

            <TabsContent value="floor-plans">
              <FloorPlansSection />
            </TabsContent>

            <TabsContent value="asset-values">
              <AssetValuesSection />
            </TabsContent>

            <TabsContent value="damage">
              <PostDamageSection />
            </TabsContent>

            <TabsContent value="voice-notes">
              <VoiceNotesSection />
            </TabsContent>

            <TabsContent value="profile" className="space-y-6">
              <HouseholdIncomeSection />
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
