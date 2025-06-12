
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import ChatbotInterface from '@/components/ChatbotInterface';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const QA: React.FC = () => {
  const [showChat, setShowChat] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12 flex-grow">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-brand-blue mb-2">Frequently Asked Questions</h1>
          <p className="text-gray-600 mb-8">
            Find answers to common questions about AssetDocs or chat with our AI assistant for specific inquiries.
          </p>
          
          <div className="mb-10">
            <Accordion type="single" collapsible className="mb-8">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-lg font-medium">How does the AI valuation system work?</AccordionTrigger>
                <AccordionContent>
                  Our AI technology automatically identifies items in your uploaded images and assigns an estimated 
                  market value based on current pricing data. The system uses computer vision to recognize objects, 
                  cross-references them with pricing databases, and provides an accurate valuation that can be used 
                  for insurance, estate planning, or financial records.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2">
                <AccordionTrigger className="text-lg font-medium">How secure is my property documentation?</AccordionTrigger>
                <AccordionContent>
                  AssetDocs uses enterprise-grade encryption and secure cloud storage to protect your valuable 
                  documentation. All data is encrypted both in transit and at rest, and we implement strict access 
                  controls to ensure your information remains private and secure at all times. Our security protocols 
                  are regularly audited and updated to maintain the highest standards of data protection.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3">
                <AccordionTrigger className="text-lg font-medium">Can I use AssetDocs for inventory management or business operations?</AccordionTrigger>
                <AccordionContent>
                  No, AssetDocs is specifically designed for property documentation and insurance protection, not 
                  inventory management or business operations. Our platform focuses on helping property owners 
                  create comprehensive documentation of their personal assets for insurance claims, estate planning, 
                  and financial records. For business inventory management, we recommend using dedicated inventory 
                  management software that is designed for tracking business assets and operations.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-4">
                <AccordionTrigger className="text-lg font-medium">What pricing plans are available?</AccordionTrigger>
                <AccordionContent>
                  AssetDocs offers flexible pricing plans to meet different needs. We provide a free 14-day trial 
                  with no credit card required. Our plans include basic documentation features for individuals, 
                  premium plans with advanced AI valuation and 3D scanning, and professional services for high-value 
                  properties. All plans include secure cloud storage and insurance-ready documentation.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-5">
                <AccordionTrigger className="text-lg font-medium">How accurate are the AI valuations?</AccordionTrigger>
                <AccordionContent>
                  Our AI valuation system provides estimates based on current market data and comparable sales. 
                  While highly accurate for most common items, valuations should be considered estimates for 
                  insurance and planning purposes. For high-value items like fine art, jewelry, or antiques, 
                  we recommend professional appraisals which can be coordinated through our platform.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-6">
                <AccordionTrigger className="text-lg font-medium">Can I use AssetDocs for insurance claims?</AccordionTrigger>
                <AccordionContent>
                  Yes! AssetDocs is specifically designed to help with insurance claims. Our third-party verification 
                  process creates legally valid documentation of your assets that can expedite claims processing. 
                  You can generate detailed reports that include proof of ownership, condition documentation, and 
                  value assessments that most insurance companies accept as valid evidence during claims.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-7">
                <AccordionTrigger className="text-lg font-medium">Is my data backed up and what happens if I cancel?</AccordionTrigger>
                <AccordionContent>
                  Yes, all your data is automatically backed up across multiple secure data centers with 99.9% uptime. 
                  If you cancel your subscription, you'll have 90 days to download all your documentation and data. 
                  We also offer data export in multiple formats including PDF reports, image archives, and structured 
                  data files that you can use with other systems.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-8">
                <AccordionTrigger className="text-lg font-medium">How does receipt integration work?</AccordionTrigger>
                <AccordionContent>
                  When you upload photos of your possessions, you can also upload associated receipts. Our system 
                  will automatically match receipts with the correct items in your inventory. The AI recognizes 
                  product information from receipts and links them to corresponding items, creating a comprehensive 
                  record that includes both visual documentation and proof of purchase.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-9">
                <AccordionTrigger className="text-lg font-medium">What types of assets can I document?</AccordionTrigger>
                <AccordionContent>
                  AssetDocs supports documentation of virtually any physical asset, including electronics, furniture, 
                  artwork, jewelry, collectibles, appliances, vehicles, and real estate. Our AI is trained to identify 
                  and categorize thousands of different items, and our 3D virtual tour feature is perfect for 
                  documenting spaces and larger possessions with precise measurements.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-10">
                <AccordionTrigger className="text-lg font-medium">Do you offer mobile apps?</AccordionTrigger>
                <AccordionContent>
                  Yes! AssetDocs offers mobile apps for both iOS and Android devices. The mobile app includes all 
                  core features like photo capture, AI identification, receipt scanning, and 3D room scanning. 
                  You can document items on-the-go and sync everything automatically with your account. The app 
                  works offline and syncs when you're connected to the internet.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-11">
                <AccordionTrigger className="text-lg font-medium">How do I get started with AssetDocs?</AccordionTrigger>
                <AccordionContent>
                  Getting started is easy! Sign up for a free 14-day trial (no credit card required) and download our 
                  mobile app. You can begin documenting your possessions right away by taking photos or videos. For more 
                  comprehensive documentation, you can use our 3D virtual tour feature or request our professional 
                  documentation service for high-value assets.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-12">
                <AccordionTrigger className="text-lg font-medium">Can I share my documentation with others?</AccordionTrigger>
                <AccordionContent>
                  Yes, AssetDocs allows you to securely share selected documentation with specified parties, such as 
                  insurance agents, estate planners, or family members. You can control exactly what information is 
                  shared and for how long, and you can revoke access at any time. This feature is particularly useful 
                  when filing insurance claims or during estate planning.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-13">
                <AccordionTrigger className="text-lg font-medium">What support options are available?</AccordionTrigger>
                <AccordionContent>
                  We offer comprehensive support including 24/7 chat support, email assistance, and phone support 
                  for premium subscribers. Our support team includes insurance documentation specialists who can 
                  help with claims preparation. We also provide extensive documentation, video tutorials, and 
                  webinars to help you get the most out of AssetDocs.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            
            <div className="mt-10 text-center">
              <p className="text-lg mb-4">Don't see your question answered? Chat with our AI assistant!</p>
              <Button 
                onClick={() => setShowChat(!showChat)} 
                className="bg-brand-blue hover:bg-brand-lightBlue"
              >
                {showChat ? 'Close Chat' : 'Open AI Chat Assistant'}
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
