import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SubscriptionPlan from '@/components/SubscriptionPlan';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { CheckIcon, Zap, Shield, Star } from 'lucide-react';

const CompletePricing: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  // Get user info from URL params
  const searchParams = new URLSearchParams(location.search);
  const email = searchParams.get('email');
  const firstName = searchParams.get('firstName');
  const lastName = searchParams.get('lastName');
  const phone = searchParams.get('phone');
  const heardAbout = searchParams.get('heardAbout');

  const handleSubscribe = async (planType: string) => {
    if (!email) {
      toast({
        title: "Error",
        description: "Missing required information. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Create Stripe checkout session
      const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke('create-checkout', {
        body: { 
          planType,
          email,
          customerInfo: {
            firstName: firstName || '',
            lastName: lastName || '',
            phone: phone || '',
            heardAbout: heardAbout || '',
          }
        },
      });
      
      if (checkoutError) throw checkoutError;
      
      // Redirect to Stripe checkout
      window.location.href = checkoutData.url;
    } catch (error) {
      console.error('Error processing checkout:', error);
      toast({
        title: "Error",
        description: "Failed to process your subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
      
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-b from-primary/10 to-background">
        <div className="container mx-auto px-4 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckIcon className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Complete Your Subscription</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
            Your email has been verified! Choose your plan and complete your billing information to get started.
          </p>
          {email && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-primary font-semibold">✅ Email Verified: {email}</p>
              <p className="text-sm text-muted-foreground">Ready to start your 30-day free trial</p>
            </div>
          )}
        </div>
      </section>
      
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
                <SubscriptionPlan
                  title={plan.title}
                  price={plan.price}
                  description={plan.description}
                  features={plan.features}
                  recommended={plan.recommended}
                  buttonText={isLoading ? "Processing..." : "Choose Plan"}
                  onClick={() => handleSubscribe(plan.planType)}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default CompletePricing;