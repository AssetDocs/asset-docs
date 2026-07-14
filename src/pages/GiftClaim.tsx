import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Gift, CheckCircle, Loader2, Lock, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const REASON_MESSAGES: Record<string, string> = {
  invalid_token: 'This gift link is invalid or has been replaced by a newer one. Ask the purchaser to resend it.',
  wrong_email: 'This gift can only be redeemed by the email address it was sent to. Please sign in with that address.',
  legacy_link_needs_resend: 'This older gift link is no longer valid. Ask the purchaser (or our support team) to resend a new link.',
  already_redeemed: 'This gift has already been redeemed.',
  expired: 'This gift has expired.',
  not_paid: 'The gift payment is still processing. Please try again in a minute.',
  not_claimable: 'This Gift Code is no longer claimable.',
  invalid_input: 'Missing Gift Code.',
};

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Failed to redeem this gift. Please try again.';

const GiftClaim: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const code = searchParams.get('code') || searchParams.get('gift_code') || '';
  const token = searchParams.get('token') || '';

  const [manualCode, setManualCode] = useState(code);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeCode = (manualCode.trim() || code).toUpperCase();
  const redeemUrl = `/gift-claim?code=${encodeURIComponent(activeCode)}${token ? `&token=${encodeURIComponent(token)}` : ''}`;
  const loginUrl = `/auth?redirect=${encodeURIComponent(redeemUrl)}`;
  const signupUrl = `/signup?redirect=${encodeURIComponent(redeemUrl)}`;

  const handleClaim = async () => {
    if (!user) return;
    if (!activeCode) {
      setError(REASON_MESSAGES.invalid_input);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: invErr } = await supabase.functions.invoke('redeem-gift', {
        body: { code: activeCode, token: token || undefined },
      });
      if (invErr) throw invErr;
      const result = data as { success: boolean; reason?: string };
      if (result?.success) {
        setSuccess(true);
        toast({ title: 'Gift Claimed!', description: 'Your subscription is now active.' });
        setTimeout(() => navigate('/account'), 2500);
      } else {
        setError(REASON_MESSAGES[result?.reason || ''] || 'Failed to redeem this gift.');
      }
    } catch (e: unknown) {
      setError(getErrorMessage(e));
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-claim once signed in
  useEffect(() => {
    if (user && code && activeCode && !success && !isLoading && !error) {
      handleClaim();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, activeCode, token]);

  if (success) {
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
                <CardDescription className="text-lg">Your Asset Safe subscription is now active.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => navigate('/account')} size="lg" className="w-full">
                  Go to Dashboard
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
                {activeCode
                  ? token
                    ? 'Sign in with the email address the gift was sent to.'
                    : 'Sign in or create an account to claim this Gift Code.'
                  : 'Enter your Gift Code to start claiming your subscription.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!code && (
                <div className="space-y-2">
                  <Label htmlFor="gift-code">Gift Code</Label>
                  <Input
                    id="gift-code"
                    value={manualCode}
                    onChange={(event) => {
                      setManualCode(event.target.value);
                      setError(null);
                    }}
                    placeholder="GIFT-XXXXXXXXXX"
                    autoCapitalize="characters"
                  />
                </div>
              )}

              {!user && activeCode && (
                <Alert>
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

              {user && activeCode && isLoading && (
                <div className="flex items-center justify-center gap-2 py-6 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Claiming your gift…</span>
                </div>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {user && activeCode && !isLoading && (
                <Button onClick={handleClaim} className="w-full" size="lg">
                  Claim Gift
                </Button>
              )}

              <div className="text-center text-sm text-muted-foreground pt-2">
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
