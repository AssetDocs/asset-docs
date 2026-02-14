import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Shield, Lock, Key, Users, Clock, Info, ChevronDown } from 'lucide-react';
import legacyLockerLogo from '@/assets/legacy-locker-logo.png';
import { breadcrumbSchema, faqSchema } from '@/utils/structuredData';
import { cn } from '@/lib/utils';

interface ExpandableBoxProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const ExpandableBox: React.FC<ExpandableBoxProps> = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
      >
        <h3 className="text-2xl font-semibold text-brand-blue">{title}</h3>
        <ChevronDown className={cn("h-6 w-6 text-brand-blue transition-transform", isOpen && "rotate-180")} />
      </button>
      <div className={cn("px-8 pb-8 transition-all", isOpen ? "block" : "hidden")}>
        {children}
      </div>
    </div>
  );
};

const LegacyLockerInfo = () => {
  const legacyFaqs = [
    { question: "What is encrypted storage?", answer: "All credentials are encrypted at rest and in transit, meaning your data is protected whether it's being stored or accessed. Asset Safe cannot view or use your stored passwords." },
    { question: "What is Multi-Factor Authentication (MFA)?", answer: "Access to Legacy Locker requires multiple forms of verification—such as a TOTP authenticator app or backup recovery codes—adding critical layers of protection beyond your password." },
    { question: "What are Trusted Contact Controls?", answer: "You decide who can access your information and what they can see. Grant access to specific categories, update or revoke permissions at any time." },
    { question: "Is Legacy Locker a legal will?", answer: "Legacy Locker is a secure information vault, not a legal authorization tool. It does not replace a will, trust, or estate plan—but it complements them by handling the practical access details legal documents typically can't include." }
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      faqSchema(legacyFaqs),
      breadcrumbSchema([
        { name: 'Home', url: 'https://www.getassetsafe.com/' },
        { name: 'Legacy Locker', url: 'https://www.getassetsafe.com/legacy-locker' }
      ])
    ]
  };

  return (
    <>
      <SEOHead
        title="Legacy Locker - Secure Digital Vault for Estate Planning"
        description="Legacy Locker provides encrypted storage for passwords, accounts, and important documents your loved ones will need. Multi-factor authentication, trusted contact controls, and purpose-driven access."
        keywords="legacy locker, digital estate vault, password storage, estate planning vault, secure digital vault, trusted contacts, encrypted storage, digital legacy"
        canonicalUrl="https://www.getassetsafe.com/legacy-locker"
        structuredData={structuredData}
      />
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 pt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <img src={legacyLockerLogo} alt="Legacy Locker" className="w-16 h-16 mx-auto mb-4" loading="lazy" />
              <h1 className="text-4xl font-bold text-brand-blue mb-4">Legacy Locker</h1>
              <p className="text-xl text-gray-600">Your Secure Digital Vault</p>
            </div>

            {/* What It Is / What It's Not / Why It Matters - Moved from homepage */}
            <div className="flex flex-col gap-4 mb-8">
              <ExpandableBox title="What It Is" defaultOpen={true}>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Legacy Locker is a secure, encrypted digital vault inside Asset Safe designed to store the most important information your loved ones may need—photos, videos, account usernames, saved passwords, property details, personal notes, and clear instructions that explain your wishes.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  It provides a centralized, organized place for critical information that is often scattered, forgotten, or inaccessible when it's needed most.
                </p>
              </ExpandableBox>

              <ExpandableBox title="What It's Not">
                <p className="text-gray-700 leading-relaxed mb-4">
                  Legacy Locker is not a legally recognized will or electronic will. It does not replace formal estate-planning documents, notarized paperwork, or guidance from an attorney.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Instead, it acts as a secure companion resource, helping ensure the practical, day-to-day details that legal documents often exclude are preserved and accessible.
                </p>
              </ExpandableBox>

              <ExpandableBox title="Why It Matters">
                <p className="text-gray-700 leading-relaxed mb-4">
                  Legacy Locker offers peace of mind by ensuring your family or trusted contacts can securely access essential information about your home, assets, digital accounts, and online services when you choose to grant access.
                </p>
                <ul className="text-gray-700 leading-relaxed space-y-2 list-disc list-inside">
                  <li>Reduce confusion during emergencies or transitions</li>
                  <li>Eliminate time-consuming account recovery processes</li>
                  <li>Prevent lost or inaccessible digital assets</li>
                  <li>Preserve the context, meaning, and instructions behind your belongings</li>
                </ul>
              </ExpandableBox>
            </div>

            {/* CTA Section */}
            <div className="bg-brand-blue text-white p-8 rounded-lg text-center mb-8">
              <h2 className="text-2xl font-bold mb-4">Start Protecting Your Legacy Today</h2>
              <p className="text-lg mb-6 max-w-2xl mx-auto">
                Join homeowners and families who are preparing for the unexpected.
              </p>
              <Button asChild size="lg" className="bg-white text-brand-blue hover:bg-gray-100">
                <Link to="/pricing">Get Started Today</Link>
              </Button>
            </div>

            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="encrypted-storage" className="bg-white rounded-lg shadow-md border-none px-6">
                <AccordionTrigger className="text-lg font-semibold text-brand-blue hover:no-underline py-6">
                  <div className="flex items-center gap-3">
                    <Lock className="h-5 w-5 text-brand-teal" />
                    <span>Encrypted Storage</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 pb-6">
                  <p className="mb-4">
                    All credentials are encrypted at rest and in transit, meaning your data is protected whether it's being stored or accessed. Asset Safe cannot view or use your stored passwords.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="mfa" className="bg-white rounded-lg shadow-md border-none px-6">
                <AccordionTrigger className="text-lg font-semibold text-brand-blue hover:no-underline py-6">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-brand-teal" />
                    <span>Multi-Factor Authentication (MFA)</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 pb-6">
                  <p className="mb-4">
                    Access to Legacy Locker requires multiple forms of verification—using a TOTP authenticator app or one-time backup recovery codes—adding critical layers of protection beyond your password.
                  </p>
                  <p>
                    This helps prevent unauthorized access—even if login credentials are compromised.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="totp" className="bg-white rounded-lg shadow-md border-none px-6">
                <AccordionTrigger className="text-lg font-semibold text-brand-blue hover:no-underline py-6">
                  <div className="flex items-center gap-3">
                    <Key className="h-5 w-5 text-brand-teal" />
                    <span>Time-Based One-Time Passwords (TOTP)</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 pb-6">
                  <p className="mb-4">
                    For sensitive actions—such as viewing saved passwords, updating access permissions, or managing trusted contacts—Legacy Locker uses TOTP authentication.
                  </p>
                  <p>
                    TOTP generates a temporary, time-limited code from an authenticator app, providing stronger security than SMS alone.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="trusted-contacts" className="bg-white rounded-lg shadow-md border-none px-6">
                <AccordionTrigger className="text-lg font-semibold text-brand-blue hover:no-underline py-6">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-brand-teal" />
                    <span>Trusted Contact Controls</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 pb-6">
                  <p className="mb-4">You decide who can access your information and what they can see.</p>
                  <ul className="list-disc ml-6 space-y-2">
                    <li>Grant access to specific categories (accounts, notes, documents)</li>
                    <li>Update or revoke permissions at any time</li>
                    <li>Keep sensitive credentials hidden unless access is intentionally allowed</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="purpose-driven" className="bg-white rounded-lg shadow-md border-none px-6">
                <AccordionTrigger className="text-lg font-semibold text-brand-blue hover:no-underline py-6">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-brand-teal" />
                    <span>Purpose-Driven Access</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 pb-6">
                  <p className="mb-4">
                    Legacy Locker is designed for real-world scenarios, including emergencies, incapacity, or life transitions.
                  </p>
                  <p>
                    Rather than leaving loved ones locked out of critical accounts, you provide clear, secure access—on your terms.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="why-matters" className="bg-white rounded-lg shadow-md border-none px-6">
                <AccordionTrigger className="text-lg font-semibold text-brand-blue hover:no-underline py-6">
                  <div className="flex items-center gap-3">
                    <Info className="h-5 w-5 text-brand-teal" />
                    <span>Why This Matters</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 pb-6">
                  <p>
                    In difficult moments, recovering passwords and digital access can be stressful, time-consuming, or impossible. Legacy Locker eliminates guesswork by giving your trusted contacts a secure, intentional path to the information you've chosen to share—without compromising your privacy while you're active.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="important-note" className="bg-white rounded-lg shadow-md border-none px-6">
                <AccordionTrigger className="text-lg font-semibold text-brand-blue hover:no-underline py-6">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-brand-teal" />
                    <span>Important Note</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 pb-6">
                  <p className="mb-4">
                    Legacy Locker is a secure information vault, not a legal authorization tool. It does not replace a will, trust, or estate plan—but it complements them by handling the practical access details legal documents typically can't include.
                  </p>
                  <ul className="list-disc ml-6 space-y-2 mb-4">
                    <li>Reduce confusion during emergencies or transitions</li>
                    <li>Eliminate time-consuming account recovery processes</li>
                    <li>Prevent lost or inaccessible digital assets</li>
                    <li>Preserve the context, meaning, and instructions behind your belongings</li>
                  </ul>
                  <p className="font-medium text-brand-blue">
                    In moments when clarity matters most, Legacy Locker ensures nothing important is left behind.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default LegacyLockerInfo;
