import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { CheckIcon, Shield, Star, Zap } from 'lucide-react';

const formSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  heardAbout: z.string().min(1, 'Please select how you heard about us'),
});

type FormData = z.infer<typeof formSchema>;

const SubscriptionCheckout: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  // Get plan info from URL params or state
  const searchParams = new URLSearchParams(location.search);
  const planType = searchParams.get('plan') || location.state?.planType;
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: user?.email || '',
      phone: '',
      heardAbout: '',
    },
  });

  // Plan configurations
  const planConfigs = {
    basic: {
      title: "Basic",
      price: "$8.99",
      description: "Perfect for individuals with basic documentation needs",
      features: [
        "1 property",
        "250GB secure cloud storage",
        "Photo and video uploads",
        "Mobile app access",
        "Email support",
        "30-day free trial"
      ],
      icon: <Shield className="h-6 w-6 text-blue-600" />,
      recommended: false
    },
    standard: {
      title: "Standard",
      price: "$8.99",
      description: "Our most popular plan for comprehensive home documentation",
      features: [
        "Up to 3 properties",
        "200GB secure cloud storage",
        "Photo and video uploads",
        "Mobile app access",
        "Export detailed reports",
        "Priority email support",
        "Share with 2 trusted contacts",
        "🎉 6-month introductory price (reg. $12.99)",
        "30-day free trial"
      ],
      icon: <Zap className="h-6 w-6 text-orange-600" />,
      recommended: true
    },
    premium: {
      title: "Premium",
      price: "$18.99",
      description: "Complete protection with professional documentation tools",
      features: [
        "Up to 10 properties",
        "750GB secure cloud storage",
        "Unlimited photo and video uploads",
        "Professional asset tagging",
        "AI-powered item identification & valuation",
        "Floor plan scanning with live camera",
        "Mobile app access with premium features",
        "Export comprehensive reports",
        "Priority email and phone support",
        "Share with 5 trusted contacts",
        "30-day free trial"
      ],
      icon: <Star className="h-6 w-6 text-purple-600" />,
      recommended: false
    }
  };

  const selectedPlan = planType ? planConfigs[planType as keyof typeof planConfigs] : null;

  useEffect(() => {
    if (!selectedPlan) {
      toast({
        title: "Plan Selection Required",
        description: "Please select a plan from the pricing page.",
        variant: "destructive",
      });
      navigate('/pricing');
      return;
    }
  }, [selectedPlan, navigate, toast]);

  const onSubmit = async (data: FormData) => {
    if (!planType) return;

    setIsLoading(true);
    try {
      // Store customer information in profiles table if user is authenticated
      if (user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            user_id: user.id,
            first_name: data.firstName,
            last_name: data.lastName,
          });

        if (profileError) throw profileError;
      }

      // Create Stripe checkout session (works for both authenticated and non-authenticated users)
      const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke('create-checkout', {
        body: { 
          planType,
          email: data.email, // Include email for non-authenticated users
          customerInfo: {
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            heardAbout: data.heardAbout,
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

  if (!selectedPlan) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Loading...</h1>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Complete Your Subscription</h1>
            <p className="text-muted-foreground">Enter your information to get started with your {selectedPlan.title} plan</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Customer Information Form */}
            <Card>
              <CardHeader>
                <CardTitle>Your Information</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="john@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input type="tel" placeholder="(555) 123-4567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="heardAbout"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>How did you hear about Asset Docs?</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Please select" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="google">Google Search</SelectItem>
                              <SelectItem value="social-media">Social Media</SelectItem>
                              <SelectItem value="referral">Friend/Family Referral</SelectItem>
                              <SelectItem value="insurance-agent">Insurance Agent</SelectItem>
                              <SelectItem value="real-estate">Real Estate Professional</SelectItem>
                              <SelectItem value="online-ad">Online Advertisement</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isLoading}
                    >
                      {isLoading ? "Processing..." : "Continue to Payment"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Plan Summary */}
            <Card className={`${selectedPlan.recommended ? 'border-2 border-primary' : ''}`}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  {selectedPlan.icon}
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {selectedPlan.title}
                      {selectedPlan.recommended && (
                        <span className="bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs">
                          Recommended
                        </span>
                      )}
                    </CardTitle>
                    <p className="text-muted-foreground text-sm">{selectedPlan.description}</p>
                  </div>
                </div>
                <div className="text-3xl font-bold">
                  {selectedPlan.price}
                  <span className="text-lg font-normal text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <h4 className="font-semibold">What's included:</h4>
                  <ul className="space-y-2">
                    {selectedPlan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">🎉 30-Day Free Trial</h4>
                  <p className="text-sm text-muted-foreground">
                    Start your free trial today. You won't be charged until after your trial period ends. 
                    Cancel anytime during the trial with no charges.
                  </p>
                </div>

                <div className="mt-4 text-center">
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/pricing')}
                    className="text-sm"
                  >
                    Change Plan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SubscriptionCheckout;