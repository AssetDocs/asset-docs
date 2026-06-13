/**
 * MfaStepUpDialog — TOTP + backup-code verification UI for sensitive actions.
 *
 * Freshness is written server-side to `mfa_step_up_sessions` by the
 * `mfa-step-up` edge function. The TOTP path may rotate the Supabase auth
 * session (forwarded `session` from `challengeAndVerify`); the backup-code
 * path does NOT — it relies solely on the step-up row.
 *
 * `onVerified` MUST only be invoked after any required `setSession()` call
 * has resolved, so callers (via `StepUpProvider` + `invokeWithStepUp`) can
 * safely retry the gated request exactly once.
 */
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Key, Loader2 } from 'lucide-react';
import { useTOTP } from '@/hooks/useTOTP';
import { useMfaStepUp } from '@/hooks/useMfaStepUp';
import { useToast } from '@/hooks/use-toast';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called after a successful step-up. */
  onVerified: () => void;
  title?: string;
  description?: string;
}

const MfaStepUpDialog: React.FC<Props> = ({
  open,
  onOpenChange,
  onVerified,
  title = 'Confirm with your authenticator',
  description = 'For your security, please re-verify before continuing.',
}) => {
  const { factors } = useTOTP();
  const { isVerifying, stepUpWithTotp, stepUpWithBackupCode } = useMfaStepUp();
  const { toast } = useToast();
  const [totp, setTotp] = useState('');
  const [backup, setBackup] = useState('');

  const verifiedFactor = factors.find((f) => f.status === 'verified');

  const handleTotp = async () => {
    if (!verifiedFactor) {
      toast({ title: 'No authenticator', description: 'Enable MFA first.', variant: 'destructive' });
      return;
    }
    try {
      await stepUpWithTotp(verifiedFactor.id, totp);
      setTotp('');
      onVerified();
      onOpenChange(false);
    } catch {
      toast({
        title: 'Verification failed',
        description: 'The code was invalid or expired. Enter the newest code and try again.',
        variant: 'destructive',
      });
    }
  };

  const handleBackup = async () => {
    try {
      await stepUpWithBackupCode(backup);
      setBackup('');
      onVerified();
      onOpenChange(false);
      toast({ title: 'Backup code accepted', description: 'That code has been used.' });
    } catch {
      toast({
        title: 'Verification failed',
        description: 'The backup code was invalid or could not be verified.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="totp" className="mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="totp">Authenticator</TabsTrigger>
            <TabsTrigger value="backup">Backup code</TabsTrigger>
          </TabsList>

          <TabsContent value="totp" className="space-y-3 pt-3">
            <Label htmlFor="step-up-totp">6-digit code</Label>
            <Input
              id="step-up-totp"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={totp}
              onChange={(e) => setTotp(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              autoFocus
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isVerifying}>
                Cancel
              </Button>
              <Button onClick={handleTotp} disabled={isVerifying || totp.length !== 6}>
                {isVerifying ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Shield className="h-4 w-4 mr-2" />}
                Verify
              </Button>
            </DialogFooter>
          </TabsContent>

          <TabsContent value="backup" className="space-y-3 pt-3">
            <Label htmlFor="step-up-backup">Backup code</Label>
            <Input
              id="step-up-backup"
              autoComplete="one-time-code"
              value={backup}
              onChange={(e) => setBackup(e.target.value.toUpperCase())}
              placeholder="XXXX-XXXX"
            />
            <p className="text-xs text-muted-foreground">
              Each backup code works only once. We'll mark it used.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isVerifying}>
                Cancel
              </Button>
              <Button onClick={handleBackup} disabled={isVerifying || backup.replace(/-/g, '').length < 8}>
                {isVerifying ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Key className="h-4 w-4 mr-2" />}
                Use code
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default MfaStepUpDialog;
