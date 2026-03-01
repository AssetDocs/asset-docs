import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Mail, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const SubscriptionSuccess: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [status, setStatus] = useState<'loading' | 'confirmed' | 'already_active' | 'error'>('loading');
  const [customerEmail, setCustomerEmail] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  useEffect(() => {
    if (!sessionId) {
      navigate('/pricing', { replace: true });
      return;
    }

    const finalize = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('finalize-checkout', {
          body: { session_id: sessionId },
        });

        if (error) throw error;

        if (data?.success) {
          setCustomerEmail(data.email ?? null);

          // If user is already logged in, route to dashboard
          if (user) {
            setStatus('already_active');
            setTimeout(() => navigate('/account', { replace: true }), 2000);
          } else {
            setStatus('confirmed');
          }
        } else {
          throw new Error(data?.error || 'Unknown error from finalize-checkout');
        }
      } catch (err: any) {
        console.error('[SubscriptionSuccess] finalize-checkout error:', err);
        setErrorMessage(err.message || 'Something went wrong. Please contact support.');
        setStatus('error');
      }
    };

    finalize();
  }, [sessionId, user, navigate]);

  if (status === 'loading') {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center px-4">
        <Card className="text-center max-w-md w-full">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <Loader2 className="h-16 w-16 text-primary animate-spin" />
            </div>
            <CardTitle className="text-2xl">Activating Your Subscription…</CardTitle>
            <CardDescription className="text-base">Please wait just a moment.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (status === 'already_active') {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center px-4">
        <Card className="text-center max-w-md w-full">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl text-green-700">Subscription Active!</CardTitle>
            <CardDescription className="text-base">Redirecting to your dashboard…</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center px-4">
        <Card className="text-center max-w-md w-full">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <AlertCircle className="h-16 w-16 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Something Went Wrong</CardTitle>
            <CardDescription className="text-base">
              {errorMessage}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Your payment may still have been processed. Please contact support at{' '}
              <a href="mailto:support@getassetsafe.com" className="text-primary underline">
                support@getassetsafe.com
              </a>{' '}
              if you need help.
            </p>
            <Button variant="outline" onClick={() => navigate('/pricing')}>Back to Pricing</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // status === 'confirmed' — user not logged in, magic link sent
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center px-4">
      <Card className="text-center max-w-lg w-full">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl text-green-700">Payment Confirmed!</CardTitle>
          <CardDescription className="text-lg">
            Finish setup via your email link.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3 text-left">
            <Mail className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-blue-800 text-sm">Check your inbox</p>
              <p className="text-blue-700 text-sm mt-1">
                We sent a sign-in link to{' '}
                <strong>{customerEmail || 'the email you used at checkout'}</strong>.
                Click it to access your dashboard.
              </p>
            </div>
          </div>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>• Check your spam / junk folder if you don't see the email</p>
            <p>• The link is valid for 1 hour</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionSuccess;
