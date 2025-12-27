
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import PricingHero from '@/components/PricingHero';
import PricingFAQ from '@/components/PricingFAQ';
import PricingContactCTA from '@/components/PricingContactCTA';
import SubscriptionPlan from '@/components/SubscriptionPlan';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { CheckIcon, Zap, Shield, Star, Gift } from 'lucide-react';
import { productSchema, faqSchema, breadcrumbSchema } from '@/utils/structuredData';

const Pricing: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subscriptionStatus, setSubscriptionStatus] = useState<{
    subscribed: boolean;
    subscription_tier?: string;
    subscription_end?: string;
  }>({ subscribed: false });
  const [isLoading, setIsLoading] = useState(false);

  // Structured data for pricing page
  const faqData = [
    {
      question: "How secure is my property documentation?",
      answer: "Asset Safe uses enterprise-grade encryption and secure cloud storage to protect your valuable documentation. All data is encrypted both in transit and at rest."
    },
    {
      question: "Can I cancel my subscription at any time?",
      answer: "Yes, you can cancel your subscription at any time. Your documentation will remain accessible until the end of your billing period."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards including Visa, Mastercard, and American Express through our secure Stripe payment processing."
    }
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      productSchema("Asset Safe Standard Plan", "12.99", "Comprehensive home documentation with up to 3 properties and 25GB storage"),
      productSchema("Asset Safe Premium Plan", "18.99", "Professional plan with unlimited properties and 100GB storage for estate managers"),
      faqSchema(faqData),
      breadcrumbSchema([
        { name: 'Home', url: 'https://www.assetsafe.net/' },
        { name: 'Pricing', url: 'https://www.assetsafe.net/pricing' }
      ])
    ]
  };

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

  const handleSubscribe = async (planType: string) => {
    // If user is already logged in, go directly to Stripe checkout
    if (user) {
      setIsLoading(true);
      try {
        const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke('create-checkout', {
          body: { 
            planType,
            email: user.email,
          },
        });
        
        if (checkoutError) throw checkoutError;
        
        // Redirect to Stripe checkout
        window.location.href = checkoutData.url;
      } catch (error: any) {
        console.error('Error creating checkout:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to create checkout session. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
      return;
    }
    
    // For new users, navigate to signup page
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
      <SEOHead
        title="Pricing - Affordable Plans for Home & Property Documentation"
        description="Choose from Standard ($12.99/mo) or Premium ($18.99/mo) plans. No long-term contract. Cancel anytime. Secure cloud storage, unlimited photos/videos, insurance claims support."
        keywords="home inventory pricing, property documentation cost, digital asset management pricing, insurance inventory app cost, estate planning tools pricing"
        canonicalUrl="https://www.assetsafe.net/pricing"
        structuredData={structuredData}
      />
      <Navbar />
      <PricingHero />
      
      {/* Tabbed Pricing Section */}
      <section className="py-16 bg-secondary/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-8">Choose Your Plan</h2>
            
            <Tabs defaultValue="for-you" className="w-full">
              <TabsList className="inline-flex h-auto p-1 mb-12 bg-muted/50 border-2 border-orange-500 shadow-lg">
                <TabsTrigger 
                  value="for-you" 
                  className="px-8 py-3 text-base data-[state=active]:bg-background data-[state=active]:text-foreground"
                >
                  For You
                </TabsTrigger>
                <TabsTrigger 
                  value="gift" 
                  className="px-8 py-3 text-base data-[state=active]:bg-background data-[state=active]:text-foreground"
                >
                  <Gift className="h-4 w-4 mr-2" />
                  As a Gift
                </TabsTrigger>
              </TabsList>

              {/* For You Tab Content */}
              <TabsContent value="for-you" className="mt-0">
                <div className="mb-8">
                  <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-4">
                    Select the perfect plan for your property management needs
                  </p>
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 max-w-md mx-auto">
                    <p className="text-sm text-muted-foreground">No long-term contract. Cancel anytime</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                  {plans.map((plan) => (
                    <div key={plan.title} className="relative">
                      {subscriptionStatus.subscribed && subscriptionStatus.subscription_tier === plan.title && (
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-1 rounded-full text-sm font-medium z-10">
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

                {/* Storage Add-on */}
                <div className="mt-8 max-w-2xl mx-auto">
                  <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-6 text-center">
                    <p className="text-lg font-semibold text-foreground mb-2">
                      Need more space? Add 50 GB for just $9.99/month.
                    </p>
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
              </TabsContent>

              {/* As a Gift Tab Content */}
              <TabsContent value="gift" className="mt-0">
                {/* Hero Section */}
                <div className="mb-12">
                  <div className="flex justify-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full">
                      <span className="text-3xl">🎁</span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Give the Gift of Protection and Peace of Mind</h3>
                  <p className="text-lg font-medium text-brand-orange mb-6">
                    Practical, Not Disposable – A gift that provides long-term value
                  </p>
                  <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                    Help your loved ones protect their most valuable assets with Asset Safe. 
                    A thoughtful gift that provides lasting security and organization for their properties and belongings.
                  </p>
                </div>

                {/* Three Benefit Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
                  <div className="bg-white dark:bg-card p-6 rounded-lg shadow-sm border border-border text-center">
                    <div className="flex justify-center mb-4">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
                        <Shield className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    <h4 className="font-semibold text-lg text-foreground mb-2">Comprehensive Protection</h4>
                    <p className="text-muted-foreground text-sm">Safeguard valuable assets with detailed documentation and organization</p>
                  </div>
                  <div className="bg-white dark:bg-card p-6 rounded-lg shadow-sm border border-border text-center">
                    <div className="flex justify-center mb-4">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full">
                        <CheckIcon className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                    <h4 className="font-semibold text-lg text-foreground mb-2">Peace of Mind</h4>
                    <p className="text-muted-foreground text-sm">Know that important documents and photos are secure and accessible</p>
                  </div>
                  <div className="bg-white dark:bg-card p-6 rounded-lg shadow-sm border border-border text-center">
                    <div className="flex justify-center mb-4">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full">
                        <Gift className="h-6 w-6 text-orange-600" />
                      </div>
                    </div>
                    <h4 className="font-semibold text-lg text-foreground mb-2">Family Security</h4>
                    <p className="text-muted-foreground text-sm">Protect multiple properties and keep family assets organized</p>
                  </div>
                </div>

                {/* Choose the Perfect Gift Plan */}
                <div className="mb-8">
                  <h3 className="text-2xl font-bold mb-4">Choose the Perfect Gift Plan</h3>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    All gift subscriptions include a full year of service. Your recipient will receive immediate access to all features and can start protecting their assets right away.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                  <SubscriptionPlan
                    title="Standard (Homeowner Plan)"
                    price="$155.88 - 1 year"
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
                    price="$227.88 - 1 year"
                    description="Best suited for estate managers, multiple-property owners, or businesses"
                    features={[
                      "Unlimited properties",
                      "100GB secure cloud storage"
                    ]}
                    buttonText="Gift This Plan"
                    onClick={() => window.location.href = '/gift-checkout?plan=premium'}
                  />
                </div>

                {/* Features included in both plans */}
                <div className="mt-12 max-w-4xl mx-auto">
                  <div className="bg-muted/30 rounded-lg p-8">
                    <h3 className="text-xl font-semibold text-center mb-6">Features included in both plans</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                      {[...commonFeatures.map(f => f === "Photo and video uploads" ? "Photo, video, and document upload" : f), "12-month gift subscription"].map((feature, index) => (
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

                {/* How Gift Subscriptions Work */}
                <div className="mt-12 max-w-4xl mx-auto">
                  <h3 className="text-2xl font-bold mb-8">How Gift Subscriptions Work</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white dark:bg-card p-6 rounded-lg shadow-sm border border-border">
                      <h4 className="font-semibold text-lg text-foreground mb-4">For Gift Givers:</h4>
                      <ul className="space-y-3 text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>Purchase a 12-month subscription</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>Enter recipient information during checkout</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>Automatic gift certificate delivered to recipient</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>No recurring charges - one-time payment</span>
                        </li>
                      </ul>
                    </div>
                    <div className="bg-white dark:bg-card p-6 rounded-lg shadow-sm border border-border">
                      <h4 className="font-semibold text-lg text-foreground mb-4">For Recipients:</h4>
                      <ul className="space-y-3 text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>Create an Asset Safe account</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>Enter the gift code during setup</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>Enjoy full access for 12 months</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>Option to continue with their own subscription</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Who Is Asset Safe a Great Gift For? */}
                <div className="mt-12 max-w-5xl mx-auto">
                  <h3 className="text-2xl font-bold mb-8">Who Is Asset Safe a Great Gift For?</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-card p-6 rounded-lg shadow-sm border border-border">
                      <h4 className="font-semibold text-lg text-foreground mb-2">Homebuyers & Sellers</h4>
                      <p className="text-muted-foreground">A meaningful closing gift that lasts well beyond move-in day</p>
                    </div>
                    <div className="bg-white dark:bg-card p-6 rounded-lg shadow-sm border border-border">
                      <h4 className="font-semibold text-lg text-foreground mb-2">Newlyweds & Couples</h4>
                      <p className="text-muted-foreground">Start life together organized, protected, and prepared</p>
                    </div>
                    <div className="bg-white dark:bg-card p-6 rounded-lg shadow-sm border border-border">
                      <h4 className="font-semibold text-lg text-foreground mb-2">Business Owners & Entrepreneurs</h4>
                      <p className="text-muted-foreground">Secure important documents and assets in one place</p>
                    </div>
                    <div className="bg-white dark:bg-card p-6 rounded-lg shadow-sm border border-border">
                      <h4 className="font-semibold text-lg text-foreground mb-2">Parents & Growing Families</h4>
                      <p className="text-muted-foreground">Protect what matters most and plan ahead with confidence</p>
                    </div>
                    <div className="bg-white dark:bg-card p-6 rounded-lg shadow-sm border border-border">
                      <h4 className="font-semibold text-lg text-foreground mb-2">Adult Children Gifting Parents</h4>
                      <p className="text-muted-foreground">A thoughtful way to help organize important records</p>
                    </div>
                    <div className="bg-white dark:bg-card p-6 rounded-lg shadow-sm border border-border">
                      <h4 className="font-semibold text-lg text-foreground mb-2">Graduates & Young Adults</h4>
                      <p className="text-muted-foreground">A smart foundation for independent life</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
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
