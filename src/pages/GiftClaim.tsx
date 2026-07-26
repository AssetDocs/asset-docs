import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Gift, CheckCircle, Loader2, Lock, AlertCircle, Mail, ShieldCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useAccount } from '@/contexts/AccountContext';
import { useSubscription } from '@/contexts/SubscriptionContext';

const REASON_MESSAGES: Record<string, string> = {
  invalid_token: 'This gift link is invalid or has been replaced by a newer one. Ask the purchaser to resend it.',
  wrong_email: 'This gift was sent to a different email address. Verify that gifted email below, or sign in with that address.',
  verification_required: 'This gift was sent to a different email address. Verify that gifted email to apply it to this account.',
  verification_expired: 'That verification code has expired. Send a new code to continue.',
  invalid_verification_code: 'That verification code is not correct. Please check the email and try again.',
  too_many_attempts: 'Too many incorrect attempts. Send a new code to continue.',
  legacy_link_needs_resend: 'This older gift link is no longer valid. Ask the purchaser (or our support team) to resend a new link.',
  already_redeemed: 'This gift has already been redeemed.',
  expired: 'This gift has expired.',
  not_paid: 'The gift payment is still processing. Please try again in a minute.',
  not_claimable: 'This Gift Code is no longer claimable.',
  active_subscription_exists: 'This account already has an active paid subscription. The gift was not applied, so your current subscription remains unchanged.',
  invalid_input: 'Missing Gift Code.',
};

type GiftFunctionResult = {
  success?: boolean;
  reason?: string;
  recipient_email_masked?: string;
  expires_at?: string;
};

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Failed to redeem this gift. Please try again.';

const GiftClaim: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, refreshProfile } = useAuth();
  const { refreshAccount } = useAccount();
  const { refreshSubscription } = useSubscription();

  const code = searchParams.get('code') || searchParams.get('gift_code') || '';
  const token = searchParams.get('token') || '';

  const [manualCode, setManualCode] = useState(code);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationRequired, setVerificationRequired] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [maskedRecipientEmail, setMaskedRecipientEmail] = useState<string | null>(null);
  const [verificationExpiresAt, setVerificationExpiresAt] = useState<string | null>(null);
  const [isStartingVerification, setIsStartingVerification] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);

  const activeCode = (manualCode.trim() || code).toUpperCase();
  const redeemUrl = `/gift-claim?code=${encodeURIComponent(activeCode)}${token ? `&token=${encodeURIComponent(token)}` : ''}`;
  const loginUrl = `/auth?redirect=${encodeURIComponent(redeemUrl)}`;
  const signupUrl = `/signup?redirect=${encodeURIComponent(redeemUrl)}`;
  const activeSubscriptionBlocked = error === REASON_MESSAGES.active_subscription_exists;

  const finishSuccessfulClaim = useCallback(async () => {
    if (user?.id) {
      const { error: setupError } = await supabase
        .from('profiles')
        .update({
          password_set: true,
          onboarding_complete: true,
        } as any)
        .eq('user_id', user.id);

      if (setupError) {
        console.warn('[GiftClaim] Could not normalize recipient setup flags:', setupError);
      }

      await refreshProfile();
      await refreshAccount();
      await refreshSubscription();
    }

    setSuccess(true);
    toast({ title: 'Gift Claimed!', description: 'Your subscription is now active.' });
    setTimeout(() => navigate('/account', { replace: true }), 2500);
  }, [navigate, refreshAccount, refreshProfile, refreshSubscription, toast, user?.id]);

  const startEmailVerification = useCallback(async () => {
    if (!user || !activeCode || !token) return;

    setIsStartingVerification(true);
    setError(null);
    try {
      const { data, error: invErr } = await supabase.functions.invoke('start-gift-email-verification', {
        body: { code: activeCode, token },
      });
      if (invErr) throw invErr;

      const result = data as GiftFunctionResult;
      if (result?.success) {
        if (result.recipient_email_masked) setMaskedRecipientEmail(result.recipient_email_masked);
        if (result.expires_at) setVerificationExpiresAt(result.expires_at);
        setVerificationRequired(result.recipient_email_masked ? true : verificationRequired);
        if (result.recipient_email_masked) {
          toast({
            title: 'Verification code sent',
            description: `Check ${result.recipient_email_masked} for a six-digit code.`,
          });
        }
      } else {
        setError(REASON_MESSAGES[result?.reason || ''] || 'Could not send the verification code.');
      }
    } catch (e: unknown) {
      setError(getErrorMessage(e));
    } finally {
      setIsStartingVerification(false);
    }
  }, [activeCode, token, toast, user, verificationRequired]);

  const handleClaim = useCallback(async () => {
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

      const result = data as GiftFunctionResult;
      if (result?.success) {
        await finishSuccessfulClaim();
      } else if (result?.reason === 'verification_required' || result?.reason === 'wrong_email') {
        setVerificationRequired(true);
        await startEmailVerification();
      } else {
        setError(REASON_MESSAGES[result?.reason || ''] || 'Failed to redeem this gift.');
      }
    } catch (e: unknown) {
      setError(getErrorMessage(e));
    } finally {
      setIsLoading(false);
    }
  }, [activeCode, finishSuccessfulClaim, startEmailVerification, token, user]);

  const handleVerifyCode = async () => {
    if (!user || !activeCode || verificationCode.length !== 6) {
      setError(REASON_MESSAGES.invalid_verification_code);
      return;
    }

    setIsVerifyingCode(true);
    setError(null);
    try {
      const { data, error: invErr } = await supabase.functions.invoke('verify-gift-email-code', {
        body: { code: activeCode, token, verificationCode },
      });
      if (invErr) throw invErr;

      const result = data as GiftFunctionResult;
      if (result?.success) {
        await finishSuccessfulClaim();
      } else {
        setError(REASON_MESSAGES[result?.reason || ''] || 'Could not verify that code.');
      }
    } catch (e: unknown) {
      setError(getErrorMessage(e));
    } finally {
      setIsVerifyingCode(false);
    }
  };

  useEffect(() => {
    if (user && code && activeCode && !success && !isLoading && !error && !verificationRequired) {
      handleClaim();
    }
  }, [activeCode, code, error, handleClaim, isLoading, success, user, verificationRequired]);

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
                    ? 'Sign in or create an account. If this gift was sent to another email you control, you can verify it here.'
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
                      setVerificationRequired(false);
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
                    Sign in or create an account to redeem your gift. Existing Asset Safe users can use their current account.
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

              {user && activeCode && isLoading && !verificationRequired && (
                <div className="flex items-center justify-center gap-2 py-6 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Claiming your gift...</span>
                </div>
              )}

              {user && activeCode && verificationRequired && (
                <div className="space-y-4 rounded-lg border bg-background p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-primary/10 p-2">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold">Verify the gifted email</h3>
                      <p className="text-sm text-muted-foreground">
                        Enter the six-digit code sent to {maskedRecipientEmail || 'the gifted email'} to apply this gift to your signed-in account.
                      </p>
                      {verificationExpiresAt && (
                        <p className="text-xs text-muted-foreground">
                          Code expires at {new Date(verificationExpiresAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gift-email-code">Verification Code</Label>
                    <Input
                      id="gift-email-code"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      value={verificationCode}
                      onChange={(event) => {
                        setVerificationCode(event.target.value.replace(/\D/g, '').slice(0, 6));
                        setError(null);
                      }}
                      placeholder="123456"
                      className="text-center text-lg tracking-[0.4em]"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      onClick={handleVerifyCode}
                      disabled={verificationCode.length !== 6 || isVerifyingCode}
                      className="flex-1"
                    >
                      {isVerifyingCode ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
                      Verify & Claim
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={startEmailVerification}
                      disabled={isStartingVerification}
                    >
                      {isStartingVerification ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                      Send New Code
                    </Button>
                  </div>
                </div>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-3">
                      <p>{error}</p>
                      {activeSubscriptionBlocked ? (
                        <div className="space-y-2">
                          <p className="font-medium">This gift has not been consumed. Keep the code or link for later, or contact support so we can help apply it appropriately.</p>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Button asChild variant="secondary" size="sm">
                              <a href="mailto:support@assetsafe.net?subject=Gift%20subscription%20help">Contact support</a>
                            </Button>
                            <Button type="button" variant="outline" size="sm" onClick={() => navigate('/account')}>
                              Return to account
                            </Button>
                          </div>
                        </div>
                      ) : (
                        user && activeCode && (
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setError(null);
                              handleClaim();
                            }}
                          >
                            Try Again
                          </Button>
                        )
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {user && activeCode && !isLoading && !verificationRequired && (
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
