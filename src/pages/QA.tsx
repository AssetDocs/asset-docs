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
            Find answers to common questions about Asset Docs or chat with our AI assistant for specific inquiries.
          </p>
          
          <div className="mb-10">
            <Accordion type="single" collapsible className="mb-8">
              
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-lg font-medium">How secure is my property documentation?</AccordionTrigger>
                <AccordionContent>
                  Asset Docs uses enterprise-grade encryption and secure cloud storage to protect your valuable 
                  documentation. All data is encrypted both in transit and at rest, and we implement strict access 
                  controls to ensure your information remains private and secure at all times. Our security protocols 
                  are regularly audited and updated to maintain the highest standards of data protection.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2">
                <AccordionTrigger className="text-lg font-medium">Can I use Asset Docs for inventory management or business operations?</AccordionTrigger>
                <AccordionContent>
                  No, Asset Docs is specifically designed for property documentation and insurance protection, not 
                  inventory management or business operations. Our platform focuses on helping property owners 
                  create comprehensive documentation of their personal assets for insurance claims, estate planning, 
                  and financial records. For business inventory management, we recommend using dedicated inventory 
                  management software that is designed for tracking business assets and operations.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3">
                <AccordionTrigger className="text-lg font-medium">Can I use Asset Docs for insurance claims?</AccordionTrigger>
                <AccordionContent>
                  Yes! Asset Docs is specifically designed to help with insurance claims. Our third-party verification 
                  process creates legally valid documentation of your assets that can expedite claims processing. 
                  You can generate detailed reports that include proof of ownership, condition documentation, and 
                  value assessments that most insurance companies accept as valid evidence during claims.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-4">
                <AccordionTrigger className="text-lg font-medium">Is my data backed up and what happens if I cancel?</AccordionTrigger>
                <AccordionContent>
                  Yes, all your data is automatically backed up across multiple secure data centers with 99.9% uptime. 
                  If you cancel your subscription, you'll have 90 days to download all your documentation and data.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-5">
                <AccordionTrigger className="text-lg font-medium">How does receipt integration work?</AccordionTrigger>
                <AccordionContent>
                  When you upload photos of your possessions, you can also upload associated receipts. Our system 
                  will automatically match receipts with the correct items in your inventory. The system recognizes 
                  product information from receipts and links them to corresponding items, creating a comprehensive 
                  record that includes both visual documentation and proof of purchase.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-6">
                <AccordionTrigger className="text-lg font-medium">What types of assets can I document?</AccordionTrigger>
                <AccordionContent>
                  Asset Docs supports documentation of virtually any physical asset, including electronics, furniture, 
                  artwork, jewelry, collectibles, appliances, vehicles, and real estate.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-7">
                <AccordionTrigger className="text-lg font-medium">How do I get started with Asset Docs?</AccordionTrigger>
                <AccordionContent>
                  Getting started is easy! Sign up for a free 30-day trial and start using our web platform. 
                  You can begin documenting your possessions right away by taking photos or videos. For more 
                  comprehensive documentation, you can request our professional documentation service for high-value assets.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-8">
                <AccordionTrigger className="text-lg font-medium">Can I share my documentation with others?</AccordionTrigger>
                <AccordionContent>
                  Yes, Asset Docs allows you to securely share selected documentation with specified parties, such as 
                  insurance agents, estate planners, or family members. You can control exactly what information is 
                  shared and for how long, and you can revoke access at any time. This feature is particularly useful 
                  when filing insurance claims or during estate planning.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-9">
                <AccordionTrigger className="text-lg font-medium">If I have a drawer or shelf full of tools, kitchen goods, movies, etc. Do I need a photo of every item?</AccordionTrigger>
                <AccordionContent>
                  Apart from higher-priced or specialty items, it is not always necessary to document every individual item. 
                  For instance, a kitchen drawer full of forks and knives, a shelf of DVDs or CDs, or a shelf of garage 
                  tools and equipment, you'll likely only need a wide-angle photo showing the collection. You can then 
                  manually enter the estimated value of the items shown as a whole, making the documentation process 
                  more efficient while still maintaining adequate records for insurance purposes.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-10">
                <AccordionTrigger className="text-lg font-medium">What support options are available?</AccordionTrigger>
                <AccordionContent>
                  We offer comprehensive support including a 24/7 chat feature and email assistance. We also 
                  provide video tutorials and resource information under the References section in the footer, 
                  to help you get the most out of Asset Docs.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-11">
                <AccordionTrigger className="text-lg font-medium">Can I cancel my subscription at any time?</AccordionTrigger>
                <AccordionContent>
                  Yes, you can cancel your subscription at any time. Your documentation will remain accessible until the end of your billing period.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-12">
                <AccordionTrigger className="text-lg font-medium">Is there a free trial available?</AccordionTrigger>
                <AccordionContent>
                  Yes, we offer a 30-day free trial for both Standard and Premium plans.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-13">
                <AccordionTrigger className="text-lg font-medium">What is included in my 30-day free trial?</AccordionTrigger>
                <AccordionContent>
                  Your 30-day free trial includes full access to all features with no limitations:
                  <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
                    <li>Photo and video uploads</li>
                    <li>Full web platform access</li>
                    <li>Voice notes for item details</li>
                    <li>Post damage documentation</li>
                    <li>Export detailed reports</li>
                    <li>Email support</li>
                    <li>Share with 3 trusted contacts</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-14">
                <AccordionTrigger className="text-lg font-medium">Can I upgrade or downgrade my plan?</AccordionTrigger>
                <AccordionContent>
                  Yes, you can change your plan at any time. When upgrading, you'll have immediate access to new features. When downgrading, changes take effect at the end of your billing cycle.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-15">
                <AccordionTrigger className="text-lg font-medium">How much storage do I need?</AccordionTrigger>
                <AccordionContent>
                  <p className="mb-4">
                    Storage needs vary based on file types and usage. Here's a quick reference for our plans:
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Storage</th>
                          <th className="text-left py-2">Photos (3MB)</th>
                          <th className="text-left py-2">1080p Video</th>
                          <th className="text-left py-2">4K Video</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-600">
                        <tr className="border-b">
                          <td className="py-2 font-medium">25GB</td>
                          <td className="py-2">~8,300</td>
                          <td className="py-2">~0.42 hours (25 min)</td>
                          <td className="py-2">~6.5 minutes</td>
                        </tr>
                        <tr>
                          <td className="py-2 font-medium">100GB</td>
                          <td className="py-2">~33,300</td>
                          <td className="py-2">~1.67 hours (100 min)</td>
                          <td className="py-2">~26 minutes</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            
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
