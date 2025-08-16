
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import AboutSection from '@/components/AboutSection';
import GiftSection from '@/components/GiftSection';
import FeaturedSection from '@/components/FeaturedSection';
import AIValuationSection from '@/components/AIValuationSection';
import FeaturesSection from '@/components/FeaturesSection';
import HowItWorksSection from '@/components/HowItWorksSection';
import CTASection from '@/components/CTASection';
import FeedbackSection from '@/components/FeedbackSection';
import LeadCaptureModal from '@/components/LeadCaptureModal';
import { useAuth } from '@/contexts/AuthContext';

const Index: React.FC = () => {
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Don't show modal if user is already logged in
    if (user) return;
    
    // Check if user has already submitted the lead form
    const hasSubmittedLead = localStorage.getItem('hasSubmittedLead');
    if (hasSubmittedLead === 'true') return;
    
    // Check if this is a returning visitor (has visited before)
    const hasVisitedBefore = localStorage.getItem('hasVisitedBefore');
    if (!hasVisitedBefore) {
      // Mark as visited for future visits
      localStorage.setItem('hasVisitedBefore', 'true');
      
      // Show the modal after a delay for first-time visitors
      const timer = setTimeout(() => {
        setIsLeadModalOpen(true);
      }, 10000); // 10 second delay

      return () => clearTimeout(timer);
    }
  }, [user]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <HeroSection />
      
      {/* Outseta Sign-up Embed */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Get Started Today</h2>
            <p className="text-lg text-gray-600 mb-8">Join thousands of property owners protecting their assets</p>
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div data-o-auth="1"
                   data-widget-mode="register"
                   data-plan-uid="7ma6VJQE"
                   data-plan-payment-term="month"
                   data-skip-plan-options="true"
                   data-mode="embed">
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <AboutSection />
      <GiftSection />
      <FeaturedSection />
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
