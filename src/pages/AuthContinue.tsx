import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Loader2, ShieldCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const AuthContinue = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleContinue = async () => {
    if (!sessionId || loading) return;
    setLoading(true);
    setError(false);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('mint-magic-link', {
        body: { session_id: sessionId },
      });

      if (invokeError || !data?.redirect_url) {
        throw invokeError || new Error('missing_redirect_url');
      }

      window.location.assign(data.redirect_url);
    } catch (err) {
      console.error('[AuthContinue] unable to mint sign-in link:', err);
      setError(true);
      setLoading(false);
    }
  };

  if (!sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
        <Card className="max-w-lg w-full text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <AlertCircle className="h-14 w-14 text-amber-500" />
            </div>
            <CardTitle className="text-2xl">Sign-in link unavailable</CardTitle>
            <CardDescription className="text-base">
              Open the newest Asset Safe email or return to sign in.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/auth', { replace: true })} className="w-full">
              Return to sign in
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <Card className="max-w-lg w-full text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <ShieldCheck className="h-14 w-14 text-primary" />
          </div>
          <CardTitle className="text-2xl">Continue to Asset Safe</CardTitle>
          <CardDescription className="text-base">
            Your payment is confirmed. Continue to finish setting up your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleContinue} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Opening secure sign-in...
              </>
            ) : (
              'Continue'
            )}
          </Button>
          {error && (
            <p className="text-sm text-destructive">
              We could not open setup from this link. Use the resend option from your payment confirmation page or email support@getassetsafe.com.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthContinue;
