import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AssetValuesSection from '@/components/AssetValuesSection';
import AccountHeader from '@/components/AccountHeader';
import AccountStats from '@/components/AccountStats';
import QRCodeSection from '@/components/QRCodeSection';
import FloorPlansSection from '@/components/FloorPlansSection';
import StorageAlert from '@/components/StorageAlert';
import PostDamageSection from '@/components/PostDamageSection';
import VoiceNotesSection from '@/components/VoiceNotesSection';

import AppDownloadButtons from '@/components/AppDownloadButtons';
import ChecklistsAccess from '@/components/ChecklistsAccess';
import AccountActions from '@/components/AccountActions';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, Play } from 'lucide-react';

const SampleDashboard: React.FC = () => {
  const [showQRCode, setShowQRCode] = useState(false);

  const handleCreateFloorPlan = () => {
    console.log('Demo mode - Floor plan creation disabled');
  };

  const generatePropertyQR = () => {
    setShowQRCode(true);
    console.log('Demo mode - QR code generation (view only)');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="flex-grow py-8 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          {/* Demo Banner */}
          <Alert className="mb-6 border-brand-blue bg-brand-blue/5">
            <Eye className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>
                <strong>Demo Dashboard</strong> - This is a sample view of the Asset Docs dashboard. 
                Features are read-only for demonstration purposes.
              </span>
            </AlertDescription>
          </Alert>

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
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
              <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
              <TabsTrigger value="floor-plans" className="text-xs sm:text-sm">Floor Plans</TabsTrigger>
              <TabsTrigger value="asset-values" className="text-xs sm:text-sm">Asset Values</TabsTrigger>
              <TabsTrigger value="damage" className="text-xs sm:text-sm">Post Damage</TabsTrigger>
              <TabsTrigger value="voice-notes" className="text-xs sm:text-sm">Voice Notes</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <AccountStats />
              <div className="bg-white rounded-lg border p-6">
                <h3 className="text-lg font-semibold mb-4">Quick Actions (Demo Mode)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    onClick={handleCreateFloorPlan}
                    disabled
                    className="bg-gray-100 text-gray-500 cursor-not-allowed"
                  >
                    Create Floor Plan (Demo)
                  </Button>
                  <Button 
                    disabled
                    className="bg-gray-100 text-gray-500 cursor-not-allowed"
                  >
                    Upload Photos (Demo)
                  </Button>
                  <Button 
                    disabled
                    className="bg-gray-100 text-gray-500 cursor-not-allowed"
                  >
                    Add Property (Demo)
                  </Button>
                </div>
              </div>
              <AccountActions onCreateFloorPlan={handleCreateFloorPlan} />
              <ChecklistsAccess />
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

          </Tabs>
        </div>
      </div>
      
      <Footer />
      
      
    </div>
  );
};

export default SampleDashboard;