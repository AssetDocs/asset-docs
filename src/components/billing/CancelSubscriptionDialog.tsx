// @ts-nocheck
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Database, Users, Clock, CheckCircle2, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Props {
  open: boolean;
  onClose: () => void;
  onCancelled?: () => void;
  periodEndIso?: string | null;
}

const REASONS = [
  'Too expensive',
  'Not using it enough',
  'Missing features I need',
  'Switching to another service',
  'Privacy concerns',
  'Just trying it out',
  'Other',
];

const CancelSubscriptionDialog: React.FC<Props> = ({ open, onClose, onCancelled, periodEndIso }) => {
  const { toast } = useToast();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [reason, setReason] = useState<string>('');
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setStep(1);
    setReason('');
    setComments('');
    setSubmitting(false);
  };

  const handleClose = () => {
    if (submitting) return;
    reset();
    onClose();
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const { error } = await supabase.functions.invoke('cancel-subscription', {
        body: { action: 'cancel', reason, comments },
        headers: { Authorization: `Bearer ${sessionData.session?.access_token}` },
      });
      if (error) throw error;
      toast({
        title: 'Cancellation confirmed',
        description:
          "Your subscription cancellation has been confirmed. We've sent a confirmation email and notified any active authorized users.",
      });
      onCancelled?.();
      handleClose();
    } catch (e: any) {
      toast({
        title: 'Could not cancel subscription',
        description: e?.message || 'Please try again or contact support.',
        variant: 'destructive',
      });
      setSubmitting(false);
    }
  };

  const periodEnd = periodEndIso ? new Date(periodEndIso) : null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-lg">
        {step === 1 && (
          <>
            <DialogHeader>
              <DialogTitle>Cancel Subscription</DialogTitle>
              <DialogDescription>
                Here's exactly what cancelling means — no surprises.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div className="flex gap-3">
                <Clock className="h-5 w-5 text-brand-orange shrink-0 mt-0.5" />
                <p className="text-sm">
                  You'll keep full access until the end of your current billing period
                  {periodEnd && <> (<strong>{periodEnd.toLocaleDateString()}</strong>)</>}.
                </p>
              </div>
              <div className="flex gap-3">
                <Database className="h-5 w-5 text-brand-orange shrink-0 mt-0.5" />
                <p className="text-sm">
                  <strong>No data is deleted.</strong> Your records, files, Family Archive, Legacy Locker, and Password Catalog remain securely stored.
                </p>
              </div>
              <div className="flex gap-3">
                <Shield className="h-5 w-5 text-brand-orange shrink-0 mt-0.5" />
                <p className="text-sm">
                  After expiration, you'll continue to have read-only access to view, export, or reactivate at any time.
                </p>
              </div>
              <div className="flex gap-3">
                <Users className="h-5 w-5 text-brand-orange shrink-0 mt-0.5" />
                <p className="text-sm">
                  Authorized users will retain access until the end of the billing period.
                </p>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={handleClose}>Keep Subscription</Button>
              <Button onClick={() => setStep(2)}>Continue</Button>
            </DialogFooter>
          </>
        )}

        {step === 2 && (
          <>
            <DialogHeader>
              <DialogTitle>Help us improve (optional)</DialogTitle>
              <DialogDescription>
                Mind sharing why you're cancelling? You can skip this.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <RadioGroup value={reason} onValueChange={setReason}>
                {REASONS.map((r) => (
                  <div key={r} className="flex items-center gap-2">
                    <RadioGroupItem value={r} id={`r-${r}`} />
                    <Label htmlFor={`r-${r}`} className="font-normal cursor-pointer">{r}</Label>
                  </div>
                ))}
              </RadioGroup>
              <div>
                <Label htmlFor="comments" className="text-sm">Anything else? (optional)</Label>
                <Textarea
                  id="comments"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={3}
                  className="mt-1"
                  placeholder="Your feedback helps us improve Asset Safe."
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
              </Button>
              <Button onClick={() => setStep(3)}>Continue</Button>
            </DialogFooter>
          </>
        )}

        {step === 3 && (
          <>
            <DialogHeader>
              <DialogTitle>Confirm Cancellation</DialogTitle>
              <DialogDescription>
                One last check before we cancel future billing.
              </DialogDescription>
            </DialogHeader>
            <Alert className="my-2">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                <strong>No data will be deleted.</strong> You'll keep full access until
                {periodEnd ? <> <strong>{periodEnd.toLocaleDateString()}</strong></> : ' the end of your billing period'},
                then move to read-only mode. You can reactivate anytime.
              </AlertDescription>
            </Alert>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setStep(2)} disabled={submitting}>
                <ArrowLeft className="h-4 w-4 mr-1" /> Go Back
              </Button>
              <Button variant="destructive" onClick={handleConfirm} disabled={submitting}>
                {submitting ? 'Cancelling…' : 'Confirm Cancellation'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CancelSubscriptionDialog;
