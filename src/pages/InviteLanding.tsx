import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Users, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

const InviteLanding: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'ready' | 'accepting' | 'accepted' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [inviteInfo, setInviteInfo] = useState<{ role: string; ownerName: string } | null>(null);

  // If user is logged in, auto-accept the invite
  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      setStatus('error');
      setErrorMessage('No invitation token provided. Please check your invite link.');
      return;
    }

    if (isAuthenticated && user) {
      acceptInvite();
    } else {
      // Show the landing page with sign-in options
      setStatus('ready');
    }
  }, [token, isAuthenticated, user, authLoading]);

  const acceptInvite = async () => {
    if (!token) return;
    setStatus('accepting');

    try {
      const { data: session } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke('accept-invite', {
        body: { token },
        headers: session?.session ? { Authorization: `Bearer ${session.session.access_token}` } : undefined,
      });

      if (error) throw error;

      if (data?.error) {
        setStatus('error');
        setErrorMessage(data.error);
        return;
      }

      setInviteInfo({
        role: data?.role || 'read_only',
        ownerName: data?.owner_name || 'the account owner',
      });
      setStatus('accepted');

      // Redirect to dashboard after a brief delay
      setTimeout(() => {
        navigate('/account', { replace: true });
      }, 2000);
    } catch (err: any) {
      console.error('Error accepting invite:', err);
      setStatus('error');
      setErrorMessage(err.message || 'Failed to accept invitation. The link may be expired or invalid.');
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'full_access': return 'Full Access';
      case 'read_only': return 'Read Only';
      default: return role;
    }
  };

  if (status === 'loading' || authLoading) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Account Invitation</CardTitle>
          <CardDescription>
            You've been invited to access an Asset Safe account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'ready' && (
            <>
              <p className="text-sm text-muted-foreground text-center">
                Sign in or create an account to accept this invitation and access the shared dashboard.
              </p>
              <div className="space-y-3">
                <Button
                  className="w-full"
                  onClick={() => navigate(`/auth?redirect=/invite?token=${encodeURIComponent(token || '')}`)}
                >
                  Sign In
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate(`/signup?redirect=/invite?token=${encodeURIComponent(token || '')}`)}
                >
                  Create Account
                </Button>
              </div>
            </>
          )}

          {status === 'accepting' && (
            <div className="flex flex-col items-center gap-3 py-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Accepting invitation...</p>
            </div>
          )}

          {status === 'accepted' && inviteInfo && (
            <div className="space-y-3">
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Invitation accepted! You now have <strong>{getRoleLabel(inviteInfo.role)}</strong> access
                  to {inviteInfo.ownerName}'s account.
                </AlertDescription>
              </Alert>
              <p className="text-sm text-muted-foreground text-center">
                Redirecting to the dashboard...
              </p>
            </div>
          )}

          {status === 'error' && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {errorMessage}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InviteLanding;
