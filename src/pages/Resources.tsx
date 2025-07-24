
import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TrustSecuritySection from '@/components/TrustSecuritySection';
import EducationalResources from '@/components/EducationalResources';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSearchParams } from 'react-router-dom';

const Resources: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("education");

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'security') {
      setActiveTab('security');
    }
  }, [searchParams]);
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="flex-grow py-12 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-brand-blue mb-4">
              Resources & Security
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to maximize your property protection and understand our security measures
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
              <TabsTrigger value="education">Educational Resources</TabsTrigger>
              <TabsTrigger value="security">Security & Trust</TabsTrigger>
            </TabsList>

            <TabsContent value="education">
              <EducationalResources />
            </TabsContent>

            <TabsContent value="security">
              <TrustSecuritySection />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Resources;
