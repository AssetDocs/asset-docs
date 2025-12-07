import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Shield, Zap, Star, Gift, CheckIcon, CalendarIcon } from 'lucide-react';

const formSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  recipientFirstName: z.string().min(2, 'Recipient first name must be at least 2 characters'),
  recipientLastName: z.string().min(2, 'Recipient last name must be at least 2 characters'),
  recipientEmail: z.string().email('Invalid recipient email address'),
  deliveryDate: z.string().min(1, 'Please select a delivery date'),
  giftMessage: z.string().optional(),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: 'You must agree to the Terms of Service to continue',
  }),
});

const GiftCheckout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      recipientFirstName: '',
      recipientLastName: '',
      recipientEmail: '',
      deliveryDate: '',
      giftMessage: '',
      agreeToTerms: false,
    },
  });

  const planConfigs = {
    standard: {
      title: 'Standard (Homeowner Plan)',
      price: '$155.88/year',
      description: 'Our most popular plan for comprehensive home documentation',
      features: [
        '30-day free trial',
        'Up to 3 properties',
        '25GB secure cloud storage',
        'Unlimited photo and video uploads',
        'Full web platform access',
        'Voice notes for item details',
        'Post damage documentation',
        'Export detailed reports',
        'Email support',
        'Share with 3 trusted contacts',
        '12-month gift subscription'
      ],
      icon: <Zap className="h-8 w-8" />,
      recommended: true,
    },
    premium: {
      title: 'Premium (Professional Plan)',
      price: '$227.88/year',
      description: 'Best suited for estate managers, multiple-property owners, or businesses',
      features: [
        '30-day free trial',
        'Unlimited properties',
        '100GB secure cloud storage',
        'Unlimited photo and video uploads',
        'Full web platform access',
        'Voice notes for item details',
        'Post damage documentation',
        'Export detailed reports',
        'Email support',
        'Share with 3 trusted contacts',
        '12-month gift subscription'
      ],
      icon: <Star className="h-8 w-8" />,
    },
  };

  const selectedPlan = location.state?.selectedPlan || 'standard';
  const selectedPlanConfig = planConfigs[selectedPlan as keyof typeof planConfigs];

  useEffect(() => {
    if (!selectedPlan || !selectedPlanConfig) {
      navigate('/gift');
    }
  }, [selectedPlan, selectedPlanConfig, navigate]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-gift-checkout', {
        body: {
          planType: selectedPlan,
          giftData: {
            purchaserEmail: values.email,
            purchaserName: `${values.firstName} ${values.lastName}`,
            purchaserPhone: values.phone,
            recipientEmail: values.recipientEmail,
            recipientName: `${values.recipientFirstName} ${values.recipientLastName}`,
            giftMessage: values.giftMessage,
            deliveryDate: values.deliveryDate,
          }
        },
      });

      if (error) throw error;
      
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Error creating gift checkout:', error);
      toast({
        title: "Error",
        description: "Failed to create checkout session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!selectedPlanConfig) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <Gift className="h-12 w-12 text-brand-orange mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Gift Purchase</h1>
              <p className="text-gray-600">Fill out the details below to send an Asset Safe subscription as a gift</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Gift Information Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Gift Information</CardTitle>
                  <CardDescription>
                    Please provide your information and the recipient's details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Your Information</h3>
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
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Recipient Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="recipientFirstName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Recipient First Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Jane" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="recipientLastName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Recipient Last Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Smith" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={form.control}
                          name="recipientEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Recipient Email</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="jane@example.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="deliveryDate"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormLabel>Gift Delivery Date</FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={(value) => {
                                    if (value === 'now') {
                                      field.onChange(new Date().toISOString().split('T')[0]);
                                    } else {
                                      field.onChange('');
                                    }
                                  }}
                                  className="space-y-3"
                                >
                                  <div className="flex items-center space-x-3">
                                    <RadioGroupItem value="now" id="delivery-now" />
                                    <Label htmlFor="delivery-now" className="font-normal cursor-pointer">
                                      Send immediately after purchase
                                    </Label>
                                  </div>
                                  <div className="flex items-start space-x-3">
                                    <RadioGroupItem value="scheduled" id="delivery-scheduled" className="mt-1" />
                                    <div className="flex-1 space-y-2">
                                      <Label htmlFor="delivery-scheduled" className="font-normal cursor-pointer">
                                        Schedule for a specific date
                                      </Label>
                                      <Popover>
                                        <PopoverTrigger asChild>
                                          <Button
                                            variant="outline"
                                            className={cn(
                                              "w-full justify-start text-left font-normal",
                                              !field.value && "text-muted-foreground"
                                            )}
                                          >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {field.value ? format(new Date(field.value), "PPP") : <span>Pick a date</span>}
                                          </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                          <Calendar
                                            mode="single"
                                            selected={field.value ? new Date(field.value) : undefined}
                                            onSelect={(date) => {
                                              if (date) {
                                                field.onChange(format(date, 'yyyy-MM-dd'));
                                              }
                                            }}
                                            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                            initialFocus
                                            className={cn("p-3 pointer-events-auto")}
                                          />
                                        </PopoverContent>
                                      </Popover>
                                    </div>
                                  </div>
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="giftMessage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Gift Message (Optional)</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Write a personal message for your gift..."
                                  className="resize-none"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

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
                        size="lg"
                        disabled={isLoading}
                      >
                        {isLoading ? "Processing..." : "Continue to Payment"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              {/* Plan Summary */}
              <Card className={'recommended' in selectedPlanConfig && selectedPlanConfig.recommended ? 'border-2 border-brand-orange' : ''}>
                {'recommended' in selectedPlanConfig && selectedPlanConfig.recommended && (
                  <div className="bg-brand-orange text-white text-center py-2 text-sm font-medium rounded-t-lg">
                    Most Popular Gift
                  </div>
                )}
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="bg-brand-orange/10 p-3 rounded-full">
                      {selectedPlanConfig.icon}
                    </div>
                  </div>
                  <CardTitle className="text-2xl">{selectedPlanConfig.title}</CardTitle>
                  <div className="text-3xl font-bold text-brand-orange mb-2">
                    {selectedPlanConfig.price}
                  </div>
                  <p className="text-sm text-gray-600">One-time payment for 12-month gift</p>
                  <CardDescription className="text-base">
                    {selectedPlanConfig.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {selectedPlanConfig.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <CheckIcon className="h-5 w-5 text-brand-orange flex-shrink-0 mr-3 mt-0.5" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="mt-6 pt-6 border-t">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => navigate('/gift')}
                    >
                      Change Plan
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default GiftCheckout;