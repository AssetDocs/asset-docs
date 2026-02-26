import React from 'react';
import SubscriptionPlan from '@/components/SubscriptionPlan';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Building2, CheckIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

const PricingPlans: React.FC = () => {
  const assetSafeFeatures = [
    "Unlimited properties",
    "25GB secure cloud storage (+ add-ons available)",
    "Photo, video & document uploads",
    "Room-by-room inventory organization",
    "Secure Vault & Password Catalog",
    "Legacy Locker (family continuity & instructions)",
    "Authorized Users",
    "Emergency Access Sharing",
    "Voice notes, damage reports, exports",
    "Memory Safe & Quick Notes",
    "MFA, full web platform access",
    "Service Pros Directory"
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
          
          {/* Individual Plan */}
          <TabsContent value="individual">
            <div className="max-w-lg mx-auto">
              <SubscriptionPlan
                title="Asset Safe Plan"
                price="$12.99"
                description="One simple plan. Everything included."
                features={assetSafeFeatures}
                buttonText="Get Started"
                recommended={true}
              />
            </div>

            {/* What's Included */}
            <div className="mt-12 max-w-4xl mx-auto">
              <div className="bg-muted/30 rounded-lg p-8">
                <h3 className="text-xl font-semibold text-center mb-4">What's Included</h3>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Billed monthly or yearly. No long-term contract. Cancel anytime.
                </p>
                <p className="text-xs text-muted-foreground text-center mb-2">
                  Paid subscriptions are currently available to U.S. billing addresses only.
                </p>
                <p className="text-sm text-muted-foreground text-center mb-6">
                  Full access to your data and complete exports anytime.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                  {assetSafeFeatures.map((feature, index) => (
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

            {/* Storage Add-on */}
            <div className="mt-8 max-w-2xl mx-auto">
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-6">
                <p className="text-lg font-semibold text-foreground mb-1 text-center">
                  Your life evolves — your storage can too
                </p>
                <p className="text-sm text-muted-foreground text-center mb-3">Add storage anytime as your assets grow.</p>
                <div className="bg-background/80 rounded-lg px-4 py-2 text-center mb-3">
                  <span className="font-bold">+25GB</span> for <span className="text-brand-orange font-bold">$4.99 / month</span>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1 max-w-xs mx-auto">
                  <li className="flex items-center gap-2">
                    <CheckIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
                    Add multiple increments as needed
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
                    Adjust storage anytime
                  </li>
                </ul>
              </div>
            </div>

            {/* Why one plan? */}
            <div className="mt-12 max-w-2xl mx-auto text-center">
              <h3 className="text-xl font-semibold mb-4">Why one plan?</h3>
              <p className="text-muted-foreground mb-4">
                Most services make you choose between "good" and "better." We don't think that makes sense when it comes to protecting what matters most.
              </p>
              <p className="text-muted-foreground mb-4">
                Asset Safe is built as a complete system, not a set of gated features. That's why there's only one plan — everything included — with flexible storage you can adjust anytime as your needs evolve.
              </p>
              <p className="text-muted-foreground font-medium">
                Simple. Transparent. Built for the long term.
              </p>
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
