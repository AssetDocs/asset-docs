import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { User, Phone, Home, CheckCircle2 } from 'lucide-react';

const STEPS = [
  { id: 1, label: 'Your name', icon: User },
  { id: 2, label: 'Phone number', icon: Phone },
  { id: 3, label: 'First property', icon: Home },
];

const Onboarding = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Pre-fill from profile if available
  useEffect(() => {
    if (profile) {
      if (profile.first_name) setFirstName(profile.first_name);
      if (profile.last_name) setLastName(profile.last_name);
    }
  }, [profile]);

  // Guard: if already complete, skip to dashboard
  useEffect(() => {
    if (!loading && profile?.onboarding_complete) {
      navigate('/account', { replace: true });
    }
  }, [loading, profile, navigate]);

  // Guard: must have password set to be here
  useEffect(() => {
    if (!loading && user && profile && !profile.password_set) {
      navigate('/welcome/create-password', { replace: true });
    }
  }, [loading, user, profile, navigate]);

  const handleFinish = async () => {
    setSubmitting(true);
    try {
      // Update profile with name
      await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          onboarding_complete: true,
        })
        .eq('user_id', user!.id);

      // Create first property if address provided
      if (address.trim()) {
        await supabase.from('properties').insert({
          user_id: user!.id,
          address: address.trim(),
          name: 'My Home',
          type: 'residential',
        });
      }

      toast({ title: 'Welcome to Asset Safe!', description: 'Your account is ready.' });
      navigate('/account', { replace: true });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Something went wrong.', variant: 'destructive' });
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Progress */}
        <div className="flex items-center justify-between">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const done = step > s.id;
            const active = step === s.id;
            return (
              <div key={s.id} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-9 h-9 rounded-full border-2 transition-colors ${
                  done ? 'bg-primary border-primary text-primary-foreground' :
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

        {/* Step content */}
        <div className="space-y-6">
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-bold text-foreground">What's your name?</h2>
                <p className="text-muted-foreground mt-1">This personalizes your experience.</p>
              </div>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First name</Label>
                  <Input id="firstName" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Jane" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input id="lastName" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Smith" />
                </div>
              </div>
              <Button className="w-full" size="lg" onClick={() => setStep(2)} disabled={!firstName.trim()}>
                Continue
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Phone number <span className="text-muted-foreground text-lg font-normal">(optional)</span></h2>
                <p className="text-muted-foreground mt-1">Used for security alerts and account recovery only.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>Back</Button>
                <Button className="flex-1" size="lg" onClick={() => setStep(3)}>Continue</Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Add your first property <span className="text-muted-foreground text-lg font-normal">(optional)</span></h2>
                <p className="text-muted-foreground mt-1">You can add more properties later from your dashboard.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Property address</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="123 Main St, City, State"
                />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>Back</Button>
                <Button className="flex-1" size="lg" onClick={handleFinish} disabled={submitting}>
                  {submitting ? 'Setting up...' : 'Go to Dashboard'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
