
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';

import HeroSection from '@/components/HeroSection';

import GiftSection from '@/components/GiftSection';
import DocumentProtectSection from '@/components/DocumentProtectSection';
import LegacyLockerSection from '@/components/LegacyLockerSection';
import ScrollProgressCue from '@/components/ScrollProgressCue';
import ComparisonSection from '@/components/ComparisonSection';
import CTASection from '@/components/CTASection';
import { organizationSchema, webApplicationSchema, videoSchema } from '@/utils/structuredData';
import introVideo from '@/assets/asset-safe-intro.mp4.asset.json';
import introPoster from '@/assets/asset-safe-intro-poster.jpg.asset.json';


const Index: React.FC = () => {
  const heroVideoData = videoSchema(
    "Asset Safe Introduction - Digital Home Inventory Platform",
    "Learn how Asset Safe helps you document, protect, and organize your property, assets, and critical information for insurance claims and estate planning.",
    `https://getassetsafe.com${introPoster.url}`,
    "2025-01-01",
    `https://getassetsafe.com${introVideo.url}`,
    undefined,
    "PT1M"
  );


  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [organizationSchema, webApplicationSchema, heroVideoData]
  };

  return (
    <div className="flex flex-col min-h-screen">
      <SEOHead
        title="Asset Safe — Document Your Property, Belongings & Records"
        description="Keep your property, belongings, records, and important information documented and organized in one secure place — ready whenever you need them."
        canonicalUrl="https://getassetsafe.com/"
        structuredData={structuredData}
      />
      
      <Navbar />
      <HeroSection />
      <DocumentProtectSection />
      <ScrollProgressCue />
      <LegacyLockerSection />
      <GiftSection />
      <ComparisonSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
