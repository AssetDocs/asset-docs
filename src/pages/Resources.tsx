
import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import TrustSecuritySection from '@/components/TrustSecuritySection';
import EducationalResources from '@/components/EducationalResources';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link, useSearchParams } from 'react-router-dom';
import { breadcrumbSchema } from '@/utils/structuredData';

const resourceLinks = [
  { title: 'Home Inventory', description: 'Create a room-by-room inventory with photos, receipts, values, and item details.', href: '/home-inventory' },
  { title: 'Renters', description: 'Document rental condition, belongings, move-in records, and move-out records.', href: '/renters' },
  { title: 'Asset Documentation', description: 'What to record about belongings, property, values, receipts, and condition.', href: '/asset-documentation' },
  { title: 'Photography Guide', description: 'How to capture rooms, items, serial numbers, condition, and supporting paperwork.', href: '/photography-guide' },
  { title: 'Digital Documentation Guide', description: 'How organized digital records compare with spreadsheets and scattered phone photos.', href: '/digital-documentation-guide' },
  { title: 'Claims Documentation', description: 'Records that may support insurance claim preparation after loss or damage.', href: '/claims' },
  { title: 'Property Damage Scenarios', description: 'Events where documentation can help you respond with clearer information.', href: '/scenarios' },
  { title: 'Awareness Guide', description: 'Hidden property risks, prevention prompts, and documentation reminders.', href: '/awareness-guide' },
  { title: 'Blog', description: 'Additional articles about preparedness, organization, gifts, and long-term protection.', href: '/blog' }
];

const Resources: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("education");

  const structuredData = breadcrumbSchema([
    { name: 'Home', url: 'https://getassetsafe.com/' },
    { name: 'Resources', url: 'https://getassetsafe.com/resources' }
  ]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'security') {
      setActiveTab('security');
    }
  }, [searchParams]);
  
  return (
    <div className="flex flex-col min-h-screen">
      <SEOHead
        title="Resources | Asset Safe"
        description="Find Asset Safe guides for documentation, photography, insurance preparation, records, security, and account support."
        canonicalUrl="https://getassetsafe.com/resources"
        structuredData={structuredData}
      />
      <Navbar />
      
      <div className="flex-grow py-12 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-brand-blue mb-4">
              Resources & Security
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Practical guides for documenting property and belongings, preparing for unexpected events, organizing records, improving photos, understanding claims documentation, and reviewing product security information.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {resourceLinks.map((resource) => (
              <Link
                key={resource.href}
                to={resource.href}
                className="block bg-white border rounded-lg p-5 hover:border-brand-blue hover:shadow-md transition"
              >
                <h2 className="text-lg font-semibold text-brand-blue mb-2">{resource.title}</h2>
                <p className="text-sm text-gray-600">{resource.description}</p>
              </Link>
            ))}
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
