
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import AboutSection from '@/components/AboutSection';
import TrialCTASection from '@/components/TrialCTASection';
import GiftSection from '@/components/GiftSection';
import FeaturedSection from '@/components/FeaturedSection';
import FeaturesSection from '@/components/FeaturesSection';
import HowItWorksSection from '@/components/HowItWorksSection';
import CTASection from '@/components/CTASection';
import FeedbackSection from '@/components/FeedbackSection';

const Index: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="bg-yellow/20 border-b-2 border-yellow py-3 px-4">
        <p className="text-center text-sm md:text-base text-muted-foreground max-w-4xl mx-auto">
          This website is still under construction. However, feel free to browse around and learn more about the services we offer. Please reach out with any questions you may have.
        </p>
      </div>
      <Navbar />
      <HeroSection />
      <AboutSection />
      <TrialCTASection />
      <GiftSection />
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
