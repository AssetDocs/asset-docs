import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Shield, Eye, EyeOff, MailOpen } from 'lucide-react';

const CreatePassword = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [passwordJustSet, setPasswordJustSet] = useState(false);

  // Expired link state
  const [linkExpired, setLinkExpired] = useState(false);
  const [resendEmail, setResendEmail] = useState('');
  const [resendSent, setResendSent] = useState(false);
  const [resending, setResending] = useState(false);

  // Detect expired OTP from URL hash
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('error_code=otp_expired') || hash.includes('error=access_denied')) {
      setLinkExpired(true);
      // Clear the hash from the URL
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  // Guard: if password already set, route correctly
  useEffect(() => {
    if (!loading && profile?.password_set) {
      if (!profile?.onboarding_complete) {
        navigate('/onboarding', { replace: true });
      } else {
        navigate('/account', { replace: true });
      }
    }
  }, [loading, profile, navigate]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail) {
      toast({ title: 'Email required', description: 'Please enter your email address.', variant: 'destructive' });
      return;
    }
    setResending(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: resendEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      setResendSent(true);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to send link. Please try again.', variant: 'destructive' });
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      toast({ title: 'Password too short', description: 'Password must be at least 8 characters.', variant: 'destructive' });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: 'Passwords do not match', description: 'Please make sure both fields match.', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ password_set: true })
        .eq('user_id', user!.id);

      if (profileError) throw profileError;

      toast({ title: 'Password set!', description: 'Your account is secured. Setting up your profile...' });
      navigate('/onboarding', { replace: true });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Something went wrong. Please try again.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary" />
      </div>
    );
  }

  // Expired link UI
  if (linkExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <MailOpen className="w-8 h-8 text-destructive" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Link Expired</h1>
              <p className="mt-2 text-muted-foreground">
                Your sign-in link has expired. Enter your email below and we'll send you a fresh one.
              </p>
            </div>
          </div>

          {resendSent ? (
            <div className="rounded-lg bg-primary/10 border border-primary/20 p-6 text-center space-y-2">
              <p className="font-semibold text-foreground">Check your inbox!</p>
              <p className="text-sm text-muted-foreground">
                A new sign-in link has been sent. Click it to continue setting up your account.
              </p>
            </div>
          ) : (
            <form onSubmit={handleResend} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="resend-email">Email address</Label>
                <Input
                  id="resend-email"
                  type="email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={resending}>
                {resending ? 'Sending...' : 'Resend Sign-In Link'}
              </Button>
            </form>
          )}

          <p className="text-center text-xs text-muted-foreground">
            Need help? Contact us at support@getassetsafe.com
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Icon */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Secure your account</h1>
            <p className="mt-2 text-muted-foreground">
              For security, Asset Safe requires a password in addition to email verification.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                required
                minLength={8}
                className="pr-10"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm password</Label>
            <div className="relative">
              <Input
                id="confirm"
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your password"
                required
                className="pr-10"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowConfirm(!showConfirm)}
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={submitting}>
            {submitting ? 'Setting password...' : 'Set My Password'}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          Your password is stored securely and encrypted. Asset Safe staff cannot see it.
        </p>
      </div>
    </div>
  );
};

export default CreatePassword;
