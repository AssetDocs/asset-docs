import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { Link } from 'react-router-dom';

const SubscriptionAgreement: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <SEOHead
        title="Subscription Agreement | Asset Safe"
        description="Read the Asset Safe Subscription Agreement covering billing, renewals, cancellations, data storage, and service terms."
        canonicalUrl="https://www.assetsafe.net/subscription-agreement"
      />
      <Navbar />
      <main className="flex-grow bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-lg shadow-md p-8 md:p-12">
            <h1 className="text-3xl md:text-4xl font-bold text-brand-blue mb-6">
              Asset Safe Subscription Agreement
            </h1>
            
            <div className="prose prose-lg max-w-none text-gray-700">
              <p className="text-lg mb-6">
                Welcome to Asset Safe.
              </p>
              
              <p className="mb-6">
                Asset Safe provides secure digital documentation and record-keeping tools designed to help you organize, store, and preserve important asset information.
              </p>
              
              <p className="mb-8">
                By creating an Asset Safe account or purchasing a subscription, you agree to the following terms, along with our{' '}
                <Link to="/terms" className="text-brand-blue hover:underline">Terms of Service</Link> and{' '}
                <Link to="/legal" className="text-brand-blue hover:underline">Privacy Policy</Link>, which are incorporated by reference.
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-brand-blue mb-4">1. Subscription Plans</h2>
                <p className="mb-4">
                  Asset Safe offers subscription plans with varying features, storage limits, and pricing. Details for each plan are available on our website at the time of signup.
                </p>
                <p>
                  Your subscription begins on the date payment is successfully processed and continues for the selected billing period unless canceled.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-brand-blue mb-4">2. Billing & Renewal</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Subscriptions automatically renew at the end of each billing period unless canceled before renewal.</li>
                  <li>You authorize Asset Safe to charge the applicable subscription fees to your selected payment method.</li>
                  <li>Pricing may change from time to time. If pricing changes apply to your plan, you will be notified in advance and given an opportunity to cancel.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-brand-blue mb-4">3. Cancellations & Access</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>You may cancel your subscription at any time through your account settings.</li>
                  <li>Access to paid features remains active until the end of your current billing period.</li>
                  <li>Refunds are not provided for unused portions of monthly subscription periods.</li>
                  <li>If payment fails or your subscription lapses, access to certain features may be limited until payment is resolved.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-brand-blue mb-4">4. Data Storage & Retention</h2>
                <p className="mb-4">
                  Asset Safe is designed to help you document and preserve information. You are responsible for maintaining your own copies of important records.
                </p>
                <p>
                  If your account remains inactive or unpaid for an extended period, data may be archived or removed in accordance with our{' '}
                  <Link to="/terms" className="text-brand-blue hover:underline">Terms of Service</Link>.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-brand-blue mb-4">5. No Legal, Financial, or Insurance Advice</h2>
                <p>
                  Asset Safe provides documentation and organizational tools only. We do not provide legal, financial, insurance, or tax advice, and Asset Safe does not verify or guarantee the accuracy or validity of user-submitted information.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-brand-blue mb-4">6. Updates to This Agreement</h2>
                <p>
                  We may update this Subscription Agreement from time to time. Continued use of Asset Safe after updates constitutes acceptance of the revised terms.
                </p>
              </section>

              <div className="mt-12 pt-8 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Last updated: January 2026
                </p>
                <div className="mt-4 flex flex-wrap gap-4">
                  <Link to="/terms" className="text-brand-blue hover:underline text-sm">
                    Terms of Service
                  </Link>
                  <Link to="/legal" className="text-brand-blue hover:underline text-sm">
                    Privacy Policy
                  </Link>
                  <Link to="/contact" className="text-brand-blue hover:underline text-sm">
                    Contact Us
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SubscriptionAgreement;
