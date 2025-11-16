
import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
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

const Index: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <UnderConstructionBanner />
      <Navbar />
      <HeroSection />
      <AboutSection />
      <TrialCTASection />
      <GiftSection />
      <FeaturedSection />
      <FeaturesSection />
      <HowItWorksSection />
      <LegacyLockerSection />
      <CTASection />
      <FeedbackSection />
      <Footer />
    </div>
  );
};

export default Index;
