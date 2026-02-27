import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import PricingHero from '@/components/PricingHero';
import PricingFAQ from '@/components/PricingFAQ';
import PricingContactCTA from '@/components/PricingContactCTA';
import SubscriptionPlan from '@/components/SubscriptionPlan';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { CheckIcon, Shield, Gift } from 'lucide-react';
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
      productSchema("Asset Safe Plan", "18.99", "One simple plan. Everything included. Secure asset documentation, cloud storage, legacy tools, and trusted access."),
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

  const [consentChecked, setConsentChecked] = useState(false);
  const [consentLogging, setConsentLogging] = useState(false);

  const handleSubscribe = async (yearly: boolean = false) => {
    if (!consentChecked) return;

    if (user) {
      setIsLoading(true);
      setConsentLogging(true);
      try {
        // Log consent before checkout
        const { data: consentData, error: consentErr } = await supabase.functions.invoke('log-consent', {
          body: {
            userEmail: user.email,
            consentType: 'subscription_checkout',
            termsVersion: 'v1.0',
          },
        });
        if (consentErr || !consentData?.success) {
          throw new Error('Failed to record consent. Please try again.');
        }
        setConsentLogging(false);

        const lookupKey = yearly ? 'asset_safe_annual' : 'asset_safe_monthly';
        const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke('create-checkout', {
          body: { planLookupKey: lookupKey },
        });
        
        if (checkoutError) throw checkoutError;
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
        setConsentLogging(false);
      }
      return;
    }
    
    window.location.href = `/signup?billing=${yearly ? 'yearly' : 'monthly'}`;
  };

  const unifiedFeatures = [
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

  const giftPlan = {
    title: "Gift – Asset Safe Plan",
    price: "$189 / 1 year",
    description: "Give a full year of protection. Everything included.",
    features: [
      "Unlimited properties",
      "25GB secure cloud storage",
      "Legacy Locker + Authorized Users",
      "Emergency Access Sharing",
      "Full platform access — everything included",
      "Recipient opts in to renew monthly or yearly"
    ],
    planType: "standard"
  };

  const StorageNotation = () => (
    <div className="text-center text-sm text-muted-foreground mt-4 space-y-1">
      <p>25GB ≈ ~1,500 photos + documents</p>
      <p>100GB ≈ ~6,000 photos or extensive video</p>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen">
      <SEOHead
        title="Asset Safe Plan — Everything Included | Asset Safe"
        description="One simple plan starting at $18.99/mo. Secure asset documentation, cloud storage, legacy tools, and trusted access — with flexible storage that grows with you."
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
                    One simple plan. Everything included.
                  </p>
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 max-w-md mx-auto space-y-1">
                    <p className="text-sm text-muted-foreground">No long-term contract. Cancel anytime</p>
                    <p className="text-xs text-muted-foreground">🇺🇸 Paid subscriptions are currently available to U.S. billing addresses only.</p>
                  </div>
                </div>

                {/* Billing Cycle Toggle */}
                <div className="flex items-center justify-center mb-8">
                  <Tabs value={billingCycle} onValueChange={(v) => setBillingCycle(v as 'monthly' | 'yearly')}>
                    <TabsList className="bg-muted rounded-full p-1">
                      <TabsTrigger
                        value="monthly"
                        className="rounded-full px-6 py-2 font-medium data-[state=active]:bg-brand-orange data-[state=active]:text-white"
                      >
                        Monthly
                      </TabsTrigger>
                      <TabsTrigger
                        value="yearly"
                        className="rounded-full px-6 py-2 font-medium data-[state=active]:bg-brand-orange data-[state=active]:text-white"
                      >
                        Yearly
                        <Badge className="ml-2 bg-brand-green/10 text-brand-green border-0 text-xs">Save</Badge>
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                
                <div className="max-w-lg mx-auto">
                  {subscriptionStatus.subscribed && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-1 rounded-full text-sm font-medium z-10">
                      Current Plan
                    </div>
                  )}
                  <SubscriptionPlan
                    title="Asset Safe Plan"
                    price={billingCycle === 'monthly' ? '$18.99' : '$189'}
                    description={billingCycle === 'yearly' ? 'One simple plan. Everything included. — Save when you pay yearly' : 'One simple plan. Everything included.'}
                    features={unifiedFeatures}
                    billingInterval={billingCycle === 'yearly' ? 'year' : 'month'}
                    recommended={true}
                    buttonText={subscriptionStatus.subscribed ? 'Current Plan' : isLoading || consentLogging ? 'Processing...' : consentChecked ? 'Get Started' : 'Agree to Continue'}
                    onClick={() => handleSubscribe(billingCycle === 'yearly')}
                  />

                  {/* Consent Gate */}
                  {!subscriptionStatus.subscribed && (
                    <div className="mt-4 flex items-start gap-3 bg-muted/30 rounded-lg p-4">
                      <Checkbox
                        id="pricing-consent"
                        checked={consentChecked}
                        onCheckedChange={(v) => setConsentChecked(v === true)}
                        className="mt-0.5"
                      />
                      <Label htmlFor="pricing-consent" className="text-sm font-normal cursor-pointer leading-snug">
                        I agree to the{' '}
                        <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                          Terms of Service
                        </a>
                        {' '}and{' '}
                        <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                          Terms of Service
                        </a>.
                        <span className="block text-xs text-muted-foreground mt-1">
                          Required before proceeding to payment.
                        </span>
                      </Label>
                    </div>
                  )}
                </div>

                {/* Storage Notation */}
                <StorageNotation />

                {/* What's Included */}
                <div className="mt-12 max-w-4xl mx-auto">
                  <div className="bg-muted/30 rounded-lg p-8">
                    <h3 className="text-xl font-semibold text-center mb-4">What's Included</h3>
                    <p className="text-sm text-muted-foreground text-center mb-4">
                      Billed monthly or yearly. No long-term contract. Cancel anytime.
                    </p>
                    <p className="text-sm text-muted-foreground text-center mb-6">
                      Full access to your data and complete exports anytime.
                    </p>
                    <p className="text-sm font-medium text-center mb-6">
                      Everything you need to fully document and protect your home:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                      {unifiedFeatures.map((feature, index) => (
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
                      <span className="font-bold">+25GB</span> for <span className="text-brand-orange font-bold">$4.99 / month</span><span className="text-xs text-muted-foreground ml-1">+ tax</span>
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
                  <h3 className="text-2xl font-bold mb-4">Why one plan?</h3>
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
                  <h3 className="text-2xl font-bold mb-4">Gift the Asset Safe Plan</h3>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    Gift subscriptions are for 1 year with no auto-renew. Recipients can choose to renew monthly or yearly when their gift expires.
                  </p>
                </div>
                
                <div className="max-w-lg mx-auto">
                  <SubscriptionPlan
                    title={giftPlan.title}
                    price={giftPlan.price}
                    description={giftPlan.description}
                    features={giftPlan.features}
                    recommended={true}
                    buttonText="Gift This Plan"
                    onClick={() => window.location.href = `/gift-checkout?plan=${giftPlan.planType}`}
                  />
                </div>

                {/* Storage Notation for Gifts */}
                <StorageNotation />

                {/* What's Included */}
                <div className="mt-12 max-w-4xl mx-auto">
                  <div className="bg-muted/30 rounded-lg p-8">
                    <h3 className="text-xl font-semibold text-center mb-6">What's Included</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                      {[...unifiedFeatures, "12-month gift subscription"].map((feature, index) => (
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
