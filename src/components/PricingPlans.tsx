import React from 'react';
import SubscriptionPlan from '@/components/SubscriptionPlan';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const PricingPlans: React.FC = () => {
  const individualFeatures = {
    basic: [
      "30-day free trial",
      "1 property",
      "50GB secure cloud storage",
      "Photo uploads",
      "Document uploads", 
      "Mobile app access",
      "Email support"
    ],
    standard: [
      "30-day free trial",
      "Up to 5 properties",
      "200GB secure cloud storage",
      "Photo and video uploads",
      "Document uploads",
      "AI-powered item identification & valuation",
      "Floor plan scanning with live camera",
      "Mobile app access", 
      "Export detailed reports",
      "Priority email support",
      "Share with 2 trusted contacts"
    ],
    premium: [
      "30-day free trial",
      "Up to 20 properties",
      "750GB secure cloud storage",
      "Photo and video uploads",
      "Document uploads",
      "AI-powered item identification & valuation",
      "Floor plan scanning with live camera",
      "Mobile app access with premium features",
      "Export comprehensive reports",
      "Priority email and phone support",
      "Share with 5 trusted contacts"
    ]
  };

  const businessFeatures = {
    small: [
      "30-day free trial",
      "50GB secure cloud storage",
      "3 user accounts",
      "Photo uploads",
      "Document uploads",
      "Asset tagging and inventory tracking",
      "Mobile app access for all users",
      "Export business-ready reports",
      "Priority email support"
    ],
    medium: [
      "30-day free trial",
      "200GB secure cloud storage",
      "25 user accounts",
      "Unlimited photo and video uploads",
      "Document uploads",
      "AI-powered item identification & valuation",
      "Floor plan scanning with live camera",
      "Mobile app access with premium features",
      "Custom reporting templates",
      "Priority email and phone support"
    ],
    enterprise: [
      "30-day free trial",
      "Unlimited secure cloud storage",
      "Unlimited user accounts",
      "Custom implementation",
      "Document uploads",
      "Dedicated account manager",
      "API access for custom integrations",
      "White-label mobile app option",
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <SubscriptionPlan
                title="Basic"
                price="$8.99"
                description="Perfect for individuals with basic documentation needs."
                features={individualFeatures.basic}
                buttonText="Start 30-Day Free Trial"
              />
              <SubscriptionPlan
                title="Standard"
                price="$12.99"
                description="Our most popular plan for comprehensive home documentation."
                features={individualFeatures.standard}
                recommended={true}
                buttonText="Start 30-Day Free Trial"
              />
              <SubscriptionPlan
                title="Premium"
                price="$18.99"
                description="Complete protection with professional documentation tools."
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
        
        {/* Custom Package Note */}
        <div className="mt-16 text-center bg-muted/30 rounded-lg p-8">
          <Building2 className="h-12 w-12 text-primary mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-3">
            Need Something More?
          </h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Are you a large management company or industry leader needing to document more than 10 properties? 
            Or require more than 750GB of storage? We'd love to work with you to build a custom package 
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
