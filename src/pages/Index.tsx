
import React, { useState, useEffect } from 'react';
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
import LeadCaptureModal from '@/components/LeadCaptureModal';

const Index: React.FC = () => {
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);

  useEffect(() => {
    // Show the modal after a short delay when the page loads
    const timer = setTimeout(() => {
      setIsLeadModalOpen(true);
    }, 2000); // 2 second delay

    return () => clearTimeout(timer);
  }, []);

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
      
      <LeadCaptureModal 
        isOpen={isLeadModalOpen}
        onClose={() => setIsLeadModalOpen(false)}
      />
    </div>
  );
};

export default Index;
