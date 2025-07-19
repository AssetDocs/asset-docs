import React from 'react';
import SubscriptionPlan from '@/components/SubscriptionPlan';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const PricingPlans: React.FC = () => {
  const individualFeatures = {
    basic: [
      "1 property",
      "250GB secure cloud storage",
      "Photo and video uploads", 
      "Mobile app access",
      "Email support",
      "30-day free trial"
    ],
    standard: [
      "Up to 3 properties",
      "500GB secure cloud storage",
      "Photo and video uploads",
      "Mobile app access", 
      "Export detailed reports",
      "Priority email support",
      "Share with 2 trusted contacts",
      "30-day free trial"
    ],
    premium: [
      "Up to 10 properties",
      "2TB secure cloud storage",
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
      "30-day free trial"
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
                price="$8.99"
                description="Our most popular plan for comprehensive home documentation."
                features={[
                  ...individualFeatures.standard,
                  "🎉 6-month introductory price (reg. $12.99)"
                ]}
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
      </div>
    </section>
  );
};

export default PricingPlans;
