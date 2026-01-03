import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import ChatbotInterface from '@/components/ChatbotInterface';
import FAQAccordion from '@/components/FAQAccordion';

const QA: React.FC = () => {
  const [showChat, setShowChat] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12 flex-grow">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-brand-blue mb-2">Frequently Asked Questions</h1>
          <p className="text-gray-600 mb-8">
            Find answers to common questions about Asset Safe or chat with our AI assistant for specific inquiries.
          </p>
          
          <div className="mb-10">
            <FAQAccordion />
            
            <div className="mt-10 text-center">
              <p className="text-lg mb-4">Don't see your question answered? Chat with our AI assistant!</p>
              <Button 
                onClick={() => setShowChat(!showChat)} 
                className="bg-brand-blue hover:bg-brand-lightBlue"
              >
                {showChat ? 'Close Chat' : 'Open Chat Assistant'}
              </Button>
            </div>
            
            {showChat && (
              <div className="mt-6">
                <ChatbotInterface />
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default QA;
