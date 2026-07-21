import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Gift, Mail, Loader2, AlertCircle, RefreshCw, Copy, Ticket } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type GiftStatus = {
  found?: boolean;
  payment_status?: 'pending' | 'paid' | 'refunded' | 'canceled' | 'failed' | 'expired';
  delivery_status?: 'not_sent' | 'sending' | 'sent' | 'failed';
  delivery_date?: string | null;
  created_at?: string;
  delivered_at?: string | null;
  recipient_email_masked?: string;
  delivery_method?: 'recipient_email' | 'purchaser_code';
  gift_code?: string;
  claim_link?: string;
};

type GiftResendResponse = {
  success?: boolean;
  error?: string;
};

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

const GiftSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const sessionId = searchParams.get('session_id');
  const successToken = searchParams.get('t');

  const [status, setStatus] = useState<GiftStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [resending, setResending] = useState(false);

  const fetchStatus = useCallback(async () => {
    if (!sessionId || !successToken) return;
    try {
      const { data, error } = await supabase.functions.invoke('get-gift-status', {
        body: { sessionId, successToken, action: 'status' },
      });
      if (error) throw error;
      setStatus(data as GiftStatus);
      return data as GiftStatus;
    } catch (e) {
      console.error('[GiftSuccess] status error', e);
    }
  }, [sessionId, successToken]);

  // Poll every 5s up to ~30s while not delivered
  useEffect(() => {
    let cancelled = false;
    let attempts = 0;
    const tick = async () => {
      if (cancelled) return;
      attempts += 1;
      const latest = await fetchStatus();
      setIsLoading(false);
      const latestDeliveryDate = latest?.delivery_date ? new Date(latest.delivery_date) : null;
      const isScheduled =
        latest?.payment_status === 'paid' &&
        latest?.delivery_status === 'not_sent' &&
        latestDeliveryDate !== null &&
        latestDeliveryDate.getTime() > Date.now();
      const stop =
        attempts >= 7 ||
        isScheduled ||
        (latest?.delivery_status === 'sent' || latest?.delivery_status === 'failed');
      if (!stop && !cancelled) setTimeout(tick, 5000);
    };
    tick();
    return () => { cancelled = true; };
  }, [fetchStatus]);

  const handleResend = async () => {
    if (!sessionId || !successToken) return;
    setResending(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-gift-status', {
        body: { sessionId, successToken, action: 'resend' },
      });
      const result = data as GiftResendResponse | null;
      if (error || !result?.success) {
        throw new Error(result?.error || error?.message || 'Resend failed');
      }
      toast({ title: 'Resending', description: 'Gift email is on its way.' });
      setTimeout(fetchStatus, 1500);
    } catch (e: unknown) {
      toast({
        title: 'Could not resend',
        description: getErrorMessage(e, 'Please try again in a few minutes.'),
        variant: 'destructive',
      });
    } finally {
      setResending(false);
    }
  };

  const copyToClipboard = async (label: string, value?: string) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      toast({ title: `${label} copied`, description: 'Ready to share.' });
    } catch {
      toast({
        title: 'Copy failed',
        description: 'Please select and copy it manually.',
        variant: 'destructive',
      });
    }
  };

  const deliveryDate = status?.delivery_date ? new Date(status.delivery_date) : null;
  const purchaserCode = status?.delivery_method === 'purchaser_code';
  const scheduled =
    !purchaserCode &&
    status?.payment_status === 'paid' &&
    status?.delivery_status === 'not_sent' &&
    deliveryDate !== null &&
    deliveryDate.getTime() > Date.now();
  const delivered = status?.delivery_status === 'sent';
  const failed = status?.delivery_status === 'failed';
  const inProgress = !delivered && !failed && !scheduled;
  const deliveryDateLabel = deliveryDate
    ? deliveryDate.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  useEffect(() => {
    if (!delivered) return;
    const timer = setTimeout(() => navigate('/gift', { replace: true }), 1800);
    return () => clearTimeout(timer);
  }, [delivered, navigate]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1 bg-secondary/5 py-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                {isLoading || inProgress ? (
                  <Loader2 className="h-16 w-16 text-primary animate-spin" />
                ) : delivered ? (
                  <CheckCircle className="h-16 w-16 text-green-500" />
                ) : scheduled ? (
                  <CheckCircle className="h-16 w-16 text-blue-500" />
                ) : (
                  <AlertCircle className="h-16 w-16 text-amber-500" />
                )}
              </div>
              <CardTitle className="text-2xl">
                {delivered
                  ? purchaserCode ? 'Your Gift Code Is Ready' : 'Gift Delivered!'
                  : scheduled
                    ? 'Gift Scheduled!'
                  : failed
                    ? 'Gift Purchase Successful'
                    : 'Processing Your Gift...'}
              </CardTitle>
              <CardDescription className="text-lg">
                {delivered
                  ? purchaserCode
                    ? "Share this code or claim link whenever you're ready. The recipient can use it to start their Asset Safe gift subscription."
                    : 'The recipient has been notified by email.'
                  : scheduled
                    ? `The recipient email will be sent on ${deliveryDateLabel}.`
                  : failed
                    ? 'We had trouble sending the email - you can try again below.'
                    : 'Finalizing payment and sending the gift notification.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!sessionId || !successToken ? (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-sm text-amber-800">
                  Missing session details. If you completed a purchase, please check your email - the
                  recipient will still receive their gift.
                </div>
              ) : (
                <>
                  <div className={`rounded-lg p-6 border ${delivered ? 'bg-green-50 border-green-200' : scheduled ? 'bg-blue-50 border-blue-200' : failed ? 'bg-amber-50 border-amber-200' : 'bg-secondary/10 border-border'}`}>
                    {purchaserCode ? (
                      <Ticket className={`h-8 w-8 mx-auto mb-3 ${delivered ? 'text-green-600' : failed ? 'text-amber-600' : 'text-primary'}`} />
                    ) : (
                      <Gift className={`h-8 w-8 mx-auto mb-3 ${delivered ? 'text-green-600' : scheduled ? 'text-blue-600' : failed ? 'text-amber-600' : 'text-primary'}`} />
                    )}
                    {status?.recipient_email_masked && (
                      <p className="text-sm text-foreground/80">
                        Recipient: <strong>{status.recipient_email_masked}</strong>
                      </p>
                    )}
                    {scheduled && deliveryDateLabel && (
                      <p className="text-sm text-foreground/80 mt-2">
                        Scheduled delivery: <strong>{deliveryDateLabel}</strong>
                      </p>
                    )}
                    <div className="mt-3 flex items-center justify-center gap-2 text-sm">
                      <Mail className="h-4 w-4" />
                      <span>
                        {delivered
                          ? purchaserCode ? 'Gift Code emailed to you' : 'Email delivered'
                          : scheduled
                            ? 'Email scheduled'
                          : failed
                            ? 'Email failed to send'
                            : 'Email in progress'}
                      </span>
                    </div>
                  </div>

                  {purchaserCode && status?.gift_code && status?.claim_link && (
                    <div className="space-y-4 text-left">
                      <div className="rounded-lg border bg-background p-4">
                        <p className="text-xs font-medium uppercase text-muted-foreground">Gift Code</p>
                        <p className="mt-1 break-all font-mono text-lg font-semibold text-foreground">{status.gift_code}</p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-3"
                          onClick={() => copyToClipboard('Gift Code', status.gift_code)}
                        >
                          <Copy className="mr-2 h-4 w-4" />Copy Code
                        </Button>
                      </div>
                      <div className="rounded-lg border bg-background p-4">
                        <p className="text-xs font-medium uppercase text-muted-foreground">Claim Link</p>
                        <p className="mt-1 break-all text-sm text-foreground">{status.claim_link}</p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-3"
                          onClick={() => copyToClipboard('Claim Link', status.claim_link)}
                        >
                          <Copy className="mr-2 h-4 w-4" />Copy Claim Link
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        This Gift Code does not expire unless it is refunded, cancelled, or manually voided.
                      </p>
                    </div>
                  )}

                  {failed && (
                    <Button onClick={handleResend} disabled={resending} size="lg" className="w-full">
                      {resending ? (
                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Resending...</>
                      ) : (
                        <><RefreshCw className="h-4 w-4 mr-2" />Resend gift email</>
                      )}
                    </Button>
                  )}

                  {!purchaserCode && (
                  <div className="space-y-3 text-left text-sm text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                      <span>The recipient receives a secure redemption link unique to their email address.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                      <span>They sign in (or create an account) using the gifted email address.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                      <span>Their 12-month subscription activates when they redeem the gift.</span>
                    </div>
                  </div>
                  )}
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
