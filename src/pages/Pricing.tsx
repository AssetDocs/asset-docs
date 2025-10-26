
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PricingHero from '@/components/PricingHero';
import PricingFAQ from '@/components/PricingFAQ';
import PricingContactCTA from '@/components/PricingContactCTA';
import SubscriptionPlan from '@/components/SubscriptionPlan';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { CheckIcon, Zap, Shield, Star } from 'lucide-react';

const Pricing: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subscriptionStatus, setSubscriptionStatus] = useState<{
    subscribed: boolean;
    subscription_tier?: string;
    subscription_end?: string;
  }>({ subscribed: false });
  const [isLoading, setIsLoading] = useState(false);

  const checkSubscription = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      if (error) throw error;
      setSubscriptionStatus(data);
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  useEffect(() => {
    if (user) {
      checkSubscription();
    }
  }, [user]);

  const handleSubscribe = (planType: string) => {
    // Navigate to signup page for contact information
    window.location.href = `/signup?plan=${planType}`;
  };

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
    "30-day free trial",
    "Photo and video uploads",
    "Full web platform access",
    "Voice notes for item details",
    "Post damage documentation",
    "Export detailed reports",
    "Email support",
    "Share with 3 trusted contacts"
  ];

  const plans = [
    {
      title: "Standard (Homeowner Plan)",
      price: "$12.99",
      description: "Our most popular plan for comprehensive home documentation",
      features: planDifferences.standard,
      planType: "standard",
      icon: <Zap className="h-6 w-6" />
    },
    {
      title: "Premium (Professional Plan)",
      price: "$18.99",
      description: "Best suited for estate managers, multiple-property owners, or businesses",
      features: planDifferences.premium,
      planType: "premium",
      icon: <Star className="h-6 w-6" />
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <PricingHero />
      
      {/* Subscription Plans Section */}
      <section className="py-16 bg-secondary/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-4">
              Select the perfect plan for your property management needs
            </p>
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-primary font-semibold">🎉 Start with a 30-day free trial</p>
              <p className="text-sm text-muted-foreground">No long-term contract. Cancel anytime</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {plans.map((plan) => (
              <div key={plan.title} className="relative">
                {subscriptionStatus.subscribed && subscriptionStatus.subscription_tier === plan.title && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Current Plan
                  </div>
                )}
                <SubscriptionPlan
                  title={plan.title}
                  price={plan.price}
                  description={plan.description}
                  features={plan.features}
                  buttonText={
                    subscriptionStatus.subscribed && subscriptionStatus.subscription_tier === plan.title 
                      ? "Current Plan" 
                      : isLoading ? "Processing..." : "Get Started"
                  }
                  onClick={() => handleSubscribe(plan.planType)}
                />
              </div>
            ))}
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

          {user && subscriptionStatus.subscribed && (
            <div className="text-center mt-8">
              <p className="text-muted-foreground mb-4">
                Current subscription expires: {subscriptionStatus.subscription_end ? new Date(subscriptionStatus.subscription_end).toLocaleDateString() : 'N/A'}
              </p>
              <Button 
                variant="outline" 
                onClick={async () => {
                  try {
                    const { data, error } = await supabase.functions.invoke('customer-portal');
                    if (error) throw error;
                    window.open(data.url, '_blank');
                  } catch (error) {
                    toast({
                      title: "Error",
                      description: "Failed to open customer portal. Please try again.",
                      variant: "destructive",
                    });
                  }
                }}
              >
                Manage Subscription
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Gift Subscriptions Section */}
      <section className="py-16 bg-gradient-to-b from-secondary/5 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full">
                <span className="text-3xl">🎁</span>
              </div>
            </div>
            <h2 className="text-3xl font-bold mb-4">Give the Gift of Protection and Peace of Mind</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Help your loved ones protect their most valuable assets with Asset Docs. 
              A thoughtful gift that provides lasting security and organization for their properties and belongings.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <SubscriptionPlan
              title="Standard (Homeowner Plan)"
              price="$155.88/year"
              description="Our most popular plan for comprehensive home documentation"
              features={[
                "Up to 3 properties",
                "25GB secure cloud storage"
              ]}
              buttonText="Gift This Plan"
              onClick={() => window.location.href = '/gift-checkout?plan=standard'}
            />
            <SubscriptionPlan
              title="Premium (Professional Plan)"
              price="$227.88/year"
              description="Best suited for estate managers, multiple-property owners, or businesses"
              features={[
                "Unlimited properties",
                "100GB secure cloud storage"
              ]}
              buttonText="Gift This Plan"
              onClick={() => window.location.href = '/gift-checkout?plan=premium'}
            />
          </div>

          {/* Common Features for Gift Plans */}
          <div className="mt-12 max-w-4xl mx-auto">
            <div className="bg-muted/30 rounded-lg p-8">
              <h3 className="text-xl font-semibold text-center mb-6">Included in Both Gift Plans</h3>
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
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <svg className="h-3 w-3 text-primary" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <span className="text-foreground">12-month gift subscription</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <PricingFAQ />
      <PricingContactCTA />
      <Footer />
    </div>
  );
};

export default Pricing;
