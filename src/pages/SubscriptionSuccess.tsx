import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Mail, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const MAX_POLL_ATTEMPTS = 10;
const POLL_INTERVAL_MS = 2000; // 2s between attempts → up to ~20s total

const SubscriptionSuccess: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [syncComplete, setSyncComplete] = useState(false);
  const [pollTimedOut, setPollTimedOut] = useState(false);
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);
  
  const planType = searchParams.get('plan') || 'standard';
  const sessionId = searchParams.get('session_id');

  // Prevent back navigation
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      window.history.pushState(null, '', window.location.pathname);
    };
    window.history.pushState(null, '', window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Poll check-subscription until active, then redirect
  useEffect(() => {
    if (!user || !sessionId || syncComplete || pollTimedOut) return;

    let attempt = 0;
    let cancelled = false;

    const poll = async () => {
      while (attempt < MAX_POLL_ATTEMPTS && !cancelled) {
        attempt++;
        console.log(`[SubscriptionSuccess] Poll attempt ${attempt}/${MAX_POLL_ATTEMPTS}`);

        try {
          const { data, error } = await supabase.functions.invoke('check-subscription');
          if (!error && data?.subscribed) {
            if (cancelled) return;
            setSyncComplete(true);
            toast({
              title: "Subscription Activated!",
              description: `Your ${data.subscription_tier || planType} plan is now active.`,
            });
            navigate('/account');
            return;
          }
        } catch (err) {
          console.error('[SubscriptionSuccess] Poll error:', err);
        }

        // If not last attempt, try sync-subscription once halfway through
        if (attempt === Math.ceil(MAX_POLL_ATTEMPTS / 2)) {
          try {
            console.log('[SubscriptionSuccess] Triggering sync-subscription fallback');
            await supabase.functions.invoke('sync-subscription');
          } catch {}
        }

        if (!cancelled && attempt < MAX_POLL_ATTEMPTS) {
          await new Promise(r => setTimeout(r, POLL_INTERVAL_MS));
        }
      }

      if (!cancelled) {
        console.log('[SubscriptionSuccess] Polling timed out');
        setPollTimedOut(true);
      }
    };

    poll();
    return () => { cancelled = true; };
  }, [user, sessionId, syncComplete, pollTimedOut, navigate, toast, planType]);

  // Initiate Stripe checkout for users who haven't paid yet
  useEffect(() => {
    if (sessionId) return;
    if (user && user.email_confirmed_at && !isCreatingCheckout) {
      setIsCreatingCheckout(true);
      const lookupKey = `${planType}_monthly`;
      supabase.functions.invoke('create-checkout', { body: { planLookupKey: lookupKey } })
        .then(({ data, error }) => {
          if (error || !data?.url) {
            toast({ title: "Error", description: "Failed to create checkout session.", variant: "destructive" });
            navigate('/account/settings?tab=subscription');
          } else {
            window.location.href = data.url;
          }
        });
    }
  }, [user, planType, isCreatingCheckout, navigate, toast, sessionId]);

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
                    : pollTimedOut
                      ? "Activation is taking longer than expected."
                      : "Please wait while we set up your account."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!syncComplete && !pollTimedOut && (
                  <p className="text-muted-foreground">This usually takes just a moment.</p>
                )}
                {pollTimedOut && (
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      Your payment was received. It may take a moment for your account to update.
                    </p>
                    <Button onClick={() => navigate('/account')} size="lg">
                      Go to Dashboard
                    </Button>
                  </div>
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
                              Please check your inbox and click the verification link.
                            </p>
                          </div>
                          <div className="text-sm text-blue-600">
                            <p>• Check your spam/junk folder if you don't see the email</p>
                            <p>• The verification link will activate your subscription checkout</p>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="mt-2">
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
