import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SubscriptionPlan from '@/components/SubscriptionPlan';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { CheckIcon } from 'lucide-react';

const CompletePricing: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  // Get user info from URL params
  const searchParams = new URLSearchParams(location.search);
  const email = searchParams.get('email');

  const handleSubscribe = async () => {
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
      // Preserve internal lookup key — single plan billed monthly.
      const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke('create-checkout', {
        body: {
          planLookupKey: 'asset_safe_monthly',
          email,
        },
      });

      if (checkoutError) throw checkoutError;
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

  const planFeatures = [
    "Unlimited properties",
    "25 GB Secure Storage Included (+25 GB add-ons available)",
    "Photo, video, and document uploads",
    "Room-by-room inventory organization",
    "Secure Vault (Legacy & Digital Access)",
    "Legacy Locker (family continuity & instructions)",
    "Authorized Users",
    "Emergency Access Sharing",
    "Voice notes, damage reports, exports",
    "Memory Safe & Quick Notes",
    "MFA, full web platform access",
    "Family Archive",
    "Property Profiles",
    "Insights & Tools",
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
            Your email has been verified! Complete your billing information to activate The Asset Safe Plan.
          </p>
          {email && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-primary font-semibold">✅ Email Verified: {email}</p>
              <p className="text-sm text-muted-foreground">Ready to complete your subscription</p>
            </div>
          )}
        </div>
      </section>

      {/* Subscription Plan Section */}
      <section className="py-16 bg-secondary/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">The Asset Safe Plan</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-4">
              One simple plan. Everything included.
            </p>
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 max-w-md mx-auto space-y-1">
              <p className="text-sm text-muted-foreground">No long-term contract. Cancel anytime.</p>
              <p className="text-xs text-muted-foreground">🇺🇸 Paid subscriptions are currently available to U.S. billing addresses only.</p>
            </div>
          </div>

          <div className="max-w-lg mx-auto">
            <SubscriptionPlan
              title="Asset Safe Plan"
              price="$18.99"
              description="No long-term contract. Cancel anytime."
              features={planFeatures}
              buttonText={isLoading ? "Processing..." : "Continue to Checkout"}
              recommended
              onClick={handleSubscribe}
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CompletePricing;
