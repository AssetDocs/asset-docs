import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle, Clock, Mail, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

type PurchasedGift = {
  id: string;
  created_at: string;
  delivery_date: string | null;
  delivery_method: string | null;
  delivery_status: string | null;
  payment_status: string | null;
  recipient_email: string | null;
  recipient_name: string | null;
  redemption_status: string | null;
  redeemed: boolean | null;
  redeemed_at: string | null;
  updated_at: string | null;
};

type GiftPurchaseHistoryProps = {
  className?: string;
  emptyState?: 'hide' | 'show';
  showGuestPrompt?: boolean;
  title?: string;
};

const maskEmail = (email: string | null) => {
  if (!email) return 'recipient';
  const [local, domain] = email.split('@');
  if (!local || !domain) return email;
  return `${local.slice(0, 1)}***@${domain}`;
};

const formatDate = (value: string | null) => {
  if (!value) return null;
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const statusLabel = (gift: PurchasedGift) => {
  if (gift.redeemed || gift.redemption_status === 'redeemed') return 'Redeemed';
  if (gift.payment_status !== 'paid') return 'Payment pending';
  if (gift.delivery_date && new Date(gift.delivery_date).getTime() > Date.now()) return 'Scheduled';
  if (gift.delivery_status === 'sent') return 'Sent';
  if (gift.delivery_status === 'failed') return 'Needs resend';
  return 'Processing';
};

const canResendGift = (gift: PurchasedGift) =>
  gift.payment_status === 'paid' &&
  gift.delivery_method !== 'purchaser_code' &&
  gift.redeemed !== true &&
  gift.redemption_status !== 'redeemed' &&
  !(gift.delivery_date && new Date(gift.delivery_date).getTime() > Date.now());

const GiftPurchaseHistory: React.FC<GiftPurchaseHistoryProps> = ({
  className,
  emptyState = 'show',
  showGuestPrompt = false,
  title = 'Gift Purchase History',
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [purchasedGifts, setPurchasedGifts] = useState<PurchasedGift[]>([]);
  const [isLoadingGifts, setIsLoadingGifts] = useState(false);
  const [resendingGiftId, setResendingGiftId] = useState<string | null>(null);

  const loadPurchasedGifts = useCallback(async () => {
    if (!user) {
      setPurchasedGifts([]);
      return;
    }

    setIsLoadingGifts(true);
    try {
      const { data, error } = await supabase.functions.invoke('list-purchased-gifts');
      if (error) throw error;
      setPurchasedGifts((data?.gifts || []) as PurchasedGift[]);
    } catch (error) {
      console.error('[GiftPurchaseHistory] Could not load purchased gifts:', error);
    } finally {
      setIsLoadingGifts(false);
    }
  }, [user]);

  useEffect(() => {
    loadPurchasedGifts();
  }, [loadPurchasedGifts]);

  const resendGift = async (giftId: string) => {
    setResendingGiftId(giftId);
    try {
      const { data, error } = await supabase.functions.invoke('resend-gift-email', {
        body: { giftId },
      });
      if (error || data?.success === false) {
        throw new Error(data?.error || error?.message || 'Gift resend failed.');
      }
      toast({
        title: 'Gift invite resent',
        description: 'The recipient will receive a fresh redemption link.',
      });
      await loadPurchasedGifts();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Please try again in a few minutes.';
      toast({
        title: 'Could not resend gift invite',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setResendingGiftId(null);
    }
  };

  if (!user) {
    if (!showGuestPrompt) return null;
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Mail className="h-5 w-5 text-primary" />
            Manage a Gift You Purchased
          </CardTitle>
          <CardDescription>
            Create an account or sign in with the purchaser email to view gift delivery status and resend an invite.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          <Button onClick={() => navigate(`/signup?redirect=${encodeURIComponent('/gift')}`)}>
            Create Account
          </Button>
          <Button variant="outline" onClick={() => navigate(`/auth?redirect=${encodeURIComponent('/gift')}`)}>
            Sign In
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!isLoadingGifts && purchasedGifts.length === 0 && emptyState === 'hide') return null;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Mail className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
        <CardDescription>
          View gifts you have purchased and resend an unredeemed invite if the recipient needs a fresh link.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoadingGifts ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Loading gift purchases...
          </div>
        ) : purchasedGifts.length === 0 ? (
          <div className="rounded-lg border border-dashed bg-primary/5 p-5 text-center">
            <h3 className="text-lg font-semibold text-foreground">
              Give the Gift of Protection and Peace of Mind
            </h3>
            <p className="mt-1 text-sm font-medium text-brand-orange">
              Practical, Not Disposable - A gift that provides long-term value
            </p>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
              Gift a full year of Asset Safe access. Once you send a gift from this account, delivery and redemption details will appear here.
            </p>
            <Button className="mt-4" onClick={() => navigate('/gift')}>
              Gift the Asset Safe Plan
            </Button>
          </div>
        ) : (
          purchasedGifts.map((gift) => {
            const label = statusLabel(gift);
            const allowResend = canResendGift(gift);
            const scheduledDate = formatDate(gift.delivery_date);
            const redeemedDate = formatDate(gift.redeemed_at);

            return (
              <div key={gift.id} className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2 text-left">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-foreground">
                      {gift.recipient_name || maskEmail(gift.recipient_email)}
                    </p>
                    <Badge variant={label === 'Redeemed' ? 'secondary' : label === 'Needs resend' ? 'destructive' : 'outline'}>
                      {label}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Recipient: {maskEmail(gift.recipient_email)}
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    {scheduledDate && (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Delivery: {scheduledDate}
                      </span>
                    )}
                    {redeemedDate && (
                      <span className="inline-flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" /> Redeemed: {redeemedDate}
                      </span>
                    )}
                    {gift.delivery_status === 'failed' && (
                      <span className="inline-flex items-center gap-1 text-amber-700">
                        <AlertCircle className="h-3 w-3" /> Delivery needs attention
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  type="button"
                  variant={allowResend ? 'default' : 'outline'}
                  disabled={!allowResend || resendingGiftId === gift.id}
                  onClick={() => resendGift(gift.id)}
                  className="sm:w-auto"
                >
                  {resendingGiftId === gift.id ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Mail className="mr-2 h-4 w-4" />
                  )}
                  Resend Invite
                </Button>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};

export default GiftPurchaseHistory;
