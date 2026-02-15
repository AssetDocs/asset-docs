
import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import UnderConstructionBanner from '@/components/UnderConstructionBanner';
import HeroSection from '@/components/HeroSection';

import GiftSection from '@/components/GiftSection';
import DocumentProtectSection from '@/components/DocumentProtectSection';
import LegacyLockerSection from '@/components/LegacyLockerSection';
import ScrollProgressCue from '@/components/ScrollProgressCue';
import ComparisonSection from '@/components/ComparisonSection';
import CTASection from '@/components/CTASection';
import { organizationSchema, webApplicationSchema, faqSchema, videoSchema } from '@/utils/structuredData';

const Index: React.FC = () => {
  const faqData = [
    { question: "What is a digital home inventory?", answer: "A digital home inventory is a comprehensive record of your property and possessions, including photos, videos, receipts, and detailed descriptions. It serves as proof of ownership for insurance claims, estate planning, and property documentation." },
    { question: "How does Asset Safe protect my data?", answer: "Asset Safe uses enterprise-grade encryption, secure cloud storage, and follows industry best practices for data protection. All files are encrypted both in transit and at rest." },
    { question: "What is the Legacy Locker?", answer: "Legacy Locker is a secure digital vault for storing important information your loved ones will need—estate documents, account details, personal notes, and instructions. It's not a legal will, but a companion tool that supports your estate planning." },
    { question: "Can I use Asset Safe for insurance claims?", answer: "Yes! Asset Safe provides pre-documented proof of ownership, receipts, condition photos, and detailed descriptions to streamline insurance claims and maximize recovery." }
  ];

  const heroVideoData = videoSchema(
    "Asset Safe Introduction - Digital Home Inventory Platform",
    "Learn how Asset Safe helps you document, protect, and organize your property, assets, and critical information for insurance claims and estate planning.",
    "https://www.getassetsafe.com/assets/youtube-cover-walkthrough.jpg",
    "2025-01-01",
    undefined,
    "https://www.youtube.com/embed/DPnzWlqTN6Q",
    "PT3M"
  );

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [organizationSchema, webApplicationSchema, faqSchema(faqData), heroVideoData]
  };

  return (
    <div className="flex flex-col min-h-screen">
      <SEOHead
        title="Digital Home Inventory & Legacy Planning | Asset Safe"
        description="Document your home, belongings, and important records in one secure platform. Insurance-ready inventory, Legacy Locker, and estate planning tools. No long-term contract."
        keywords="digital home inventory, property documentation, home inventory app, insurance claims documentation, legacy locker, estate planning vault, digital asset management, homeowner inventory system"
        canonicalUrl="https://www.getassetsafe.com/"
        structuredData={structuredData}
      />
      <UnderConstructionBanner />
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
