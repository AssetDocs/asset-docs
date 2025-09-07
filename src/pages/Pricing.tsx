
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
    // Navigate to subscription checkout page with plan type (no authentication required)
    window.location.href = `/subscription-checkout?plan=${planType}`;
  };

  const plans = [
    {
      title: "Basic",
      price: "$8.99",
      description: "Perfect for individuals with basic documentation needs",
      features: [
        "30-day free trial",
        "1 property",
        "10GB secure cloud storage",
        "Photo uploads",
        "Web platform access",
        "Email support"
      ],
      planType: "basic",
      icon: <Shield className="h-6 w-6" />
    },
    {
      title: "Standard",
      price: "$12.99",
      description: "Our most popular plan for comprehensive home documentation",
      features: [
        "30-day free trial",
        "Up to 3 properties",
        "25GB secure cloud storage",
        "Photo and video uploads",
        "Web platform access",
        "Export detailed reports",
        "Voice notes for item details",
        "Post damage documentation",
        "Priority email support",
        "Share with 2 trusted contacts"
      ],
      planType: "standard",
      recommended: true,
      icon: <Zap className="h-6 w-6" />
    },
    {
      title: "Premium",
      price: "$18.99",
      description: "Best suited for estate managers, multiple-property owners, or businesses",
      features: [
        "30-day free trial",
        "Up to 10 properties",
        "100GB secure cloud storage",
        "Unlimited photo and video uploads",
        "Full web platform access",
        "Voice notes for item details",
        "Post damage documentation",
        "Export detailed reports", 
        "Priority email and phone support",
        "Share with 5 trusted contacts"
      ],
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
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <div key={plan.title} className={`relative ${plan.recommended ? 'transform scale-105' : ''}`}>
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
                  recommended={plan.recommended}
                  buttonText={
                    subscriptionStatus.subscribed && subscriptionStatus.subscription_tier === plan.title 
                      ? "Current Plan" 
                      : isLoading ? "Processing..." : "Subscribe"
                  }
                  onClick={() => handleSubscribe(plan.planType)}
                />
              </div>
            ))}
          </div>
          
          {/* Storage Add-ons */}
          <div className="mt-12 text-center">
            <h3 className="text-xl font-semibold mb-4">Need More Storage?</h3>
            <div className="bg-muted/30 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-muted-foreground mb-3">Add extra storage to any plan</p>
              <div className="text-lg font-semibold">+50GB Storage Add-on</div>
              <div className="text-2xl font-bold text-primary">$5/month</div>
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
      
      <PricingFAQ />
      <PricingContactCTA />
      <Footer />
    </div>
  );
};

export default Pricing;
