import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Gift, CheckIcon, AlertCircle, Loader2, Lock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

type LegacyGift = {
  id: string;
  from_name: string;
  gift_message: string | null;
  expires_at: string | null;
  term: string;
  status: string;
  redeemed: boolean;
};

type PageState = 'loading' | 'redirecting' | 'legacy_valid' | 'invalid' | 'expired' | 'already_redeemed' | 'success';

/**
 * Legacy /redeem?token= route.
 * Attempts to resolve the token to a gift_subscriptions gift_code and redirects
 * to /gift-claim?code=<gift_code>. Falls back to inline legacy redemption if
 * no gift_subscriptions record exists (purely old data).
 */
const GiftRedeem: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const token = searchParams.get('token');
  const [pageState, setPageState] = useState<PageState>('loading');
  const [legacyGift, setLegacyGift] = useState<LegacyGift | null>(null);
  const [isRedeeming, setIsRedeeming] = useState(false);

  useEffect(() => {
    if (!token) {
      setPageState('invalid');
      return;
    }
    resolveToken();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const resolveToken = async () => {
    try {
      // 1. Look up legacy gifts table
      const { data: giftData, error } = await (supabase as any)
        .from('gifts')
        .select('id, from_name, gift_message, expires_at, term, status, redeemed, stripe_checkout_session_id')
        .eq('token', token)
        .maybeSingle();

      if (error || !giftData) {
        setPageState('invalid');
        return;
      }

      if (giftData.redeemed || giftData.status === 'redeemed') {
        setPageState('already_redeemed');
        return;
      }

      if (giftData.status !== 'paid') {
        setPageState('invalid');
        return;
      }

      if (giftData.expires_at && new Date(giftData.expires_at) < new Date()) {
        setPageState('expired');
        return;
      }

      // 2. Try to find a corresponding gift_subscriptions record
      if (giftData.stripe_checkout_session_id) {
        const { data: gsSub } = await (supabase as any)
          .from('gift_subscriptions')
          .select('gift_code')
          .eq('stripe_checkout_session_id', giftData.stripe_checkout_session_id)
          .eq('redeemed', false)
          .maybeSingle();

        if (gsSub?.gift_code) {
          // Redirect to unified claim route
          setPageState('redirecting');
          navigate(`/gift-claim?code=${gsSub.gift_code}`, { replace: true });
          return;
        }
      }

      // 3. No gift_subscriptions record — handle inline (pure legacy path)
      setLegacyGift(giftData);
      setPageState('legacy_valid');
    } catch (err) {
      console.error('Error resolving gift token:', err);
      setPageState('invalid');
    }
  };

  const handleLegacyRedeem = async () => {
    if (!user || !legacyGift) return;
    setIsRedeeming(true);

    try {
      const { error: giftError } = await (supabase as any)
        .from('gifts')
        .update({
          redeemed: true,
          redeemed_by_user_id: user.id,
          status: 'redeemed',
        })
        .eq('id', legacyGift.id)
        .eq('redeemed', false);

      if (giftError) throw giftError;

      const { error: entitlementError } = await supabase
        .from('entitlements')
        .upsert({
          user_id: user.id,
          plan: 'standard',
          status: 'active',
          billing_status: 'gifted',
          entitlement_source: 'admin',
          expires_at: legacyGift.expires_at,
          base_storage_gb: 25,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (entitlementError) throw entitlementError;

      setPageState('success');
      toast({
        title: "Gift Redeemed! 🎉",
        description: "Welcome to Asset Safe. Your full access is now active.",
      });
      setTimeout(() => navigate('/account'), 2500);
    } catch (error: any) {
      console.error('Legacy redemption error:', error);
      toast({
        title: "Redemption Failed",
        description: "Something went wrong. Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsRedeeming(false);
    }
  };

  const redeemUrl = `/redeem?token=${token}`;
  const loginUrl = `/auth?redirect=${encodeURIComponent(redeemUrl)}`;
  const signupUrl = `/signup?redirect=${encodeURIComponent(redeemUrl)}`;

  return (
    <div className="flex flex-col min-h-screen">
      <SEOHead
        title="Redeem Your Asset Safe Gift"
        description="You've received a gift subscription to Asset Safe. Redeem your access now."
        canonicalUrl="https://www.getassetsafe.com/redeem"
      />
      <Navbar />

      <main className="flex-grow bg-secondary/5 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">

            {(pageState === 'loading' || pageState === 'redirecting') && (
              <Card className="text-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {pageState === 'redirecting' ? 'Redirecting to claim page…' : 'Verifying your gift…'}
                </p>
              </Card>
            )}

            {pageState === 'invalid' && (
              <Card>
                <CardHeader className="text-center">
                  <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-2" />
                  <CardTitle>Invalid Gift Link</CardTitle>
                  <CardDescription>
                    This gift link is invalid or the gift has not been paid for yet.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button asChild><Link to="/pricing">View Plans</Link></Button>
                </CardContent>
              </Card>
            )}

            {pageState === 'expired' && (
              <Card>
                <CardHeader className="text-center">
                  <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-2" />
                  <CardTitle>Gift Has Expired</CardTitle>
                  <CardDescription>
                    This gift subscription has expired. Start your own subscription to get full access.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button asChild><Link to="/pricing">See Pricing</Link></Button>
                </CardContent>
              </Card>
            )}

            {pageState === 'already_redeemed' && (
              <Card>
                <CardHeader className="text-center">
                  <CheckIcon className="h-12 w-12 text-green-500 mx-auto mb-2" />
                  <CardTitle>Already Redeemed</CardTitle>
                  <CardDescription>
                    This gift has already been redeemed. Log in to access your account.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button asChild><Link to="/auth">Log In</Link></Button>
                </CardContent>
              </Card>
            )}

            {/* Legacy valid — not logged in */}
            {pageState === 'legacy_valid' && !user && legacyGift && (
              <Card>
                <CardHeader className="text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-full mx-auto mb-2">
                    <Gift className="h-7 w-7 text-primary" />
                  </div>
                  <CardTitle>You've Received a Gift!</CardTitle>
                  <CardDescription>
                    <strong className="text-foreground">{legacyGift.from_name}</strong> has gifted you full access to Asset Safe
                    {legacyGift.expires_at && ` through ${format(new Date(legacyGift.expires_at), 'MMMM d, yyyy')}`}.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {legacyGift.gift_message && (
                    <div className="bg-muted/50 rounded-lg p-4 italic text-muted-foreground text-sm">
                      "{legacyGift.gift_message}"
                    </div>
                  )}
                  <Alert>
                    <Lock className="h-4 w-4" />
                    <AlertDescription>Create a free account or log in to redeem your gift.</AlertDescription>
                  </Alert>
                  <div className="flex flex-col gap-2">
                    <Button asChild size="lg"><Link to={signupUrl}>Create Account & Redeem</Link></Button>
                    <Button asChild variant="outline"><Link to={loginUrl}>Log In to Redeem</Link></Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Legacy valid — logged in */}
            {pageState === 'legacy_valid' && user && legacyGift && (
              <Card>
                <CardHeader className="text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-full mx-auto mb-2">
                    <Gift className="h-7 w-7 text-primary" />
                  </div>
                  <CardTitle>You've Received a Gift!</CardTitle>
                  <CardDescription>
                    <strong className="text-foreground">{legacyGift.from_name}</strong> gifted you a full year of Asset Safe access.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {legacyGift.gift_message && (
                    <div className="bg-muted/50 rounded-lg p-4 italic text-muted-foreground text-sm">
                      "{legacyGift.gift_message}"
                    </div>
                  )}
                  <div className="bg-primary/5 rounded-lg p-4 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Plan</span>
                      <span className="font-medium text-foreground">Asset Safe Plan (Full Access)</span>
                    </div>
                    {legacyGift.expires_at && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Access Until</span>
                        <span className="font-medium text-foreground">{format(new Date(legacyGift.expires_at), 'MMMM d, yyyy')}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Auto-Renew</span>
                      <span className="font-medium text-green-600">No — one-time gift</span>
                    </div>
                  </div>
                  <Button onClick={handleLegacyRedeem} disabled={isRedeeming} size="lg" className="w-full">
                    {isRedeeming ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Redeeming…</>
                    ) : 'Redeem Gift'}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    After redemption you'll be redirected to your dashboard.
                  </p>
                </CardContent>
              </Card>
            )}

            {pageState === 'success' && (
              <Card>
                <CardHeader className="text-center">
                  <CheckIcon className="h-14 w-14 text-green-500 mx-auto mb-2" />
                  <CardTitle>Gift Redeemed! 🎉</CardTitle>
                  <CardDescription>Your full access is now active. Redirecting to your dashboard…</CardDescription>
                </CardHeader>
              </Card>
            )}

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default GiftRedeem;
