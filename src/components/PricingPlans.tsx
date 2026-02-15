import React from 'react';
import SubscriptionPlan from '@/components/SubscriptionPlan';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Building2, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const PricingPlans: React.FC = () => {
  const planDifferences = {
    standard: [
      "Unlimited properties",
      "25GB secure cloud storage",
      "Guided home inventory system",
      "Secure Vault (owner-only access)",
      "Password Catalog (personal use)",
      "Claim-ready documentation exports",
      "Simple, ongoing protection for your home"
    ],
    premium: [
      "Unlimited properties",
      "100GB secure cloud storage",
      "⭐ Shared access with authorized users",
      "⭐ Legacy Locker (family continuity & instructions)",
      "⭐ Emergency Access Sharing",
      "⭐ Protection that extends beyond you"
    ]
  };

  const commonFeatures = [
    "Photo, video, and document uploads",
    "Room-by-room inventory organization",
    "Voice notes and item details",
    "Secure Vault & Password Catalog",
    "Claim-ready documentation exports (available anytime)",
    "Multi-factor authentication",
    "Full web platform access",
    "Post-damage documentation reports",
    "Manual Entries",
    "Upgrades & Repairs Record",
    "Paint Code Reference",
    "Source Websites",
    "Service Pros Directory"
  ];

  const premiumOnlyFeatures = [
    "🔒 Trusted Contacts (Premium Only)",
    "🔒 Emergency Access Sharing (Premium Only)",
    "🔒 Legacy Locker Mode (Premium Only)",
    "🔒 Executor / Family Continuity Tools (Premium Only)"
  ];

  const businessFeatures = {
    small: [
      "10GB secure cloud storage",
      "3 user accounts",
      "Photo uploads",
      "Document uploads",
      "Asset inventory tracking",
      "Web platform access for all users",
      "Export business-ready reports",
      "Priority email support"
    ],
    medium: [
      "50GB secure cloud storage",
      "25 user accounts",
      "Unlimited photo and video uploads",
      "Document uploads",
      "Full web platform access",
      "Custom reporting templates",
      "Priority email and phone support"
    ],
    enterprise: [
      "Unlimited secure cloud storage",
      "Unlimited user accounts",
      "Custom implementation",
      "Document uploads",
      "Dedicated account manager",
      "API access for custom integrations",
      "White-label platform option",
      "Custom reporting and analytics"
    ]
  };

  return (
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                  <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                    Basic Protection
                  </span>
                </div>
                <SubscriptionPlan
                  title="Standard (Homeowner Plan)"
                  price="$12.99"
                  description="For individuals documenting and protecting their home."
                  features={planDifferences.standard}
                  buttonText="Get Started"
                />
              </div>
              <div className="relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                  <span className="bg-amber-500 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                    <Star className="h-3 w-3" /> Most Popular for Families and Businesses
                  </span>
                </div>
                <SubscriptionPlan
                  title="Premium (Legacy & Business Protection)"
                  price="$18.99"
                  description="For families, business owners, and anyone who wants shared protection and continuity."
                  features={planDifferences.premium}
                  buttonText="Get Started"
                />
              </div>
            </div>
            
            {/* Common Features */}
            <div className="mt-12 max-w-4xl mx-auto">
              <div className="bg-muted/30 rounded-lg p-8">
                <h3 className="text-xl font-semibold text-center mb-4">Included in Both Plans</h3>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Billed monthly. No long-term contract. Cancel anytime.
                </p>
                <p className="text-sm text-muted-foreground text-center mb-6">
                  All plans include full access to your data and complete exports anytime.
                </p>
                <p className="text-sm font-medium text-center mb-6">
                  Everything you need to fully document and protect your home:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                  {commonFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <svg className="h-3 w-3 text-primary" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                          <path d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                      <span className="text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Premium-Only Features Indicator */}
            <div className="mt-8 max-w-4xl mx-auto">
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-center mb-4 text-amber-800 dark:text-amber-200">
                  Premium-Only Features
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                  {premiumOnlyFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-amber-700 dark:text-amber-300 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
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
                buttonText="Get Started"
              />
              <SubscriptionPlan
                title="Business Plus"
                price="$99.99"
                description="For growing businesses with extensive documentation requirements."
                features={businessFeatures.medium}
                recommended={true}
                buttonText="Get Started"
              />
              <SubscriptionPlan
                title="Enterprise"
                price="Custom"
                description="Tailored solutions for large businesses with complex needs."
                features={businessFeatures.enterprise}
                buttonText="Contact Sales"
              />
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Custom Package Note */}
        <div className="mt-16 text-center bg-muted/30 rounded-lg p-8">
          <Building2 className="h-12 w-12 text-primary mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-3">
            Need Something More?
          </h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Are you a large management company or industry leader needing to document more than 10 properties? 
            Or require more than 500GB of storage? We'd love to work with you to build a custom package 
            tailored to your specific needs.
          </p>
          <Button asChild size="lg">
            <Link to="/contact">Contact Us for Custom Solutions</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PricingPlans;
