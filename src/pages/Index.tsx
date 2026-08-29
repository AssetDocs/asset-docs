
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
import HomeFAQ from '@/components/HomeFAQ';
import { organizationSchema, webApplicationSchema, faqSchema, videoSchema } from '@/utils/structuredData';
import introVideo from '@/assets/asset-safe-intro.mp4.asset.json';
import introPoster from '@/assets/asset-safe-intro-poster.jpg.asset.json';


const Index: React.FC = () => {
  const faqData = [
    { question: "What is a digital home inventory?", answer: "A digital home inventory is a comprehensive record of your property and possessions, including photos, videos, receipts, and detailed descriptions. Learn more in Asset Safe's home inventory guide." },
    { question: "How does Asset Safe protect my data?", answer: "Asset Safe uses enterprise-grade encryption, secure cloud storage, and follows industry best practices for data protection. All files are encrypted both in transit and at rest." },
    { question: "What is the Legacy Locker?", answer: "Legacy Locker is a secure digital vault for storing important information your loved ones will need—estate documents, account details, personal notes, and instructions. It's not a legal will, but a companion tool that supports your estate planning." },
    { question: "Can I use Asset Safe for insurance claims?", answer: "Yes! Asset Safe provides pre-documented proof of ownership, receipts, condition photos, and detailed descriptions to streamline insurance claims and maximize recovery." }
  ];

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
    "@graph": [organizationSchema, webApplicationSchema, faqSchema(faqData), heroVideoData]
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
      <HomeFAQ />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
