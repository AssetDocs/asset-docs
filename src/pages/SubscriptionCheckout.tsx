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
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { CheckIcon, Shield, Star, Zap } from 'lucide-react';

const formSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Please confirm your password'),
  heardAbout: z.string().min(1, 'Please select how you heard about us'),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: 'You must agree to the Terms of Service to continue',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof formSchema>;

const SubscriptionCheckout: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  
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
      password: '',
      confirmPassword: '',
      heardAbout: '',
      agreeToTerms: false,
    },
  });

  // Plan configurations
  const planConfigs = {
    standard: {
      title: "Standard (Homeowner Plan)",
      price: "$12.99",
      description: "Our most popular plan for comprehensive home documentation",
      features: [
        "Up to 3 properties",
        "25GB secure cloud storage"
      ],
      icon: <Zap className="h-6 w-6 text-orange-600" />
    },
    premium: {
      title: "Premium (Professional Plan)",
      price: "$18.99",
      description: "Best suited for estate managers, multiple-property owners, or businesses",
      features: [
        "Unlimited properties",
        "100GB secure cloud storage"
      ],
      icon: <Star className="h-6 w-6 text-purple-600" />
    }
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
      // Redirect to account settings subscription tab after email verification
      const redirectUrl = `${window.location.origin}/account-settings?tab=subscription`;

      // Sign up user with Supabase
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            phone: data.phone,
            heard_about: data.heardAbout,
          }
        }
      });
      
      if (signUpError) throw signUpError;
      
      // Show email verification screen
      setSubmittedEmail(data.email);
      setShowEmailVerification(true);
    } catch (error: any) {
      console.error('Error creating account:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create account. Please try again.",
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

  // Show email verification screen
  if (showEmailVerification) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar />
        
        <main className="flex-1 py-12">
          <div className="container mx-auto px-4 max-w-2xl">
            <div className="text-center">
              <div className="mb-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckIcon className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-3xl font-bold mb-4">You're almost done!</h1>
                <p className="text-lg text-muted-foreground mb-2">Check your email.</p>
                <p className="text-muted-foreground">
                  We've sent a verification link to <strong>{submittedEmail}</strong>
                </p>
              </div>
              
              <Card className="text-left">
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-3">What happens next?</h3>
                  <ol className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">1</span>
                      Check your email inbox (and spam folder)
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">2</span>
                      Click the verification link in the email
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">3</span>
                      Complete your payment to start your free trial
                    </li>
                  </ol>
                </CardContent>
              </Card>
              
              <div className="mt-8">
                <Button 
                  variant="outline" 
                  onClick={() => setShowEmailVerification(false)}
                >
                  Go Back to Form
                </Button>
              </div>
            </div>
          </div>
        </main>
        
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
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Create Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Enter your password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Confirm your password" {...field} />
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

                    <FormField
                      control={form.control}
                      name="agreeToTerms"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm">
                              I agree to the{' '}
                              <a 
                                href="/terms" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                              >
                                Terms of Service
                              </a>
                              {' '}and{' '}
                              <a 
                                href="/legal" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                              >
                                Privacy Policy
                              </a>
                            </FormLabel>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isLoading}
                    >
                      {isLoading ? "Processing..." : "Continue"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Plan Summary */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  {selectedPlan.icon}
                  <div>
                    <CardTitle>{selectedPlan.title}</CardTitle>
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
                  
                  {/* Common Features */}
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-semibold mb-2">Plus all these features:</h4>
                    <ul className="space-y-2">
                      {commonFeatures.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
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