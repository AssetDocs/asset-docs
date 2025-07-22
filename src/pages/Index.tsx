
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import AboutSection from '@/components/AboutSection';
import FeaturedGuideShortcut from '@/components/FeaturedGuideShortcut';
import AIValuationSection from '@/components/AIValuationSection';
import FeaturesSection from '@/components/FeaturesSection';
import HowItWorksSection from '@/components/HowItWorksSection';
import CTASection from '@/components/CTASection';
import FeedbackSection from '@/components/FeedbackSection';

const Index: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <HeroSection />
      <AboutSection />
      <FeaturedGuideShortcut />
      <AIValuationSection />
      <FeaturesSection />
      <HowItWorksSection />
      <CTASection />
      <FeedbackSection />
      <Footer />
    </div>
  );
};

export default Index;
