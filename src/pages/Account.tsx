
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AssetValuesSection from '@/components/AssetValuesSection';
import AccountHeader from '@/components/AccountHeader';
import AccountStats from '@/components/AccountStats';
import AccountActions from '@/components/AccountActions';
import QRCodeSection from '@/components/QRCodeSection';
import FloorPlansSection from '@/components/FloorPlansSection';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Account: React.FC = () => {
  const [showQRCode, setShowQRCode] = useState(false);

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
          <AccountHeader 
            showQRCode={showQRCode}
            onGenerateQR={generatePropertyQR}
          />

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="floor-plans">Floor Plans</TabsTrigger>
              <TabsTrigger value="asset-values">Asset Values</TabsTrigger>
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
          </Tabs>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Account;
