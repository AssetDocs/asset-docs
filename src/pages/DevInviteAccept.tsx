import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

const DevInviteAccept: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { user, signIn } = useAuth();
  
  const [step, setStep] = useState<'loading' | 'login' | 'success' | 'error'>('loading');
  const [invitation, setInvitation] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const token = searchParams.get('token');

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setErrorMessage('Invalid invitation link');
        setStep('error');
        return;
      }

      try {
        // Verify the token is valid
        const { data, error } = await supabase
          .from('dev_team_invitations')
          .select('*')
          .eq('invitation_token', token)
          .is('accepted_at', null)
          .single();

        if (error || !data) {
          setErrorMessage('This invitation is invalid or has already been used');
          setStep('error');
          return;
        }

        // Check if expired
        if (new Date(data.token_expires_at) < new Date()) {
          setErrorMessage('This invitation has expired. Please request a new invitation.');
          setStep('error');
          return;
        }

        setInvitation(data);
        setEmail(data.email);

        // If user is already logged in and matches the invitation email
        if (user && user.email?.toLowerCase() === data.email.toLowerCase()) {
          await acceptInvitation(data);
        } else {
          setStep('login');
        }
      } catch (error) {
        console.error('Error verifying invitation:', error);
        setErrorMessage('An error occurred while verifying the invitation');
        setStep('error');
      }
    };

    verifyToken();
  }, [token, user]);

  const acceptInvitation = async (inviteData: any) => {
    try {
      // Mark invitation as accepted
      const { error: updateError } = await supabase
        .from('dev_team_invitations')
        .update({ accepted_at: new Date().toISOString() })
        .eq('id', inviteData.id);

      if (updateError) {
        throw updateError;
      }

      // Add user role
      const { data: session } = await supabase.auth.getSession();
      if (session?.session?.user) {
        const { error: roleError } = await supabase
          .from('user_roles')
          .upsert({
            user_id: session.session.user.id,
            role: inviteData.role,
          }, { onConflict: 'user_id,role' });

        if (roleError) {
          console.error('Error adding role:', roleError);
        }
      }

      setStep('success');
      
      // Redirect to dev workspace after a short delay
      setTimeout(() => {
        navigate('/admin/dev');
      }, 2000);
    } catch (error: any) {
      console.error('Error accepting invitation:', error);
      setErrorMessage('Failed to accept invitation');
      setStep('error');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Use edge function to create/update account and accept invitation
      const { data, error } = await supabase.functions.invoke('accept-dev-invite', {
        body: { token, password }
      });

      if (error) {
        throw new Error(error.message || 'Failed to activate account');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      // Now sign in with the credentials
      const { error: signInError } = await signIn(email, password);
      
      if (signInError) {
        throw signInError;
      }

      // Success - the invitation has been accepted via edge function
      setStep('success');
      
      toast({
        title: "Account Activated",
        description: `Welcome! You've been added as ${getRoleName(invitation.role)}.`,
      });

      // Redirect to dev workspace
      setTimeout(() => {
        navigate('/admin/dev');
      }, 2000);

    } catch (error: any) {
      console.error('Activation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to activate account",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleName = (role: string) => {
    return role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="flex-grow flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md">
          {step === 'loading' && (
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Verifying invitation...</p>
            </CardContent>
          )}

          {step === 'login' && invitation && (
            <>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <img 
                    src="/images/asset-safe-logo.png" 
                    alt="Asset Safe Logo" 
                    className="h-12 w-auto"
                  />
                </div>
                <CardTitle>Welcome to the Team!</CardTitle>
                <CardDescription>
                  You've been invited to join as a <strong>{getRoleName(invitation.role)}</strong>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      This invitation is for this email address only
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter or create your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      If you already have an account, enter your existing password. 
                      Otherwise, create a new password.
                    </p>
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Activating...
                      </>
                    ) : (
                      'Activate Account'
                    )}
                  </Button>
                </form>
              </CardContent>
            </>
          )}

          {step === 'success' && (
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
              <h2 className="text-xl font-bold mb-2">Welcome Aboard!</h2>
              <p className="text-muted-foreground text-center mb-4">
                Your account has been activated. Redirecting to the Development workspace...
              </p>
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </CardContent>
          )}

          {step === 'error' && (
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
              <h2 className="text-xl font-bold mb-2">Invitation Error</h2>
              <p className="text-muted-foreground text-center mb-4">
                {errorMessage}
              </p>
              <Button onClick={() => navigate('/')} variant="outline">
                Go to Homepage
              </Button>
            </CardContent>
          )}
        </Card>
      </div>
      
      <Footer />
    </div>
  );
};

export default DevInviteAccept;
