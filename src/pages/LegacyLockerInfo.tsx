import React from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Shield, Lock, Key, Users, Clock, Info } from 'lucide-react';
import legacyLockerLogo from '@/assets/legacy-locker-logo.png';

const LegacyLockerInfo = () => {
  return (
    <>
      <Helmet>
        <title>Legacy Locker Security & Features | Asset Safe</title>
        <meta name="description" content="Learn how Legacy Locker protects your sensitive information with encryption, two-factor authentication, and trusted contact controls." />
      </Helmet>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 pt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <img src={legacyLockerLogo} alt="Legacy Locker" className="w-16 h-16 mx-auto mb-4" loading="lazy" />
              <h1 className="text-4xl font-bold text-brand-blue mb-4">Legacy Locker</h1>
              <p className="text-xl text-gray-600">Your Secure Digital Vault</p>
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

              <AccordionItem value="two-factor" className="bg-white rounded-lg shadow-md border-none px-6">
                <AccordionTrigger className="text-lg font-semibold text-brand-blue hover:no-underline py-6">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-brand-teal" />
                    <span>Two-Factor Authentication (2FA)</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 pb-6">
                  <p className="mb-4">
                    Access to Legacy Locker requires two forms of verification, adding a critical layer of protection beyond your password.
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
