import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Shield, Gift, CheckIcon, CalendarIcon, AlertCircle, Mail, Ticket } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const deliveryMethods = ['recipient_email', 'purchaser_code'] as const;

const formSchema = z.object({
  deliveryMethod: z.enum(deliveryMethods),
  fromName: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  purchaserEmail: z.string().email('Invalid email address').max(255),
  recipientEmail: z.string().max(255).optional(),
  recipientName: z.string().max(100).optional(),
  giftMessage: z.string().max(1000).optional(),
  deliveryDate: z.string().optional(),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: 'You must agree to the Terms of Service and Subscription Agreement to continue.',
  }),
}).superRefine((values, ctx) => {
  if (values.deliveryMethod !== 'recipient_email') return;

  if (!values.recipientEmail) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['recipientEmail'],
      message: 'Recipient email is required',
    });
  } else if (!z.string().email().safeParse(values.recipientEmail).success) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['recipientEmail'],
      message: 'Invalid recipient email address',
    });
  }

  if (!values.deliveryDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['deliveryDate'],
      message: 'Please select a delivery option',
    });
  }
});

type FormValues = z.infer<typeof formSchema>;

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Failed to create checkout session. Please try again.";

const GIFT_FEATURES = [
  "Unlimited properties",
  "25GB secure cloud storage",
  "Legacy Locker + Authorized Users",
  "Emergency Access Sharing",
  "Photo, video & document uploads",
  "Secure Vault & Password Catalog",
  "Voice notes, damage reports, exports",
  "Full platform access — everything included",
];

const GiftCheckout: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [consentError, setConsentError] = useState('');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      deliveryMethod: 'recipient_email',
      fromName: [profile?.first_name, profile?.last_name].filter(Boolean).join(' '),
      purchaserEmail: user?.email || '',
      recipientEmail: '',
      recipientName: '',
      giftMessage: '',
      deliveryDate: '',
      agreeToTerms: false,
    },
  });

  const agreeToTerms = form.watch('agreeToTerms');
  const deliveryMethod = form.watch('deliveryMethod');
  const isPurchaserCode = deliveryMethod === 'purchaser_code';

  useEffect(() => {
    if (user?.email && !form.getValues('purchaserEmail')) {
      form.setValue('purchaserEmail', user.email);
    }
    const profileName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ');
    if (profileName && !form.getValues('fromName')) {
      form.setValue('fromName', profileName);
    }
  }, [form, profile?.first_name, profile?.last_name, user?.email]);

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setConsentError('');

    try {
      // Step 1: Log consent
      const { data: consentData, error: consentError } = await supabase.functions.invoke('log-consent', {
        body: {
          userEmail: values.purchaserEmail,
          consentType: 'gift_checkout',
          termsVersion: 'v1.0',
        },
      });

      if (consentError || !consentData?.success) {
        setConsentError('Failed to record consent. Please try again.');
        setIsLoading(false);
        return;
      }

      // Step 2: Create gift checkout session
      const { data, error } = await supabase.functions.invoke('create-gift-checkout', {
        body: {
          deliveryMethod: values.deliveryMethod,
          recipientEmail: values.deliveryMethod === 'recipient_email' ? values.recipientEmail : undefined,
          recipientName: values.recipientName || '',
          fromName: values.fromName,
          giftMessage: values.giftMessage || '',
          purchaserEmail: values.purchaserEmail,
          deliveryDate: values.deliveryMethod === 'recipient_email' ? values.deliveryDate : undefined,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      } else if (data?.error) {
        throw new Error(data.error);
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error: unknown) {
      console.error('Error creating gift checkout:', error);
      toast({
        title: "Checkout Failed",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <SEOHead
        title="Gift Asset Safe — Complete Your Purchase"
        description="Give a full year of Asset Safe access. Secure checkout powered by Stripe."
        canonicalUrl="https://getassetsafe.com/gift-checkout"
      />
      <Navbar />

      <main className="flex-grow bg-secondary/5 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-full mb-4">
                <Gift className="h-7 w-7 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Complete Your Gift Purchase</h1>
              <p className="text-muted-foreground">Give someone a full year of protection — no auto-renew.</p>
            </div>

            <div className="grid lg:grid-cols-5 gap-8">
              {/* Form Column */}
              <div className="lg:col-span-3">
                <Card>
                  <CardHeader>
                    <CardTitle>Gift Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                        {/* Your Information */}
                        <div className="space-y-4">
                          <h3 className="font-semibold text-foreground">Your Information</h3>
                          <FormField
                            control={form.control}
                            name="fromName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Your Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Jane Doe" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="purchaserEmail"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Your Email</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="jane@example.com" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="deliveryMethod"
                          render={({ field }) => (
                            <FormItem className="space-y-3 pt-2">
                              <FormLabel>How would you like to deliver this gift?</FormLabel>
                              <FormControl>
                                <RadioGroup
                                  value={field.value}
                                  onValueChange={(value) => {
                                    field.onChange(value);
                                    if (value === 'purchaser_code') {
                                      form.setValue('recipientEmail', '');
                                      form.setValue('recipientName', '');
                                      form.setValue('deliveryDate', '');
                                    }
                                  }}
                                  className="grid gap-3"
                                >
                                  <Label
                                    htmlFor="delivery-recipient-email"
                                    className={cn(
                                      "flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors",
                                      deliveryMethod === 'recipient_email' && "border-primary bg-primary/5"
                                    )}
                                  >
                                    <RadioGroupItem value="recipient_email" id="delivery-recipient-email" className="mt-1" />
                                    <Mail className="mt-0.5 h-5 w-5 text-primary" />
                                    <span className="space-y-1">
                                      <span className="block font-medium text-foreground">Email it to the recipient</span>
                                      <span className="block text-sm font-normal text-muted-foreground">
                                        We'll send the gift invitation directly to them now or on a scheduled date.
                                      </span>
                                    </span>
                                  </Label>
                                  <Label
                                    htmlFor="delivery-purchaser-code"
                                    className={cn(
                                      "flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors",
                                      deliveryMethod === 'purchaser_code' && "border-primary bg-primary/5"
                                    )}
                                  >
                                    <RadioGroupItem value="purchaser_code" id="delivery-purchaser-code" className="mt-1" />
                                    <Ticket className="mt-0.5 h-5 w-5 text-primary" />
                                    <span className="space-y-1">
                                      <span className="block font-medium text-foreground">Send the Gift Code to me</span>
                                      <span className="block text-sm font-normal text-muted-foreground">
                                        You'll receive a Gift Code and claim link that you can share whenever you're ready.
                                      </span>
                                    </span>
                                  </Label>
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Recipient Information */}
                        {!isPurchaserCode && (
                        <div className="space-y-4 pt-2">
                          <h3 className="font-semibold text-foreground">Recipient Information</h3>
                          <FormField
                            control={form.control}
                            name="recipientEmail"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Recipient Email</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="recipient@example.com" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="recipientName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Recipient First Name <span className="text-muted-foreground font-normal">(Optional)</span></FormLabel>
                                <FormControl>
                                  <Input placeholder="Alex" {...field} />
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
                                <FormLabel>Gift Delivery</FormLabel>
                                <FormControl>
                                  <RadioGroup
                                    onValueChange={(value) => {
                                      if (value === 'now') {
                                        field.onChange(new Date().toISOString().split('T')[0]);
                                      } else {
                                        field.onChange('');
                                      }
                                    }}
                                    className="space-y-2"
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
                                              type="button"
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
                                                if (date) field.onChange(format(date, 'yyyy-MM-dd'));
                                              }}
                                              disabled={(date) => date <= new Date(new Date().setHours(0, 0, 0, 0))}
                                              initialFocus
                                              className="p-3 pointer-events-auto"
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
                        </div>
                        )}

                        <FormField
                          control={form.control}
                          name="giftMessage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Gift Message <span className="text-muted-foreground font-normal">(Optional)</span></FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder={isPurchaserCode ? "Add a personal note to include with your Gift Code..." : "Write a personal message for the recipient..."}
                                  className="resize-none"
                                  rows={3}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Consent Gate */}
                        <div className="pt-2 border-t border-border">
                          <FormField
                            control={form.control}
                            name="agreeToTerms"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    id="agree-terms"
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel htmlFor="agree-terms" className="text-sm font-normal cursor-pointer">
                                    I agree to the{' '}
                                    <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                                      Terms of Service, including the subscription terms
                                    </a>.
                                  </FormLabel>
                                  <FormMessage />
                                </div>
                              </FormItem>
                            )}
                          />
                        </div>

                        {consentError && (
                          <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{consentError}</AlertDescription>
                          </Alert>
                        )}

                        <Button
                          type="submit"
                          className="w-full"
                          disabled={!agreeToTerms || isLoading}
                          size="lg"
                        >
                          {isLoading ? 'Processing...' : 'Continue to Payment'}
                        </Button>

                        {!agreeToTerms && (
                          <p className="text-xs text-muted-foreground text-center">
                            You must agree to the Terms of Service and Subscription Agreement to continue.
                          </p>
                        )}
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </div>

              {/* Summary Column */}
              <div className="lg:col-span-2">
                <Card className="sticky top-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Gift className="h-5 w-5 text-primary" />
                      Gift – Asset Safe Plan
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-primary/5 rounded-lg p-4 text-center">
                      <p className="text-3xl font-bold text-foreground">$189</p>
                      <p className="text-sm text-muted-foreground">1 year · one-time payment</p>
                    </div>

                    <ul className="space-y-2">
                      {GIFT_FEATURES.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckIcon className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="border-t border-border pt-4 space-y-2">
                      <div className="flex items-start gap-2 text-xs text-muted-foreground">
                        <Shield className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>No auto-renew. Recipient opts in after gift expires.</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Secure payment powered by Stripe. Choose direct recipient email or receive a Gift Code to share yourself.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default GiftCheckout;
