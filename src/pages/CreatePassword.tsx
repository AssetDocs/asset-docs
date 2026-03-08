import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Shield, Eye, EyeOff, MailOpen, User, Phone, Home, CheckCircle2 } from 'lucide-react';
import { Loader } from '@googlemaps/js-api-loader';

const STEPS = [
  { id: 0, label: 'Password',  icon: Shield },
  { id: 1, label: 'Your name', icon: User },
  { id: 2, label: 'Phone',     icon: Phone },
  { id: 3, label: 'Property',  icon: Home },
];

const CreatePassword = () => {
  const { user, profile, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // ── step state ──────────────────────────────────────────────────────────────
  const [step, setStep] = useState(0);

  // step 0 – password
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // step 1 – name
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // step 2 – phone
  const [phone, setPhone] = useState('');

  // step 3 – property
  const [address, setAddress] = useState('');
  const addressInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  // final submit
  const [submitting, setSubmitting] = useState(false);

  // expired link
  const [linkExpired, setLinkExpired] = useState(false);
  const [resendEmail, setResendEmail] = useState('');
  const [resendSent, setResendSent] = useState(false);
  const [resending, setResending] = useState(false);

  // ── detect expired OTP from URL hash ────────────────────────────────────────
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('error_code=otp_expired') || hash.includes('error=access_denied')) {
      setLinkExpired(true);
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  // ── pre-fill name from profile / user metadata ───────────────────────────
  useEffect(() => {
    if (profile?.first_name) setFirstName(profile.first_name);
    if (profile?.last_name)  setLastName(profile.last_name);
  }, [profile]);

  // ── guard: already fully set up → go to dashboard ────────────────────────
  useEffect(() => {
    if (!loading && profile?.onboarding_complete) {
      navigate('/account', { replace: true });
    }
  }, [loading, profile, navigate]);

  // ── Google Places on step 3 ───────────────────────────────────────────────
  useEffect(() => {
    if (step !== 3 || !addressInputRef.current) return;
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) return;
    const loader = new Loader({ apiKey, version: 'weekly', libraries: ['places'] });
    loader.load().then(() => {
      if (!addressInputRef.current || autocompleteRef.current) return;
      autocompleteRef.current = new google.maps.places.Autocomplete(
        addressInputRef.current,
        { types: ['address'], componentRestrictions: { country: 'us' }, fields: ['formatted_address'] }
      );
      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current?.getPlace();
        if (place?.formatted_address) setAddress(place.formatted_address);
      });
    }).catch(() => { /* graceful fallback */ });
  }, [step]);

  // ── handlers ─────────────────────────────────────────────────────────────

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

  const advanceStep = () => {
    if (step === 0) {
      if (password.length < 8) {
        toast({ title: 'Password too short', description: 'Password must be at least 8 characters.', variant: 'destructive' });
        return;
      }
      if (password !== confirmPassword) {
        toast({ title: 'Passwords do not match', description: 'Please make sure both fields match.', variant: 'destructive' });
        return;
      }
    }
    if (step === 1 && !firstName.trim()) {
      toast({ title: 'First name required', description: 'Please enter your first name.', variant: 'destructive' });
      return;
    }
    setStep(s => s + 1);
  };

  /** Single DB write — only called at the very end of step 3 */
  const handleFinish = async () => {
    setSubmitting(true);
    try {
      // 1. Set Supabase Auth password
      const { error: pwError } = await supabase.auth.updateUser({ password });
      if (pwError) throw pwError;

      // 2. Update profile in one shot
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          password_set: true,
          first_name: firstName.trim() || null,
          last_name: lastName.trim() || null,
          ...(phone.trim() ? { phone: phone.trim() } : {}),
          onboarding_complete: true,
        })
        .eq('user_id', user!.id);
      if (profileError) throw profileError;

      // 3. Optionally add first property
      if (address.trim()) {
        await supabase.from('properties').insert({
          user_id: user!.id,
          address: address.trim(),
          name: 'My Home',
          type: 'residential',
        });
      }

      toast({ title: 'Welcome to Asset Safe!', description: 'Your account is ready.' });

      // Sync in-memory profile before navigating so ProtectedRoute sees the updated state
      await refreshProfile();
      navigate('/account', { replace: true });
    } catch (err: any) {
      // "lock broken by steal" is a client-side Web Locks race — the server writes already
      // succeeded. Redirect silently rather than showing a confusing error to the user.
      if (err?.message?.includes('lock broken') || err?.message?.includes('steal')) {
        navigate('/account', { replace: true });
        return;
      }
      toast({ title: 'Error', description: err.message || 'Something went wrong. Please try again.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  // ── loading spinner ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary" />
      </div>
    );
  }

  // ── expired link UI ───────────────────────────────────────────────────────
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

  // ── wizard UI ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">

        {/* Progress stepper */}
        <div className="flex items-center justify-between">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const done   = step > s.id;
            const active = step === s.id;
            return (
              <div key={s.id} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-9 h-9 rounded-full border-2 transition-colors ${
                  done   ? 'bg-primary border-primary text-primary-foreground' :
                  active ? 'border-primary text-primary' :
                           'border-muted text-muted-foreground'
                }`}>
                  {done ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${step > s.id ? 'bg-primary' : 'bg-muted'}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* ── Step 0: Password ── */}
        {step === 0 && (
          <div className="space-y-6">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Secure your account</h1>
                <p className="mt-1 text-muted-foreground text-sm">
                  Choose a password to protect your Asset Safe account.
                </p>
              </div>
            </div>

            <div className="space-y-4">
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

              <Button className="w-full" size="lg" onClick={advanceStep}>
                Continue
              </Button>
            </div>

            <p className="text-center text-xs text-muted-foreground">
              Your password is stored securely and encrypted. Asset Safe staff cannot see it.
            </p>
          </div>
        )}

        {/* ── Step 1: Name ── */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-bold text-foreground">What's your name?</h2>
              <p className="text-muted-foreground mt-1 text-sm">This personalizes your experience.</p>
            </div>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  placeholder="Jane"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  placeholder="Smith"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setStep(0)}>Back</Button>
              <Button className="flex-1" size="lg" onClick={advanceStep} disabled={!firstName.trim()}>
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 2: Phone ── */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Phone number{' '}
                <span className="text-muted-foreground text-lg font-normal">(optional)</span>
              </h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Used for security alerts and account recovery only.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>Back</Button>
              <Button className="flex-1" size="lg" onClick={() => setStep(3)}>Continue</Button>
            </div>
          </div>
        )}

        {/* ── Step 3: Property ── */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Add your first property{' '}
                <span className="text-muted-foreground text-lg font-normal">(optional)</span>
              </h2>
              <p className="text-muted-foreground mt-1 text-sm">
                You can add more properties later from your dashboard.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Property address</Label>
              <Input
                id="address"
                ref={addressInputRef}
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="123 Main St, City, State"
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>Back</Button>
              <Button
                className="flex-1"
                size="lg"
                onClick={handleFinish}
                disabled={submitting}
              >
                {submitting ? 'Setting up...' : 'Go to Dashboard'}
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CreatePassword;
