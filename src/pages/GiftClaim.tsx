import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
import { Gift, CheckCircle, Loader2 } from 'lucide-react';
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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      giftCode: searchParams.get('gift_code') || '',
    },
  });

  // Check for claimable gifts on mount if user is logged in
  useEffect(() => {
    const checkClaimableGifts = async () => {
      if (!user) return;

      try {
        const { data: gifts, error } = await supabase.rpc('get_recipient_gifts');
        if (error) throw error;

        const claimableGifts = gifts?.filter(gift => !gift.redeemed && gift.status === 'paid');
        if (claimableGifts && claimableGifts.length > 0) {
          // Auto-fill with the first claimable gift code
          form.setValue('giftCode', claimableGifts[0].gift_code);
        }
      } catch (error) {
        console.error('Error checking claimable gifts:', error);
      }
    };

    checkClaimableGifts();
  }, [user, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in or create an account to claim your gift.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    setIsLoading(true);
    try {
      // First, get gift details to show them
      const { data: giftData, error: giftError } = await supabase.rpc('get_claimable_gift', {
        p_gift_code: values.giftCode
      });

      if (giftError) throw giftError;

      if (!giftData || giftData.length === 0) {
        throw new Error('Gift code not found or not available for your account');
      }

      setGiftDetails(giftData[0]);

      // Claim the gift
      const { data: claimResult, error: claimError } = await supabase.rpc('claim_gift_subscription', {
        p_gift_code: values.giftCode
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

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/properties');
      }, 3000);

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
                  Welcome to Asset Safe - Your subscription is now active
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {giftDetails && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h3 className="font-semibold text-green-800 mb-2">
                      {giftDetails.plan_type.charAt(0).toUpperCase() + giftDetails.plan_type.slice(1)} Plan Activated
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

                <p className="text-gray-600">
                  Redirecting you to your dashboard in a few seconds...
                </p>

                <Button onClick={() => navigate('/properties')} size="lg" className="w-full">
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
                <div className="bg-brand-orange/10 p-3 rounded-full">
                  <Gift className="h-8 w-8 text-brand-orange" />
                </div>
              </div>
              <CardTitle className="text-2xl">Claim Your Gift Subscription</CardTitle>
              <CardDescription>
                Enter your gift code to activate your Asset Safe subscription
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!user && (
                <Alert className="mb-6">
                  <AlertDescription>
                    You need to be logged in to claim your gift. Please{' '}
                    <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/auth')}>
                      sign in or create an account
                    </Button>{' '}
                    first.
                  </AlertDescription>
                </Alert>
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
                        Claiming Gift...
                      </>
                    ) : (
                      'Claim Gift'
                    )}
                  </Button>
                </form>
              </Form>

              <div className="mt-6 text-center text-sm text-gray-600">
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