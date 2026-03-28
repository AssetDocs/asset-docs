import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useContributor } from '@/contexts/ContributorContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Shield, Eye, EyeOff, MailOpen } from 'lucide-react';

const CreatePassword = () => {
  const { user, profile, loading, refreshProfile } = useAuth();
  const { refreshContributor } = useContributor();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [linkExpired, setLinkExpired] = useState(false);
  const [resendEmail, setResendEmail] = useState('');
  const [resendSent, setResendSent] = useState(false);
  const [resending, setResending] = useState(false);

  // detect expired OTP from URL hash
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('error_code=otp_expired') || hash.includes('error=access_denied')) {
      setLinkExpired(true);
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  // guard: already fully set up → go to dashboard
  useEffect(() => {
    if (!loading && profile?.onboarding_complete) {
      navigate('/account', { replace: true });
    }
  }, [loading, profile, navigate]);

  // Pre-fill name from contributors table (invited user flow)
  useEffect(() => {
    if (!user?.email) return;
    supabase
      .from('contributors')
      .select('first_name, last_name')
      .eq('contributor_email', user.email)
      .in('status', ['pending', 'accepted'])
      .maybeSingle()
      .then(({ data }) => {
        if (data?.first_name) setFirstName(data.first_name);
        if (data?.last_name) setLastName(data.last_name);
      });
  }, [user]);

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
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
      setResendSent(true);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to send link.', variant: 'destructive' });
    } finally {
      setResending(false);
    }
  };

  const handleFinish = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      toast({ title: 'Name required', description: 'Please enter your first and last name.', variant: 'destructive' });
      return;
    }
    if (password.length < 8) {
      toast({ title: 'Password too short', description: 'Password must be at least 8 characters.', variant: 'destructive' });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: 'Passwords do not match', description: 'Please make sure both fields match.', variant: 'destructive' });
      return;
    }
    if (!termsAccepted) {
      toast({ title: 'Terms required', description: 'Please accept the Terms of Service to continue.', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      const { error: pwError } = await supabase.auth.updateUser({ password });
      if (pwError) throw pwError;

      // Accept any pending contributor invitations (idempotent — safe to call again)
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await supabase.functions.invoke('accept-contributor-invitation', {
            headers: { Authorization: `Bearer ${session.access_token}` },
          });
        }
      } catch (e) {
        // Non-fatal — contributor acceptance also runs in AuthCallback
        console.warn('[CreatePassword] accept-contributor-invitation error (non-fatal):', e);
      }

      const profileUpdate: Record<string, unknown> = {
        password_set: true,
        onboarding_complete: true,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
      };

      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileUpdate)
        .eq('user_id', user!.id);
      if (profileError) throw profileError;

      // Re-authenticate with the new password to get a clean session.
      // refreshSession() alone is unreliable because updateUser() triggers
      // internal auth events that race with the refresh. signInWithPassword()
      // establishes a brand-new session with email_confirmed_at populated.
      const email = user?.email;
      if (email) {
        await supabase.auth.signInWithPassword({ email, password });
      }

      // Re-fetch contributor status so isContributor = true before ProtectedRoute evaluates.
      await refreshContributor();

      toast({ title: 'Welcome to Asset Safe!', description: 'Your account is ready.' });
      await refreshProfile();
      navigate('/account', { replace: true });
    } catch (err: any) {
      if (err?.message?.includes('lock broken') || err?.message?.includes('steal')) {
        navigate('/account', { replace: true });
        return;
      }
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
                  onChange={e => setResendEmail(e.target.value)}
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

        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Complete your account</h1>
            <p className="mt-1 text-muted-foreground text-sm">
              Confirm your name, create a password, and accept the terms to get started.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Name fields */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="first-name">First name</Label>
              <Input
                id="first-name"
                type="text"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                placeholder="Jane"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last-name">Last name</Label>
              <Input
                id="last-name"
                type="text"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                placeholder="Smith"
                required
              />
            </div>
          </div>

          {/* Email (read-only) */}
          {user?.email && (
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user.email} disabled className="opacity-60 cursor-not-allowed" />
            </div>
          )}

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                required
                minLength={8}
                className="pr-10"
                onKeyDown={e => e.key === 'Enter' && handleFinish()}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword(v => !v)}
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
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Repeat your password"
                required
                className="pr-10"
                onKeyDown={e => e.key === 'Enter' && handleFinish()}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowConfirm(v => !v)}
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Terms acceptance */}
          <div className="flex items-start gap-3 pt-1">
            <Checkbox
              id="terms"
              checked={termsAccepted}
              onCheckedChange={v => setTermsAccepted(v === true)}
              className="mt-0.5"
            />
            <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
              I agree to the{' '}
              <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:no-underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/legal" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:no-underline">
                Privacy Policy
              </a>
            </Label>
          </div>

          <Button
            className="w-full"
            size="lg"
            onClick={handleFinish}
            disabled={submitting || !termsAccepted}
          >
            {submitting ? 'Setting up...' : 'Go to Dashboard'}
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Your password is stored securely and encrypted. Asset Safe staff cannot see it.
        </p>
      </div>
    </div>
  );
};

export default CreatePassword;
