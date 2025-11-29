
import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import UnderConstructionBanner from '@/components/UnderConstructionBanner';
import HeroSection from '@/components/HeroSection';
import AboutSection from '@/components/AboutSection';
import TrialCTASection from '@/components/TrialCTASection';
import GiftSection from '@/components/GiftSection';
import FeaturedSection from '@/components/FeaturedSection';
import FeaturesSection from '@/components/FeaturesSection';
import HowItWorksSection from '@/components/HowItWorksSection';
import LegacyLockerSection from '@/components/LegacyLockerSection';
import CTASection from '@/components/CTASection';
import FeedbackSection from '@/components/FeedbackSection';
import { organizationSchema, webApplicationSchema } from '@/utils/structuredData';

const Index: React.FC = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [organizationSchema, webApplicationSchema]
  };

  return (
    <div className="flex flex-col min-h-screen">
      <SEOHead
        title="Asset Safe - Digital Home Inventory & Legacy Locker"
        description="Comprehensive property documentation platform for homeowners, renters, and businesses. Protect your assets with secure digital inventory, insurance claims support, and legacy planning tools."
        keywords="digital home inventory, property documentation, insurance claims, asset protection, legacy locker, estate planning, home inventory app, homeowner documentation"
        canonicalUrl="https://www.assetsafe.net/"
        structuredData={structuredData}
      />
      <UnderConstructionBanner />
      <Navbar />
      <HeroSection />
      <AboutSection />
      <GiftSection />
      <LegacyLockerSection />
      <FeaturedSection />
      <FeaturesSection />
      <HowItWorksSection />
      <CTASection />
      <FeedbackSection />
      <Footer />
    </div>
  );
};

export default Index;
