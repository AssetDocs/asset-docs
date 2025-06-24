import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SubscriptionPlan from '@/components/SubscriptionPlan';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Pricing: React.FC = () => {
  const individualFeatures = {
    basic: [
      "5GB secure cloud storage",
      "Photo and video uploads",
      "Basic asset tagging",
      "Mobile app access",
      "Export basic reports",
      "Email support",
      "30-day free trial"
    ],
    standard: [
      "25GB secure cloud storage",
      "Photo and video uploads",
      "Mobile app access",
      "Export detailed reports",
      "Priority email support",
      "Share with 2 trusted contacts",
      "30-day free trial"
    ],
    premium: [
      "100GB secure cloud storage",
      "Unlimited photo and video uploads",
      "Professional asset tagging",
      "AI-powered item identification & valuation",
      "Floor plan scanning with live camera",
      "Mobile app access with premium features",
      "Export comprehensive reports",
      "Priority email and phone support",
      "Share with 5 trusted contacts",
      "30-day free trial"
    ]
  };

  const businessFeatures = {
    small: [
      "50GB secure cloud storage",
      "3 user accounts",
      "Photo and video uploads",
      "Asset tagging and inventory tracking",
      "Mobile app access for all users",
      "Export business-ready reports",
      "Priority email support",
      "30-day free trial"
    ],
    medium: [
      "250GB secure cloud storage",
      "25 user accounts",
      "Unlimited photo and video uploads",
      "AI-powered item identification & valuation",
      "Floor plan scanning with live camera",
      "Mobile app access with premium features",
      "Custom reporting templates",
      "Priority email and phone support",
      "Annual on-site documentation update",
      "30-day free trial"
    ],
    enterprise: [
      "Unlimited secure cloud storage",
      "Unlimited user accounts",
      "Custom implementation",
      "Dedicated account manager",
      "API access for custom integrations",
      "White-label mobile app option",
      "Custom reporting and analytics",
      "Quarterly on-site documentation updates",
      "30-day free trial"
    ]
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-brand-blue text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Choose the plan that fits your needs, with no hidden fees or long-term commitments.
          </p>
        </div>
      </section>
      
      {/* Pricing Tabs */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="individual" className="w-full">
            <div className="flex justify-center mb-8">
              <TabsList>
                <TabsTrigger value="individual">Individual & Family</TabsTrigger>
                <TabsTrigger value="business">Business</TabsTrigger>
              </TabsList>
            </div>
            
            {/* Individual Plans */}
            <TabsContent value="individual">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <SubscriptionPlan
                  title="Basic"
                  price="$9.99"
                  description="Perfect for individuals with basic documentation needs."
                  features={individualFeatures.basic}
                  buttonText="Start 30-Day Free Trial"
                />
                <SubscriptionPlan
                  title="Standard"
                  price="$14.99"
                  description="Our most popular plan for comprehensive home documentation."
                  features={individualFeatures.standard}
                  recommended={true}
                  buttonText="Start 30-Day Free Trial"
                />
                <SubscriptionPlan
                  title="Premium"
                  price="$29.99"
                  description="Complete protection with professional documentation services."
                  features={individualFeatures.premium}
                  buttonText="Start 30-Day Free Trial"
                />
              </div>
            </TabsContent>
            
            {/* Business Plans */}
            <TabsContent value="business">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <SubscriptionPlan
                  title="Small Business"
                  price="$49.99"
                  description="For small businesses with basic asset documentation needs."
                  features={businessFeatures.small}
                  buttonText="Start 30-Day Free Trial"
                />
                <SubscriptionPlan
                  title="Business Plus"
                  price="$99.99"
                  description="For growing businesses with extensive documentation requirements."
                  features={businessFeatures.medium}
                  recommended={true}
                  buttonText="Start 30-Day Free Trial"
                />
                <SubscriptionPlan
                  title="Enterprise"
                  price="Custom"
                  description="Tailored solutions for large businesses with complex needs."
                  features={businessFeatures.enterprise}
                  buttonText="Start 30-Day Free Trial"
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
      
      {/* FAQs */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="section-title">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-3">Can I cancel my subscription at any time?</h3>
              <p className="text-gray-600">
                Yes, you can cancel your subscription at any time. Your documentation will remain accessible until the end of your billing period.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-3">Is there a free trial available?</h3>
              <p className="text-gray-600">
                Yes, we offer a 30-day free trial for all individual, family, and business plans. No credit card required to start.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-3">How secure is my data?</h3>
              <p className="text-gray-600">
                Your data is protected with enterprise-grade encryption both in transit and at rest. We use multi-factor authentication and regular security audits to ensure your information remains secure.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-3">Can I upgrade or downgrade my plan?</h3>
              <p className="text-gray-600">
                Yes, you can change your plan at any time. When upgrading, you'll have immediate access to new features. When downgrading, changes take effect at the end of your billing cycle.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-3">What happens to my data if I cancel?</h3>
              <p className="text-gray-600">
                After cancellation, your data remains stored for 30 days, during which you can reactivate your account or request a data export. After 30 days, your data is permanently deleted.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-3">Do you offer on-site documentation services?</h3>
              <p className="text-gray-600">
                Yes, our Premium and Enterprise plans include on-site documentation services. For other plans, on-site services can be added for an additional fee.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Contact CTA */}
      <section className="py-16 bg-brand-green text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Need a Custom Solution?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Our team can create a tailored plan specific to your unique documentation needs.
          </p>
          <a href="/contact" className="bg-white text-brand-green hover:bg-gray-100 px-6 py-3 rounded-md font-medium inline-block">
            Contact Our Team
          </a>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Pricing;
