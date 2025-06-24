
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PricingHero from '@/components/PricingHero';
import PricingPlans from '@/components/PricingPlans';
import PricingFAQ from '@/components/PricingFAQ';
import PricingContactCTA from '@/components/PricingContactCTA';

const Pricing: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <PricingHero />
      <PricingPlans />
      <PricingFAQ />
      <PricingContactCTA />
      <Footer />
    </div>
  );
};

export default Pricing;
