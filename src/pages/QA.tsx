import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FAQAccordion from '@/components/FAQAccordion';

const QA: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
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
