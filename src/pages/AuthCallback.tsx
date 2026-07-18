// @ts-nocheck
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, Loader2, Mail } from 'lucide-react';

type CallbackErrorState = {
  code: string;
  description: string;
  sessionId: string | null;
};

const getParamsFromHash = () => {
  const hash = window.location.hash.startsWith('#')
    ? window.location.hash.slice(1)
    : window.location.hash;
  return new URLSearchParams(hash);
};

const getAuthErrorCopy = (code: string, description: string) => {
  const normalized = `${code} ${description}`.toLowerCase();
  if (normalized.includes('otp_expired') || normalized.includes('expired')) {
    return {
      title: 'This sign-in link needs to be refreshed',
      description: 'For your security, sign-in links can only be used once. Send yourself a fresh link and continue setup.',
    };
  }
  if (normalized.includes('access_denied')) {
    return {
      title: 'We could not complete sign-in from that link',
      description: 'Send yourself a fresh sign-in link and continue setup from the newest email.',
    };
  }
  return {
    title: 'We need to send you a fresh sign-in link',
    description: description || 'The sign-in link could not be completed. A fresh link will get you back into setup.',
  };
};

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [callbackError, setCallbackError] = useState<CallbackErrorState | null>(null);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    const hasHashSession = hash.includes('access_token=');
    const hashParams = getParamsFromHash();
    const errorCode =
      searchParams.get('error_code') ||
      hashParams.get('error_code') ||
      searchParams.get('error') ||
      hashParams.get('error');
    const errorDescription =
      searchParams.get('error_description') ||
      hashParams.get('error_description') ||
      '';
    const sessionId = searchParams.get('session_id');

    if (errorCode || errorDescription) {
      console.warn('[AuthCallback] Supabase returned auth error', {
        errorCode,
        hasSessionId: !!sessionId,
      });
      setCallbackError({
        code: errorCode || 'auth_callback_error',
        description: errorDescription.replace(/\+/g, ' '),
        sessionId,
      });
      setLoading(false);
      return;
    }

    if (hasHashSession) {
      handleHashSessionFlow();
    } else {
      handleAuthCallback();
    }

    async function routeAuthenticatedUser(session: any, redirectTo?: string | null) {
      try {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('password_set, onboarding_complete')
          .eq('user_id', session.user.id)
          .single();

        if (!profileData?.password_set) {
          try {
            await supabase.functions.invoke('accept-contributor-invitation', {
              headers: { Authorization: `Bearer ${session.access_token}` },
            });
            console.log('[AuthCallback] accept-contributor-invitation called');
          } catch (inviteErr) {
            console.warn('[AuthCallback] accept-contributor-invitation error (non-fatal):', inviteErr);
          }
          navigate('/welcome/create-password', { replace: true });
        } else if (!profileData?.onboarding_complete) {
          navigate('/onboarding', { replace: true });
        } else if (redirectTo) {
          window.location.href = redirectTo;
        } else {
          navigate('/account', { replace: true });
        }
      } catch (error: any) {
        console.error('Authenticated profile fetch error:', error);
        navigate('/account', { replace: true });
      }
    }

    async function handleHashSessionFlow() {
      return new Promise<void>((resolve) => {
        const timeout = setTimeout(() => {
          subscription.unsubscribe();
          setCallbackError({
            code: 'session_timeout',
            description: 'Session could not be established.',
            sessionId,
          });
          setLoading(false);
          resolve();
        }, 10000);

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (event === 'SIGNED_IN' && session) {
              clearTimeout(timeout);
              subscription.unsubscribe();
              window.history.replaceState(null, '', window.location.pathname);
              await routeAuthenticatedUser(session);
              setLoading(false);
              resolve();
            }
          }
        );
      });
    }

    async function handleAuthCallback() {
      try {
        const token_hash = searchParams.get('token_hash');
        const type = searchParams.get('type');
        const redirect_to = searchParams.get('redirect_to');

        if (!token_hash || !type) {
          setCallbackError({
            code: 'missing_callback_parameters',
            description: 'The sign-in link could not be completed.',
            sessionId,
          });
          setLoading(false);
          return;
        }

        console.log('Processing auth callback:', { type, redirect_to });

        const { data, error } = await supabase.auth.verifyOtp({
          token_hash,
          type: type as any,
        });

        if (error) {
          console.error('Auth callback error:', error);
          throw error;
        }

        console.log('Auth callback successful:', data);

        let isContributor = false;
        if (data.session?.access_token) {
          try {
            const { data: invitationData } = await supabase.functions.invoke(
              'accept-contributor-invitation',
              {
                headers: {
                  Authorization: `Bearer ${data.session.access_token}`
                }
              }
            );

            isContributor = invitationData?.isContributor === true;

            if (invitationData?.invitations?.length > 0) {
              console.log('Accepted contributor invitations:', invitationData.invitations);
              toast({
                title: 'Invitation Accepted!',
                description: `You now have access to ${invitationData.invitations.length} account(s).`,
              });
            } else if (isContributor) {
              console.log('User is already a contributor:', invitationData.contributorRelationships);
            }
          } catch (inviteError) {
            console.error('Error checking contributor invitations:', inviteError);
          }
        }

        if (type === 'invite') {
          toast({
            title: 'Welcome to Asset Safe!',
            description: 'Please set your password to complete account setup.',
          });
          const { data: profileData } = await supabase
            .from('profiles')
            .select('password_set, onboarding_complete')
            .eq('user_id', data.session?.user?.id ?? '')
            .maybeSingle();
          if (!profileData?.password_set) {
            navigate('/welcome/create-password', { replace: true });
          } else {
            navigate('/account', { replace: true });
          }
          return;
        }

        if (type === 'signup' || type === 'email_change_confirm_new') {
          toast({
            title: 'Email Verified Successfully!',
            description: isContributor
              ? 'Your contributor account is ready. Redirecting to dashboard...'
              : 'Welcome! Redirecting to your dashboard...',
          });
          navigate(redirect_to || '/account', { replace: true });
          return;
        }

        if (type === 'recovery') {
          toast({
            title: 'Password Reset',
            description: 'You can now set a new password for your account.',
          });
        }

        if (type === 'magiclink' && data.session?.user?.id) {
          toast({
            title: 'Signed In!',
            description: "You've been successfully signed in.",
          });
          await routeAuthenticatedUser(data.session, redirect_to);
          return;
        }

        if (redirect_to) {
          window.location.href = redirect_to;
        } else {
          navigate('/account', { replace: true });
        }
      } catch (error: any) {
        console.error('Auth callback failed:', error);
        setCallbackError({
          code: error?.code || error?.error_code || 'auth_callback_failed',
          description: error?.message || 'The sign-in link could not be completed.',
          sessionId,
        });
      } finally {
        setLoading(false);
      }
    }
  }, []);

  const handleContinue = () => {
    navigate('/account', { replace: true });
  };

  const handleResend = async () => {
    if (!callbackError?.sessionId || resending) return;
    setResending(true);
    try {
      await supabase.functions.invoke('resend-magic-link', {
        body: { session_id: callbackError.sessionId },
      });
      toast({
        title: 'Fresh link sent',
        description: 'Check your email for the newest Asset Safe sign-in link.',
      });
    } catch {
      toast({
        title: 'Fresh link sent',
        description: 'If the checkout is eligible, a new sign-in link is on its way.',
      });
    } finally {
      setResending(false);
    }
  };

  if (callbackError) {
    const copy = getAuthErrorCopy(callbackError.code, callbackError.description);

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
        <Card className="max-w-lg w-full text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <AlertCircle className="h-14 w-14 text-amber-500" />
            </div>
            <CardTitle className="text-2xl">{copy.title}</CardTitle>
            <CardDescription className="text-base">{copy.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {callbackError.sessionId ? (
              <Button onClick={handleResend} disabled={resending} className="w-full">
                {resending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Resend sign-in link
                  </>
                )}
              </Button>
            ) : (
              <Button onClick={() => navigate('/auth', { replace: true })} className="w-full">
                Return to sign in
              </Button>
            )}
            <p className="text-xs text-muted-foreground">
              Need help? Email{' '}
              <a href="mailto:support@getassetsafe.com" className="text-primary underline">
                support@getassetsafe.com
              </a>
              .
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (showWelcome) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
        <div className="max-w-2xl w-full text-center space-y-8">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto shadow-lg">
            <CheckCircle2 className="w-10 h-10 text-primary-foreground" />
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              Welcome to Asset Safe!
            </h1>
            <p className="text-xl text-muted-foreground">
              Your email has been successfully verified. Thank you for taking proactive steps to protect your assets and minimize your risks.
            </p>
            <p className="text-lg font-medium text-primary">
              You've made an excellent decision for your future security.
            </p>
          </div>

          <Button
            size="lg"
            onClick={handleContinue}
            className="text-lg px-8 py-6"
          >
            Go to My Dashboard
          </Button>

          <p className="text-sm text-muted-foreground">
            Start documenting your assets today
          </p>
        </div>
      </div>
    );
  }

  return null;
};

export default AuthCallback;
