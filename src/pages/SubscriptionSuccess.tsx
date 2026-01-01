import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const SubscriptionSuccess: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);
  
  const planType = searchParams.get('plan') || 'standard';

  // Prevent back navigation
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      window.history.pushState(null, '', window.location.pathname);
    };

    window.history.pushState(null, '', window.location.pathname);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Initiate Stripe checkout after email verification
  useEffect(() => {
    const initiateCheckout = async () => {
      if (user && user.email_confirmed_at && !isCreatingCheckout) {
        setIsCreatingCheckout(true);
        
        try {
          const { data, error } = await supabase.functions.invoke('create-checkout', {
            body: { planType }
          });

          if (error) throw error;
          
          if (data?.url) {
            // Redirect to Stripe checkout
            window.location.href = data.url;
          } else {
            throw new Error('No checkout URL returned');
          }
        } catch (error: any) {
          console.error('Error creating checkout:', error);
          toast({
            title: "Error",
            description: "Failed to create checkout session. Please try again from your account settings.",
            variant: "destructive",
          });
          // Redirect to account settings on error
          navigate('/account/settings?tab=subscription');
        }
      }
    };

    initiateCheckout();
  }, [user, planType, isCreatingCheckout, navigate, toast]);

  const handleEmailVerificationComplete = () => {
    // Refresh the page to trigger checkout
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen py-12 px-4">
        <div className="max-w-2xl w-full">
          {isCreatingCheckout ? (
            <Card className="text-center">
              <CardContent className="py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <h2 className="text-xl font-semibold mb-2">Setting Up Your Subscription</h2>
                <p className="text-muted-foreground">Redirecting you to secure payment...</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="text-center">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <CheckCircle className="h-16 w-16 text-green-500" />
                </div>
                <CardTitle className="text-2xl text-green-700">Email Verified!</CardTitle>
                <CardDescription className="text-lg">
                  Please complete your payment to activate your subscription
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Your email has been verified. You will be redirected to complete your subscription payment shortly.
                  </p>
                  
                  {/* Email Verification Step */}
                  {user && !user.email_confirmed_at && (
                    <Alert className="border-blue-200 bg-blue-50">
                      <Mail className="h-4 w-4" />
                      <AlertDescription className="text-left">
                        <div className="space-y-3">
                          <div>
                            <strong className="text-blue-800">Important: Check Your Email</strong>
                            <p className="text-blue-700 mt-1">
                              We've sent a verification email to <strong>{user.email}</strong>. 
                              Please check your inbox and click the verification link to complete your account setup.
                            </p>
                          </div>
                          <div className="text-sm text-blue-600">
                            <p>• Check your spam/junk folder if you don't see the email</p>
                            <p>• The verification link will activate your subscription checkout</p>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={handleEmailVerificationComplete}
                            className="mt-2"
                          >
                            I've Verified My Email
                          </Button>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionSuccess;
