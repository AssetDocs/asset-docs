import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Gift, Mail, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const GiftSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [emailSent, setEmailSent] = useState(false);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const sendGiftEmail = async () => {
      if (!sessionId) {
        setIsLoading(false);
        return;
      }

      try {
        // Get gift details from database using session ID
        const { data: giftSub, error: fetchError } = await supabase
          .from('gift_subscriptions')
          .select('*')
          .eq('stripe_session_id', sessionId)
          .single();

        if (fetchError || !giftSub) {
          throw new Error('Gift subscription not found');
        }

        // Send gift email to recipient
        const { error: emailError } = await supabase.functions.invoke('send-gift-email', {
          body: {
            giftCode: giftSub.gift_code,
            sessionId: sessionId
          }
        });

        if (emailError) {
          throw emailError;
        }

        setEmailSent(true);
      } catch (error) {
        console.error('Error sending gift email:', error);
        toast({
          title: "Notice",
          description: "Your gift purchase was successful, but there was an issue sending the notification email. The recipient can still claim their gift.",
          variant: "default",
        });
      } finally {
        setIsLoading(false);
      }
    };

    sendGiftEmail();
  }, [sessionId, toast]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="flex-1 bg-secondary/5 py-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                {isLoading ? (
                  <Loader2 className="h-16 w-16 text-brand-orange animate-spin" />
                ) : (
                  <CheckCircle className="h-16 w-16 text-green-500" />
                )}
              </div>
              <CardTitle className="text-2xl text-green-700">
                {isLoading ? 'Processing Your Gift...' : 'Gift Purchase Successful!'}
              </CardTitle>
              <CardDescription className="text-lg">
                {isLoading ? 'Sending gift notification to recipient' : 'Your gift subscription has been purchased'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!isLoading && (
                <>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <Gift className="h-8 w-8 text-green-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-green-800 mb-2">Gift Successfully Sent!</h3>
                    <p className="text-green-700 text-sm mb-4">
                      {emailSent 
                        ? "The recipient has been notified via email with instructions to claim their gift."
                        : "Your gift has been processed successfully. The recipient will receive their gift notification shortly."}
                    </p>
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <Mail className="h-4 w-4" />
                      <span className="text-sm">Email notification sent</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-800">What happens next?</h4>
                    <div className="text-left space-y-2 text-sm text-gray-600">
                      <div className="flex items-start gap-2">
                        <span className="bg-brand-orange text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                        <span>The recipient will receive a welcome email with their gift code and redemption instructions</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="bg-brand-orange text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                        <span>They'll create their Asset Docs account using the gift code</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="bg-brand-orange text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                        <span>Their 12-month subscription will be activated immediately</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link to="/gift" className="flex-1">
                      <Button variant="outline" size="lg" className="w-full">
                        Give Another Gift
                      </Button>
                    </Link>
                    <Link to="/" className="flex-1">
                      <Button size="lg" className="w-full">
                        Return Home
                      </Button>
                    </Link>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default GiftSuccess;