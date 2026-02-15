
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
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

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
        { name: 'Home', url: 'https://www.getassetsafe.com/' },
        { name: 'Pricing', url: 'https://www.getassetsafe.com/pricing' }
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

  const handleSubscribe = async (planType: string, yearly: boolean = false) => {
    // If user is already logged in, go directly to Stripe checkout
    if (user) {
      setIsLoading(true);
      try {
        const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke('create-checkout', {
          body: { 
            planType,
            billingInterval: yearly ? 'year' : 'month',
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
    window.location.href = `/signup?plan=${planType}&billing=${yearly ? 'yearly' : 'monthly'}`;
  };

  const planDifferences = {
    standard: [
      "Unlimited properties",
      "25GB secure cloud storage",
      "Guided home inventory system",
      "Secure Vault (private use)",
      "Password Catalog",
      "Simple, ongoing protection for your home"
    ],
    premium: [
      "Unlimited properties",
      "100GB secure cloud storage",
      "⭐ Trusted Contacts Access",
      "⭐ Legacy Locker (family continuity planning)",
      "⭐ Emergency Access Sharing",
      "⭐ Protection that extends beyond you"
    ]
  };

  const commonFeatures = [
    "Photo, video, and document uploads",
    "Room-by-room inventory organization",
    "Voice notes and item details",
    "Secure Vault + Password Catalog",
    "Claim-ready documentation exports (download anytime)",
    "Multi-factor authentication",
    "Full web platform access",
    "Post damage documentation",
    "Manual Entries",
    "Upgrades & Repairs Record",
    "Paint Code Reference",
    "Source Websites",
    "Service Pros Directory"
  ];

  const premiumOnlyIndicators = [
    "🔒 Trusted Contacts (Premium Only)",
    "🔒 Emergency Access Sharing (Premium Only)",
    "🔒 Legacy Locker Mode (Premium Only)",
    "🔒 Executor / Family Continuity Tools (Premium Only)"
  ];

  const plans = [
    {
      title: "Standard (Homeowner Plan)",
      monthlyPrice: "$12.99",
      yearlyPrice: "$129",
      description: "For individuals documenting and protecting their home.",
      features: planDifferences.standard,
      planType: "standard",
      icon: <Zap className="h-6 w-6" />
    },
    {
      title: "Premium (Legacy & Business Protection)",
      monthlyPrice: "$18.99",
      yearlyPrice: "$189",
      description: "For families, business owners, and anyone who wants shared protection and continuity.",
      features: planDifferences.premium,
      planType: "premium",
      icon: <Star className="h-6 w-6" />,
      popular: true
    }
  ];

  const giftPlans = [
    {
      title: "Gift – Standard",
      price: "$129 / 1 year",
      description: "For individuals documenting and protecting their home.",
      features: [
        "Unlimited properties",
        "25GB secure cloud storage",
        "Password Catalog + Secure Vault",
        "Recipient opts in to renew monthly or yearly"
      ],
      planType: "standard"
    },
    {
      title: "Gift – Premium",
      price: "$189 / 1 year",
      description: "For families who want continuity and shared protection.",
      features: [
        "Unlimited properties",
        "100GB secure cloud storage",
        "Legacy Locker + Trusted Contacts",
        "Recipient opts in to renew monthly or yearly"
      ],
      planType: "premium"
    }
  ];

  const StorageNotation = () => (
    <div className="text-center text-sm text-muted-foreground mt-4 space-y-1">
      <p>25GB ≈ ~1,500 photos + documents</p>
      <p>100GB ≈ ~6,000 photos or extensive video</p>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen">
      <SEOHead
        title="Plans & Pricing - From $12.99/mo | Asset Safe"
        description="Choose from Standard ($12.99/mo) or Premium ($18.99/mo) plans. No long-term contract. Cancel anytime. Secure cloud storage, unlimited uploads, insurance claims support."
        keywords="home inventory pricing, property documentation cost, digital asset management pricing, insurance inventory app cost, estate planning tools pricing"
        canonicalUrl="https://www.getassetsafe.com/pricing"
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
                    Choose the plan that works for you
                  </p>
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 max-w-md mx-auto">
                    <p className="text-sm text-muted-foreground">No long-term contract. Cancel anytime</p>
                  </div>
                </div>

                {/* Billing Cycle Toggle */}
                <div className="flex items-center justify-center gap-4 mb-8">
                  <button
                    onClick={() => setBillingCycle('monthly')}
                    className={`px-6 py-2 rounded-full font-medium transition-all ${
                      billingCycle === 'monthly'
                        ? 'bg-brand-orange text-white'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setBillingCycle('yearly')}
                    className={`px-6 py-2 rounded-full font-medium transition-all ${
                      billingCycle === 'yearly'
                        ? 'bg-brand-orange text-white'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    Yearly
                    <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">Save</span>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                  {plans.map((plan) => (
                    <div key={plan.title} className="relative">
                      {!plan.popular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                          <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                            Basic Protection
                          </span>
                        </div>
                      )}
                      {plan.popular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                          <span className="bg-amber-500 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                            <Star className="h-3 w-3" /> Most Popular for Families and Businesses
                          </span>
                        </div>
                      )}
                      {subscriptionStatus.subscribed && subscriptionStatus.subscription_tier === plan.title && (
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-1 rounded-full text-sm font-medium z-10">
                          Current Plan
                        </div>
                      )}
                      <SubscriptionPlan
                        title={plan.title}
                        price={billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice}
                        description={
                          billingCycle === 'yearly' 
                            ? `${plan.description} – Save when you pay yearly`
                            : plan.description
                        }
                        features={plan.features}
                        billingInterval={billingCycle === 'yearly' ? 'year' : 'month'}
                        buttonText={
                          subscriptionStatus.subscribed && subscriptionStatus.subscription_tier === plan.title 
                            ? "Current Plan" 
                            : isLoading ? "Processing..." : "Get Started"
                        }
                        onClick={() => handleSubscribe(plan.planType, billingCycle === 'yearly')}
                      />
                    </div>
                  ))}
                </div>

                {/* Storage Notation */}
                <StorageNotation />

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

                {/* Storage Add-on */}
                <div className="mt-8 max-w-2xl mx-auto">
                  <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-6 text-center">
                    <p className="text-lg font-semibold text-foreground mb-3">
                      Need more space?
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                      <div className="bg-background/80 rounded-lg px-4 py-2">
                        <span className="font-medium">+25GB</span> for <span className="text-brand-orange font-bold">$4.99/mo</span>
                      </div>
                      <div className="bg-background/80 rounded-lg px-4 py-2">
                        <span className="font-medium">+50GB</span> for <span className="text-brand-orange font-bold">$9.99/mo</span>
                      </div>
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
                    All gift subscriptions are for 1 year with no auto-renew. Recipients can choose to renew monthly or yearly when their gift expires.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                  {giftPlans.map((plan) => (
                    <SubscriptionPlan
                      key={plan.title}
                      title={plan.title}
                      price={plan.price}
                      description={plan.description}
                      features={plan.features}
                      buttonText="Gift This Plan"
                      onClick={() => window.location.href = `/gift-checkout?plan=${plan.planType}`}
                    />
                  ))}
                </div>

                {/* Storage Notation for Gifts */}
                <StorageNotation />

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
                      <ul className="space-y-2 text-muted-foreground">
                        <li>• Purchase a 1-year subscription (no auto-renew)</li>
                        <li>• Enter recipient information during checkout</li>
                        <li>• Automatic gift certificate delivered to recipient</li>
                        <li>• One-time payment only</li>
                      </ul>
                    </div>
                    <div className="bg-white dark:bg-card p-6 rounded-lg shadow-sm border border-border">
                      <h4 className="font-semibold text-lg text-foreground mb-4">For Recipients:</h4>
                      <ul className="space-y-2 text-muted-foreground">
                        <li>• Create an Asset Safe account</li>
                        <li>• Enter the gift code during setup</li>
                        <li>• Enjoy full access for 12 months</li>
                        <li>• Choose to renew monthly or yearly when gift expires</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Who Is Asset Safe a Great Gift For */}
                <div className="mt-12 max-w-5xl mx-auto">
                  <div className="flex items-center justify-center gap-2 mb-8">
                    <Gift className="h-6 w-6 text-brand-orange" />
                    <h3 className="text-2xl font-bold">Who Is Asset Safe a Great Gift For?</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                      { title: "Homebuyers & Sellers", desc: "A meaningful closing gift that lasts well beyond move-in day" },
                      { title: "Newlyweds & Couples", desc: "Start life together organized, protected, and prepared" },
                      { title: "Business Owners", desc: "Secure important documents and assets in one place" },
                      { title: "Parents & Growing Families", desc: "Protect what matters most and plan ahead with confidence" },
                      { title: "Adult Children Gifting Parents", desc: "A thoughtful way to help organize important records" },
                      { title: "Graduates & Young Adults", desc: "A smart foundation for independent life" }
                    ].map((item, index) => (
                      <div key={index} className="bg-white dark:bg-card p-6 rounded-lg shadow-sm border border-border">
                        <h4 className="font-semibold text-lg text-foreground mb-2">{item.title}</h4>
                        <p className="text-muted-foreground text-sm">{item.desc}</p>
                      </div>
                    ))}
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
