// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, ArrowLeft, Download, ShieldAlert } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface Props {
  open: boolean;
  onClose: () => void;
  onScheduled?: () => void;
}

const DELETE_REASONS = [
  'No longer need it',
  'Privacy concerns',
  'Too expensive',
  'Switching services',
  'Created by mistake',
  'Other',
];

const CONFIRM_PHRASE = 'DELETE MY ACCOUNT';

const DeleteAccountDialog: React.FC<Props> = ({ open, onClose, onScheduled }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [impact, setImpact] = useState<any | null>(null);
  const [loadingImpact, setLoadingImpact] = useState(false);
  const [password, setPassword] = useState('');
  const [reauthError, setReauthError] = useState('');
  const [reason, setReason] = useState('');
  const [comments, setComments] = useState('');
  const [typed, setTyped] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<string | null>(null);
  const [scheduledReason, setScheduledReason] = useState<'billing_period' | 'default_30_days' | null>(null);

  const reset = () => {
    setStep(1); setPassword(''); setReason(''); setComments(''); setTyped(''); setReauthError('');
  };
  const handleClose = () => { if (submitting) return; reset(); onClose(); };

  useEffect(() => {
    if (!open || step !== 1 || impact) return;
    (async () => {
      setLoadingImpact(true);
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const { data, error } = await supabase.functions.invoke('get-account-impact', {
          headers: { Authorization: `Bearer ${sessionData.session?.access_token}` },
        });
        if (!error) setImpact(data);
      } catch { /* non-fatal */ }
      setLoadingImpact(false);
    })();
  }, [open, step, impact]);

  const verifyPassword = async () => {
    setReauthError('');
    if (!user?.email || !password) {
      setReauthError('Please enter your password');
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email: user.email, password });
    if (error) {
      setReauthError('Password incorrect. Please try again.');
      return;
    }
    setStep(3);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke('request-account-closure', {
        body: { reason, comments },
        headers: { Authorization: `Bearer ${sessionData.session?.access_token}` },
      });
      if (error) throw error;
      const req = (data as any)?.request;
      if (req?.deletion_scheduled_date) setScheduledDate(req.deletion_scheduled_date);
      setScheduledReason(req?.current_period_end ? 'billing_period' : 'default_30_days');
      onScheduled?.();
      setStep(5);
    } catch (e: any) {
      toast({ title: 'Could not schedule deletion', description: e?.message || 'Please try again.', variant: 'destructive' });
    }
    setSubmitting(false);
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-lg">
        {step === 1 && (
          <>
            <DialogHeader>
              <DialogTitle className="text-destructive flex items-center gap-2">
                <ShieldAlert className="h-5 w-5" /> Delete Account
              </DialogTitle>
              <DialogDescription>
                This is different from cancelling your subscription. Deletion is permanent.
              </DialogDescription>
            </DialogHeader>
            <Alert variant="destructive" className="my-2">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Permanent action</AlertTitle>
              <AlertDescription>
                Once the scheduled date passes, your account and all data will be
                permanently removed and <strong>cannot be recovered</strong>.
              </AlertDescription>
            </Alert>
            {loadingImpact && <p className="text-sm text-muted-foreground">Calculating account impact…</p>}
            {impact && (
              <div className="text-sm space-y-1 bg-muted/40 rounded p-3">
                <div className="font-medium mb-1">What will be deleted:</div>
                <div>• {impact.properties ?? 0} properties</div>
                <div>• {impact.items ?? 0} assets</div>
                <div>• {impact.files ?? 0} files</div>
                <div>• {impact.authorized_users ?? 0} authorized users</div>
                {impact.has_legacy_locker && <div>• Legacy Locker contents</div>}
                {impact.has_password_catalog && <div>• Password Catalog entries</div>}
              </div>
            )}
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => { handleClose(); navigate('/account?tab=export'); }}>
                <Download className="h-4 w-4 mr-1" /> Export My Data First
              </Button>
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button variant="destructive" onClick={() => setStep(2)}>Continue</Button>
            </DialogFooter>
          </>
        )}

        {step === 2 && (
          <>
            <DialogHeader>
              <DialogTitle>Verify it's you</DialogTitle>
              <DialogDescription>Please enter your password to continue.</DialogDescription>
            </DialogHeader>
            <div className="space-y-2 py-2">
              <Label htmlFor="pw">Password</Label>
              <Input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
              {reauthError && <p className="text-sm text-destructive">{reauthError}</p>}
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setStep(1)}><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
              <Button onClick={verifyPassword}>Verify</Button>
            </DialogFooter>
          </>
        )}

        {step === 3 && (
          <>
            <DialogHeader>
              <DialogTitle>Help us improve (optional)</DialogTitle>
              <DialogDescription>Why are you deleting your account?</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <RadioGroup value={reason} onValueChange={setReason}>
                {DELETE_REASONS.map((r) => (
                  <div key={r} className="flex items-center gap-2">
                    <RadioGroupItem value={r} id={`dr-${r}`} />
                    <Label htmlFor={`dr-${r}`} className="font-normal cursor-pointer">{r}</Label>
                  </div>
                ))}
              </RadioGroup>
              <div>
                <Label className="text-sm" htmlFor="dc">Comments (optional)</Label>
                <Textarea id="dc" value={comments} onChange={(e) => setComments(e.target.value)} rows={3} className="mt-1" />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setStep(2)}><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
              <Button variant="destructive" onClick={() => setStep(4)}>Continue</Button>
            </DialogFooter>
          </>
        )}

        {step === 4 && (
          <>
            <DialogHeader>
              <DialogTitle className="text-destructive">Final Confirmation</DialogTitle>
              <DialogDescription>
                Type <strong>{CONFIRM_PHRASE}</strong> exactly to schedule permanent deletion.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 py-2">
              <Input
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                placeholder={CONFIRM_PHRASE}
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Until the scheduled deletion date, you may reverse this from Account Settings.
              </p>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setStep(3)} disabled={submitting}>
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
              </Button>
              <Button
                variant="destructive"
                disabled={typed !== CONFIRM_PHRASE || submitting}
                onClick={handleSubmit}
              >
                {submitting ? 'Scheduling…' : 'Permanently Delete'}
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 5 && (
          <>
            <DialogHeader>
              <DialogTitle>Deletion Scheduled</DialogTitle>
              <DialogDescription>
                {scheduledDate ? (
                  <>
                    Your account is scheduled for permanent deletion on{' '}
                    <strong>{formatDate(scheduledDate)}</strong>.
                  </>
                ) : (
                  <>We've scheduled your account for permanent deletion.</>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="text-sm text-muted-foreground space-y-2 py-2">
              {scheduledReason === 'billing_period' && (
                <p>This date matches the end of your current billing period.</p>
              )}
              {scheduledReason === 'default_30_days' && (
                <p>This is 30 days from today.</p>
              )}
              <p>
                Until that date, you retain read-only access and can reverse this request from
                Account Settings at any time.
              </p>
            </div>
            <DialogFooter>
              <Button onClick={handleClose}>Close</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DeleteAccountDialog;
      </DialogContent>
    </Dialog>
  );
};

export default DeleteAccountDialog;
