import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FAQAccordion from '@/components/FAQAccordion';
import SEOHead from '@/components/SEOHead';
import { faqSchema, breadcrumbSchema } from '@/utils/structuredData';

const QA: React.FC = () => {
  const faqData = [
    { question: "How secure is my property documentation?", answer: "Asset Safe uses enterprise-grade encryption both in transit and at rest, with strict access controls ensuring only you and anyone you authorize can access your information." },
    { question: "Is my data backed up, and what happens if I cancel?", answer: "Yes. Your data is automatically backed up across multiple secure cloud systems. If you cancel, you retain full access through the end of your billing period." },
    { question: "Why does Asset Safe require multi-factor authentication?", answer: "MFA adds critical layers of protection for sensitive actions like accessing the Secure Vault, using TOTP authenticator apps or one-time backup recovery codes." },
    { question: "What is Legacy Locker?", answer: "Legacy Locker is a secure, encrypted digital vault inside Asset Safe designed to store important information your loved ones may need—photos, videos, account details, and clear instructions." },
    { question: "Can I use Asset Safe for insurance claims?", answer: "Yes! Asset Safe provides pre-documented proof of ownership, receipts, condition photos, and detailed descriptions to streamline insurance claims and maximize recovery." },
    { question: "What payment methods do you accept?", answer: "We accept all major credit and debit cards through our secure Stripe payment processing. We offer both monthly and annual billing options." }
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      faqSchema(faqData),
      breadcrumbSchema([
        { name: 'Home', url: 'https://www.getassetsafe.com/' },
        { name: 'FAQ', url: 'https://www.getassetsafe.com/qa' }
      ])
    ]
  };

  return (
    <div className="flex flex-col min-h-screen">
      <SEOHead
        title="FAQ - Common Questions Answered | Asset Safe"
        description="Find answers to common questions about digital home inventory, insurance documentation, Legacy Locker, pricing, and account security at Asset Safe."
        keywords="asset safe faq, home inventory questions, insurance documentation help, legacy locker faq, digital vault questions, property documentation support"
        canonicalUrl="https://www.getassetsafe.com/qa"
        structuredData={structuredData}
      />
      <Navbar />
      
      <div className="container mx-auto px-4 py-12 flex-grow">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-brand-blue mb-2">Frequently Asked Questions</h1>
          <p className="text-gray-600 mb-8">
            Find answers to common questions about Asset Safe. Need more help? Click the chat bubble in the bottom right corner!
          </p>
          
          <div className="mb-10">
            <FAQAccordion />
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default QA;
