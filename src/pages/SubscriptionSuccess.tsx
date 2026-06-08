import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Mail, Loader2, AlertCircle, Clock, ShieldAlert } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

type FinalizeStatus =
  | 'loading'
  | 'fulfilled'
  | 'fulfilled_email_failed'
  | 'manual_review'
  | 'rejected'
  | 'pending'
  | 'error';

const POLL_INTERVAL_MS = 3000;
const MAX_POLL_MS = 60_000;

const SubscriptionSuccess: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [status, setStatus] = useState<FinalizeStatus>('loading');
  const [manualReason, setManualReason] = useState<string | null>(null);
  const [errorId, setErrorId] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const startedAtRef = useRef<number>(Date.now());

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

    let cancelled = false;
    startedAtRef.current = Date.now();

    const finalize = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('finalize-checkout', {
          body: { session_id: sessionId },
        });
        if (cancelled) return;

        if (error || !data) {
          setErrorId(data?.errorId ?? null);
          setStatus('error');
          return;
        }

        const next = (data.status ?? 'error') as FinalizeStatus;
        setManualReason(data.reason ?? null);
        setErrorId(data.errorId ?? null);
        setStatus(next);

        if (next === 'fulfilled' && user) {
          setTimeout(() => navigate('/account', { replace: true }), 1500);
        }

        if (next === 'pending' && Date.now() - startedAtRef.current < MAX_POLL_MS) {
          setTimeout(finalize, POLL_INTERVAL_MS);
        }
      } catch (err) {
        if (cancelled) return;
        console.error('[SubscriptionSuccess] finalize error:', err);
        setStatus('error');
      }
    };

    finalize();
    return () => { cancelled = true; };
  }, [sessionId, user, navigate]);

  const handleResend = async () => {
    if (!sessionId || resending) return;
    setResending(true);
    try {
      await supabase.functions.invoke('resend-magic-link', {
        body: { session_id: sessionId },
      });
      toast.success('If eligible, a new sign-in link is on its way.');
    } catch {
      toast.success('If eligible, a new sign-in link is on its way.');
    } finally {
      setResending(false);
    }
  };

  const Shell = ({ children }: { children: React.ReactNode }) => (
    <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center px-4">
      <Card className="text-center max-w-lg w-full">{children}</Card>
    </div>
  );

  if (status === 'loading' || status === 'pending') {
    return (
      <Shell>
        <CardHeader>
          <div className="flex justify-center mb-4">
            <Loader2 className="h-16 w-16 text-primary animate-spin" />
          </div>
          <CardTitle className="text-2xl">Activating your subscription…</CardTitle>
          <CardDescription className="text-base">
            This usually takes just a few seconds. Please don't close this page.
          </CardDescription>
        </CardHeader>
      </Shell>
    );
  }

  if (status === 'fulfilled' && user) {
    return (
      <Shell>
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl text-green-700">Subscription active</CardTitle>
          <CardDescription className="text-base">Redirecting to your dashboard…</CardDescription>
        </CardHeader>
      </Shell>
    );
  }

  if (status === 'fulfilled' || status === 'fulfilled_email_failed') {
    return (
      <Shell>
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl text-green-700">Payment confirmed</CardTitle>
          <CardDescription className="text-lg">
            Finish setup with the sign-in link we emailed you.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3 text-left">
            <Mail className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-blue-800 text-sm">Check your inbox</p>
              <p className="text-blue-700 text-sm mt-1">
                We sent a sign-in link to the email you used at checkout. The link is valid for 1 hour.
              </p>
              {status === 'fulfilled_email_failed' && (
                <p className="text-amber-700 text-sm mt-2">
                  We had trouble delivering it the first time. Try resending below.
                </p>
              )}
            </div>
          </div>
          <Button onClick={handleResend} disabled={resending} variant="outline" className="w-full">
            {resending ? 'Sending…' : 'Resend sign-in link'}
          </Button>
          <p className="text-xs text-muted-foreground">
            Still nothing? Check spam, then email{' '}
            <a href="mailto:support@getassetsafe.com" className="text-primary underline">
              support@getassetsafe.com
            </a>
            .
          </p>
        </CardContent>
      </Shell>
    );
  }

  if (status === 'manual_review') {
    return (
      <Shell>
        <CardHeader>
          <div className="flex justify-center mb-4">
            <Clock className="h-16 w-16 text-amber-500" />
          </div>
          <CardTitle className="text-2xl">Payment received — manual review</CardTitle>
          <CardDescription className="text-base">
            Your payment was successful. Our team needs to verify a detail before activating your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            You'll get an email within 1 business day. No further action required for now.
          </p>
          {manualReason && (
            <p className="text-xs text-muted-foreground italic">Reason: {manualReason}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Questions? Email{' '}
            <a href="mailto:support@getassetsafe.com" className="text-primary underline">
              support@getassetsafe.com
            </a>
            .
          </p>
        </CardContent>
      </Shell>
    );
  }

  if (status === 'rejected') {
    return (
      <Shell>
        <CardHeader>
          <div className="flex justify-center mb-4">
            <ShieldAlert className="h-16 w-16 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Activation blocked</CardTitle>
          <CardDescription className="text-base">
            This checkout couldn't be activated. Please contact support so we can sort it out.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <a href="mailto:support@getassetsafe.com" className="text-primary underline text-sm">
            support@getassetsafe.com
          </a>
        </CardContent>
      </Shell>
    );
  }

  return (
    <Shell>
      <CardHeader>
        <div className="flex justify-center mb-4">
          <AlertCircle className="h-16 w-16 text-destructive" />
        </div>
        <CardTitle className="text-2xl">Something went wrong</CardTitle>
        <CardDescription className="text-base">
          Your payment may still have been processed. Please reach out to support.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Email{' '}
          <a href="mailto:support@getassetsafe.com" className="text-primary underline">
            support@getassetsafe.com
          </a>
          {errorId && <> with reference <code className="text-xs">{errorId}</code></>}.
        </p>
        <Button variant="outline" onClick={() => navigate('/pricing')}>Back to Pricing</Button>
      </CardContent>
    </Shell>
  );
};

export default SubscriptionSuccess;
