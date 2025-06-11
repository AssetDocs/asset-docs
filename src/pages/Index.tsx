
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import AIValuationSection from '@/components/AIValuationSection';
import FeaturesSection from '@/components/FeaturesSection';
import HowItWorksSection from '@/components/HowItWorksSection';
import CTASection from '@/components/CTASection';
import DisclaimerSection from '@/components/DisclaimerSection';

const Index: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <HeroSection />
      <AIValuationSection />
      <FeaturesSection />
      <HowItWorksSection />
      <CTASection />
      <DisclaimerSection />
      <Footer />
    </div>
  );
};

export default Index;
