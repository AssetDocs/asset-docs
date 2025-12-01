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
            Find answers to common questions about Asset Safe or chat with our AI assistant for specific inquiries.
          </p>
          
          <div className="mb-10">
            <Accordion type="single" collapsible className="mb-8">
              
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-lg font-medium">How secure is my property documentation?</AccordionTrigger>
                <AccordionContent>
                  Asset Safe uses enterprise-grade encryption and secure cloud storage to protect your valuable 
                  documentation. All data is encrypted both in transit and at rest, and we implement strict access 
                  controls to ensure your information remains private and secure at all times. Our security protocols 
                  are regularly audited and updated to maintain the highest standards of data protection.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2">
                <AccordionTrigger className="text-lg font-medium">Can I use Asset Safe for inventory management or business operations?</AccordionTrigger>
                <AccordionContent>
                  No, Asset Safe is specifically designed for property documentation and insurance protection, not 
                  inventory management or business operations. Our platform focuses on helping property owners 
                  create comprehensive documentation of their personal assets for insurance claims, estate planning, 
                  and financial records. For business inventory management, we recommend using dedicated inventory 
                  management software that is designed for tracking business assets and operations.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3">
                <AccordionTrigger className="text-lg font-medium">Can I use Asset Safe for insurance claims?</AccordionTrigger>
                <AccordionContent>
                  Yes! Asset Safe is specifically designed to help with insurance claims. Our third-party verification 
                  process creates legally valid documentation of your assets that can expedite claims processing. 
                  You can generate detailed reports that include proof of ownership, condition documentation, and 
                  value assessments that most insurance companies accept as valid evidence during claims.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-4">
                <AccordionTrigger className="text-lg font-medium">Is my data backed up and what happens if I cancel?</AccordionTrigger>
                <AccordionContent>
                  Yes, all your data is automatically backed up across multiple secure data centers with 99.9% uptime. 
                  If you cancel your subscription, you'll have until the end of your billing cycle to download all your documentation and data.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-5">
                <AccordionTrigger className="text-lg font-medium">How does receipt integration work?</AccordionTrigger>
                <AccordionContent>
                  When you upload photos of your possessions, you can also upload associated receipts. Our system 
                  will automatically match receipts with the correct items in your inventory, creating a comprehensive 
                  record that includes both visual documentation and proof of purchase.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-6">
                <AccordionTrigger className="text-lg font-medium">What types of assets can I document?</AccordionTrigger>
                <AccordionContent>
                  Asset Safe supports documentation of virtually any physical asset, including electronics, furniture, 
                  artwork, jewelry, collectibles, appliances, vehicles, and real estate.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-7">
                <AccordionTrigger className="text-lg font-medium">How do I get started with Asset Safe?</AccordionTrigger>
                <AccordionContent>
                  Getting started is easy! Sign up for a free 30-day trial and start using our web platform. 
                  You can begin documenting your possessions right away by taking photos, videos, and uploading documents.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-8">
                <AccordionTrigger className="text-lg font-medium">Can I share my documentation with others?</AccordionTrigger>
                <AccordionContent>
                  Yes, Asset Safe allows you to securely share selected documentation with specified parties, such as 
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
                  to help you get the most out of Asset Safe.
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
                    Storage needs vary based on file types and usage. Here&apos;s a quick reference for our plans:
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
              
              {/* Legacy Locker Section */}
              <AccordionItem value="item-16">
                <AccordionTrigger className="text-lg font-medium">What is the Legacy Locker?</AccordionTrigger>
                <AccordionContent>
                  The Legacy Locker is a secure, private vault inside Asset Safe where you can organize important personal information for loved ones—photos, videos, notes, access details, and other clarifying documents. It is designed to provide context and guidance alongside your official estate plans.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-17">
                <AccordionTrigger className="text-lg font-medium">Is the Legacy Locker a legal will?</AccordionTrigger>
                <AccordionContent>
                  No. The Legacy Locker is not a legally recognized will or e-will. Instead, it acts as supporting evidence—helping your executor, family, and trusted contacts better understand your wishes with added detail and documentation.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-18">
                <AccordionTrigger className="text-lg font-medium">What kind of information can I store in the Legacy Locker?</AccordionTrigger>
                <AccordionContent>
                  You can store personal messages, executor and guardian details, asset notes, property information, wish statements, financial account summaries, passwords, voice notes, photos, videos, and uploaded documents. Anything that helps tell the story behind your intentions belongs here.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-19">
                <AccordionTrigger className="text-lg font-medium">Why is the Legacy Locker valuable?</AccordionTrigger>
                <AccordionContent>
                  <p className="mb-2">Wills state what you want — your Legacy Locker shows why and how.</p>
                  <p>It removes guesswork, reduces stress on your family, and provides an organized record of your wishes with real-life documentation to support your estate plans.</p>
                </AccordionContent>
              </AccordionItem>
              
              {/* Contributors Section */}
              <AccordionItem value="item-20">
                <AccordionTrigger className="text-lg font-medium">Who can I add as a contributor?</AccordionTrigger>
                <AccordionContent>
                  You can invite trusted individuals—family members, friends, financial professionals, or advisors—to collaborate on your Asset Safe account. You control exactly what each contributor can see or update.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-21">
                <AccordionTrigger className="text-lg font-medium">What are the access levels?</AccordionTrigger>
                <AccordionContent>
                  <p className="mb-3">Asset Safe offers tiered access options, including:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>View Only</strong> – Contributor can see selected items but cannot edit anything.</li>
                    <li><strong>Edit Access</strong> – Contributor can add, update, or organize information you allow them to manage.</li>
                    <li><strong>Administrator Access</strong> – Full access to all features and settings, including the ability to manage other contributors.</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-22">
                <AccordionTrigger className="text-lg font-medium">Can contributors see my Legacy Locker?</AccordionTrigger>
                <AccordionContent>
                  Only if you authorize it. Your Legacy Locker is private by default, and you can choose whether contributors have full access, partial access, or no access at all.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-23">
                <AccordionTrigger className="text-lg font-medium">Can I revoke access at any time?</AccordionTrigger>
                <AccordionContent>
                  Yes. You can instantly remove or adjust a contributor&apos;s permissions from your dashboard with one click.
                </AccordionContent>
              </AccordionItem>
              
              {/* Password & Accounts Catalog Section */}
              <AccordionItem value="item-24">
                <AccordionTrigger className="text-lg font-medium">What is the Password and Accounts Catalog?</AccordionTrigger>
                <AccordionContent>
                  It&apos;s a secure, encrypted list where you can document login credentials, account numbers, PINs, digital subscriptions, financial accounts, and other access information your loved ones may need in the event of an emergency.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-25">
                <AccordionTrigger className="text-lg font-medium">Is my password information encrypted?</AccordionTrigger>
                <AccordionContent>
                  Yes. Everything in the Password and Accounts Catalog is encrypted at rest and in transit. Only you—and anyone you explicitly grant access—can view this information.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-26">
                <AccordionTrigger className="text-lg font-medium">Why should I store my passwords here instead of on paper or in a notes app?</AccordionTrigger>
                <AccordionContent>
                  <p className="mb-2">Paper gets lost. Notes apps aren&apos;t secure.</p>
                  <p>Asset Safe gives you one organized, encrypted place to store digital access information to protect your family from getting locked out of essential accounts.</p>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-27">
                <AccordionTrigger className="text-lg font-medium">Can contributors access my password list?</AccordionTrigger>
                <AccordionContent>
                  Only if you manually enable it. You decide who can view, edit, or be restricted from this section entirely.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-28">
                <AccordionTrigger className="text-lg font-medium">What types of accounts can I store?</AccordionTrigger>
                <AccordionContent>
                  <p className="mb-3">Anything you want loved ones or an executor to find easily:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Banking & investment accounts</li>
                    <li>Mortgage & insurance logins</li>
                    <li>Email & social accounts</li>
                    <li>Utilities & subscriptions</li>
                    <li>Medical portals</li>
                    <li>Cloud storage and photo accounts</li>
                  </ul>
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
