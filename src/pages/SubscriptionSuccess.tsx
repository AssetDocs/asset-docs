import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Mail, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const SubscriptionSuccess: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncComplete, setSyncComplete] = useState(false);
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);
  
  const planType = searchParams.get('plan') || 'standard';
  const sessionId = searchParams.get('session_id'); // From Stripe redirect

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

  // Smart sync: check-subscription first, only sync if stale
  useEffect(() => {
    const activateSubscription = async () => {
      if (!user || !sessionId || isSyncing || syncComplete) return;
      
      setIsSyncing(true);
      console.log('[SubscriptionSuccess] Checking subscription after checkout...');
      
      try {
        // First try check-subscription (reads from entitlements)
        const { data: checkData, error: checkError } = await supabase.functions.invoke('check-subscription');
        
        if (!checkError && checkData?.subscribed) {
          console.log('[SubscriptionSuccess] Entitlements already updated by webhook');
          setSyncComplete(true);
          toast({
            title: "Subscription Activated!",
            description: `Your ${checkData?.subscription_tier || planType} plan is now active.`,
          });
          setTimeout(() => navigate('/account'), 1500);
          return;
        }

        // Entitlements not yet updated - call sync as fallback
        console.log('[SubscriptionSuccess] Entitlements stale, syncing...');
        const { data, error } = await supabase.functions.invoke('sync-subscription');
        
        if (error) {
          toast({ title: "Syncing subscription...", description: "Please wait while we activate your account." });
        } else {
          setSyncComplete(true);
          toast({
            title: "Subscription Activated!",
            description: `Your ${data?.plan || planType} plan is now active.`,
          });
          setTimeout(() => navigate('/account'), 1500);
        }
      } catch (err) {
        console.error('[SubscriptionSuccess] Sync exception:', err);
      } finally {
        setIsSyncing(false);
      }
    };

    activateSubscription();
  }, [user, sessionId, isSyncing, syncComplete, navigate, toast, planType]);

  // Initiate Stripe checkout for users who haven't paid yet
  useEffect(() => {
    const initiateCheckout = async () => {
      // Skip if we're returning from Stripe (have session_id)
      if (sessionId) return;
      
      if (user && user.email_confirmed_at && !isCreatingCheckout) {
        setIsCreatingCheckout(true);
        
        try {
          const lookupKey = `${planType}_monthly`;
          const { data, error } = await supabase.functions.invoke('create-checkout', {
            body: { planLookupKey: lookupKey }
          });

          if (error) throw error;
          
          if (data?.url) {
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
          navigate('/account/settings?tab=subscription');
        }
      }
    };

    initiateCheckout();
  }, [user, planType, isCreatingCheckout, navigate, toast, sessionId]);

  const handleEmailVerificationComplete = () => {
    window.location.reload();
  };

  // Returning from Stripe - show sync status
  if (sessionId) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen py-12 px-4">
          <div className="max-w-2xl w-full">
            <Card className="text-center">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  {syncComplete ? (
                    <CheckCircle className="h-16 w-16 text-green-500" />
                  ) : (
                    <Loader2 className="h-16 w-16 text-primary animate-spin" />
                  )}
                </div>
                <CardTitle className="text-2xl text-green-700">
                  {syncComplete ? "Payment Successful!" : "Activating Your Subscription..."}
                </CardTitle>
                <CardDescription className="text-lg">
                  {syncComplete 
                    ? "Your subscription is now active. Redirecting to your dashboard..." 
                    : "Please wait while we set up your account."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!syncComplete && (
                  <p className="text-muted-foreground">
                    This usually takes just a moment.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

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
