import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Gift, CheckCircle, Loader2, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const formSchema = z.object({
  giftCode: z.string().min(1, 'Gift code is required'),
});

const GiftClaim: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [giftDetails, setGiftDetails] = useState<any>(null);

  // Accept both ?code= and ?gift_code= params
  const codeFromUrl = searchParams.get('code') || searchParams.get('gift_code') || '';

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      giftCode: codeFromUrl,
    },
  });

  // Auto-attempt claim if user is logged in and code is in URL
  useEffect(() => {
    if (user && codeFromUrl && !claimSuccess) {
      form.setValue('giftCode', codeFromUrl);
      handleClaim(codeFromUrl);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, codeFromUrl]);

  // If not logged in but code is present, pre-fill and wait
  useEffect(() => {
    if (!user && codeFromUrl) {
      form.setValue('giftCode', codeFromUrl);
    }
  }, [codeFromUrl, form, user]);

  const handleClaim = async (code: string) => {
    if (!user) return;
    setIsLoading(true);
    try {
      // Get gift details preview first
      const { data: giftData, error: giftError } = await supabase.rpc('get_claimable_gift', {
        p_gift_code: code
      });

      if (giftError) throw giftError;

      if (!giftData || giftData.length === 0) {
        throw new Error('Gift code not found or not available for your account. Make sure you are logged in with the email the gift was sent to.');
      }

      setGiftDetails(giftData[0]);

      // Claim the gift
      const { data: claimResult, error: claimError } = await supabase.rpc('claim_gift_subscription', {
        p_gift_code: code
      });

      if (claimError) throw claimError;

      const result = claimResult as { success: boolean; error?: string; message?: string };

      if (!result.success) {
        throw new Error(result.error || 'Failed to claim gift');
      }

      setClaimSuccess(true);
      toast({
        title: "Gift Claimed Successfully!",
        description: "Your subscription has been activated. Welcome to Asset Safe!",
      });

      setTimeout(() => navigate('/account'), 3000);

    } catch (error) {
      console.error('Error claiming gift:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to claim gift. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in or create an account to claim your gift.",
        variant: "destructive",
      });
      return;
    }
    await handleClaim(values.giftCode);
  };

  // Build auth redirect URLs that return here with the code
  const redeemUrl = codeFromUrl ? `/gift-claim?code=${codeFromUrl}` : '/gift-claim';
  const loginUrl = `/auth?redirect=${encodeURIComponent(redeemUrl)}`;
  const signupUrl = `/signup?redirect=${encodeURIComponent(redeemUrl)}`;

  if (claimSuccess) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1 bg-secondary/5 py-16">
          <div className="container mx-auto px-4 max-w-2xl">
            <Card className="text-center">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <CheckCircle className="h-16 w-16 text-green-500" />
                </div>
                <CardTitle className="text-2xl text-green-700">Gift Claimed Successfully!</CardTitle>
                <CardDescription className="text-lg">
                  Welcome to Asset Safe — your subscription is now active
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {giftDetails && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h3 className="font-semibold text-green-800 mb-2">
                      {giftDetails.plan_type
                        ? giftDetails.plan_type.charAt(0).toUpperCase() + giftDetails.plan_type.slice(1)
                        : 'Standard'}{' '}Plan Activated
                    </h3>
                    <p className="text-green-700 text-sm mb-2">
                      Gift from: {giftDetails.purchaser_name}
                    </p>
                    {giftDetails.gift_message && (
                      <div className="bg-white rounded-lg p-3 mt-3">
                        <p className="text-sm text-gray-700 italic">"{giftDetails.gift_message}"</p>
                      </div>
                    )}
                  </div>
                )}
                <p className="text-muted-foreground">
                  Redirecting you to your dashboard in a few seconds...
                </p>
                <Button onClick={() => navigate('/account')} size="lg" className="w-full">
                  Go to Dashboard Now
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1 bg-secondary/5 py-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Gift className="h-8 w-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl">Claim Your Gift Subscription</CardTitle>
              <CardDescription>
                {codeFromUrl
                  ? 'Your gift code was automatically detected.'
                  : 'Enter your gift code to activate your Asset Safe subscription'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Not logged in + code in URL → clear CTA */}
              {!user && codeFromUrl && (
                <Alert className="mb-6">
                  <Lock className="h-4 w-4" />
                  <AlertDescription>
                    Sign in or create an account to redeem your gift.
                    <div className="flex flex-col sm:flex-row gap-2 mt-3">
                      <Button asChild size="sm">
                        <Link to={signupUrl}>Create Account & Redeem</Link>
                      </Button>
                      <Button asChild variant="outline" size="sm">
                        <Link to={loginUrl}>Log In to Redeem</Link>
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Not logged in + no code → generic prompt */}
              {!user && !codeFromUrl && (
                <Alert className="mb-6">
                  <AlertDescription>
                    You need to be logged in to claim your gift.{' '}
                    <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/auth')}>
                      Sign in or create an account
                    </Button>{' '}
                    first.
                  </AlertDescription>
                </Alert>
              )}

              {/* Auto-claiming spinner */}
              {user && codeFromUrl && isLoading && (
                <div className="flex items-center justify-center gap-2 py-4 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Claiming your gift…</span>
                </div>
              )}

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="giftCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gift Code</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your gift code (e.g., GIFT-XXXXXXXXXX)"
                            {...field}
                            className="uppercase"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={isLoading || !user}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Claiming Gift…
                      </>
                    ) : (
                      'Claim Gift'
                    )}
                  </Button>
                </form>
              </Form>

              <div className="mt-6 text-center text-sm text-muted-foreground">
                <p>
                  Don't have a gift code?{' '}
                  <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/gift')}>
                    Purchase a gift subscription
                  </Button>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default GiftClaim;
