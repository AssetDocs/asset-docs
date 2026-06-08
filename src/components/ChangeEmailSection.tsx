import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Loader2, CheckCircle2, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useStepUpPrompt } from '@/contexts/StepUpContext';
import { invokeWithStepUp } from '@/lib/invokeWithStepUp';
import { useToast } from '@/hooks/use-toast';

/**
 * ChangeEmailSection — Lets a signed-in user request an email change.
 *
 * Flow:
 *   1. User enters new email and clicks "Send confirmation link".
 *   2. If MFA is enrolled, the step-up dialog appears and the user verifies.
 *   3. `request-email-change` issues a one-time token and emails the new
 *      address; a security alert goes to the old address.
 *   4. The user clicks the link in the new mailbox, which lands them on
 *      /confirm-email-change to finalize the change.
 *
 * The email is NOT changed until the link is clicked — so a stolen session
 * alone cannot silently take over an account via email change.
 */
const ChangeEmailSection: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { promptStepUp } = useStepUpPrompt();
  const [newEmail, setNewEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newEmail.trim().toLowerCase();
    if (!trimmed || trimmed === user?.email?.toLowerCase()) {
      toast({ title: 'Enter a different email', variant: 'destructive' });
      return;
    }
    setSending(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const { data, error } = await invokeWithStepUp(
        'request-email-change',
        {
          body: { newEmail: trimmed },
          headers: { Authorization: `Bearer ${sessionData.session?.access_token}` },
        },
        () => promptStepUp({
          title: 'Verify before changing your email',
          description: 'For security, confirm your authenticator to start an email change.',
        }),
      );
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);

      setSentTo(trimmed);
      setNewEmail('');
      toast({
        title: 'Confirmation email sent',
        description: `Check ${trimmed} to finish the change. The link expires in 15 minutes.`,
      });
    } catch (err: any) {
      toast({
        title: 'Could not start email change',
        description: err?.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email address
        </CardTitle>
        <CardDescription>
          Change the email used to sign in and receive account notifications.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <Label className="text-muted-foreground">Current email</Label>
          <p className="text-sm font-medium">{user?.email || '—'}</p>
        </div>

        {sentTo ? (
          <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700 dark:text-green-300">
              We sent a confirmation link to <strong>{sentTo}</strong>. Click it within
              15 minutes to finish the change. Your current email stays active until you confirm.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              We'll email a confirmation link to your new address. Your sign-in email
              won't change until you click that link.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="new-email">New email</Label>
            <Input
              id="new-email"
              type="email"
              autoComplete="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="you@new-address.com"
              disabled={sending}
              required
            />
          </div>
          <Button type="submit" disabled={sending || !newEmail.trim()}>
            {sending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Mail className="h-4 w-4 mr-2" />
            )}
            Send confirmation link
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ChangeEmailSection;
