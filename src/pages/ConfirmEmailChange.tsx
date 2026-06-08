import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, AlertTriangle, Loader2, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Helmet } from 'react-helmet-async';

type State = 'idle' | 'confirming' | 'success' | 'error';

const ConfirmEmailChange: React.FC = () => {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const [state, setState] = useState<State>('idle');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    if (!token) {
      setState('error');
      setMessage('Missing confirmation token. Please use the link from your email.');
      return;
    }
    let cancelled = false;
    (async () => {
      setState('confirming');
      try {
        const { data, error } = await supabase.functions.invoke('confirm-email-change', {
          body: { token },
        });
        if (cancelled) return;
        if (error || (data as any)?.error) {
          setState('error');
          setMessage(((data as any)?.error) || error?.message || 'Could not confirm the change.');
          return;
        }
        setState('success');
        setMessage((data as any)?.message || 'Your email has been updated.');
        // Sign the user out so they re-authenticate with the new email.
        try { await supabase.auth.signOut(); } catch { /* ignore */ }
      } catch (e: any) {
        if (cancelled) return;
        setState('error');
        setMessage(e?.message || 'Could not confirm the change.');
      }
    })();
    return () => { cancelled = true; };
  }, [token]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Helmet>
        <title>Confirm email change — Asset Safe</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Confirm email change
          </CardTitle>
          <CardDescription>
            Finalizing the email address change on your Asset Safe account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {state === 'confirming' && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Verifying your link…
            </div>
          )}

          {state === 'success' && (
            <>
              <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700 dark:text-green-300">
                  {message}
                </AlertDescription>
              </Alert>
              <Button asChild className="w-full">
                <Link to="/auth">Sign in with your new email</Link>
              </Button>
            </>
          )}

          {state === 'error' && (
            <>
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{message}</AlertDescription>
              </Alert>
              <Button asChild variant="outline" className="w-full">
                <Link to="/account?tab=settings">Back to account settings</Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfirmEmailChange;
