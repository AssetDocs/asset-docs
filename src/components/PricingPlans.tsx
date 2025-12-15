import React from 'react';
import SubscriptionPlan from '@/components/SubscriptionPlan';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const PricingPlans: React.FC = () => {
  const planDifferences = {
    standard: [
      "Up to 3 properties",
      "25GB secure cloud storage"
    ],
    premium: [
      "Unlimited properties",
      "100GB secure cloud storage"
    ]
  };

  const commonFeatures = [
    "Photo and video uploads",
    "Full web platform access",
    "Voice notes for item details",
    "Post damage documentation",
    "Export detailed reports",
    "Email support",
    "Share with 3 trusted contacts",
    "Legacy Locker"
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
              <SubscriptionPlan
                title="Standard (Homeowner Plan)"
                price="$12.99"
                description="Our most popular plan for comprehensive home documentation"
                features={planDifferences.standard}
                buttonText="Get Started"
              />
              <SubscriptionPlan
                title="Premium (Professional Plan)"
                price="$18.99"
                description="Best suited for estate managers, multiple-property owners, or businesses"
                features={planDifferences.premium}
                buttonText="Get Started"
              />
            </div>
            
            {/* Common Features */}
            <div className="mt-12 max-w-4xl mx-auto">
              <div className="bg-muted/30 rounded-lg p-8">
                <h3 className="text-xl font-semibold text-center mb-6">Included in Both Plans</h3>
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
