import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  invokeWithStepUp,
  isStepUpCancelled,
  isStepUpPromptFailed,
} from '@/lib/invokeWithStepUp';
import { useStepUpPrompt } from '@/contexts/StepUpContext';
import { toast } from '@/hooks/use-toast';

interface BackupCodesStatus {
  remainingCodes: number;
  hasBackupCodes: boolean;
}

export const useBackupCodes = () => {
  const { session } = useAuth();
  const { promptStepUp } = useStepUpPrompt();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<BackupCodesStatus | null>(null);

  // Status read carries no secrets and does not require step-up.
  const fetchStatus = useCallback(async () => {
    if (!session?.access_token) return null;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('manage-backup-codes', {
        body: { action: 'status' },
      });

      if (error) throw error;

      setStatus({
        remainingCodes: data.remainingCodes,
        hasBackupCodes: data.hasBackupCodes,
      });

      return data;
    } catch (error) {
      console.error('Error fetching backup codes status:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [session?.access_token]);

  /**
   * Generate (or regenerate) backup codes. Routed through invokeWithStepUp
   * so an unmet step-up surfaces the global MFA dialog and retries once.
   * Returns the new codes on success, or `null` on cancellation / any error
   * (toasts are shown for non-success paths).
   */
  const generateCodes = useCallback(async (): Promise<string[] | null> => {
    if (!session?.access_token) return null;

    setIsLoading(true);
    try {
      const result = await invokeWithStepUp<{ codes?: string[] }>(
        'manage-backup-codes',
        { body: { action: 'generate' } },
        () =>
          promptStepUp({
            title: 'Verify to generate backup codes',
            description:
              'Confirm your authenticator before we generate new recovery codes.',
          }),
      );

      if (isStepUpCancelled(result.error)) {
        toast({
          title: 'Verification cancelled',
          description: 'Backup codes were not generated.',
        });
        return null;
      }
      if (isStepUpPromptFailed(result.error)) {
        toast({
          title: 'Verification failed',
          description: 'Could not complete verification. Please try again.',
          variant: 'destructive',
        });
        return null;
      }
      if (result.error) {
        toast({
          title: 'Error',
          description: "Couldn't generate backup codes. Please try again.",
          variant: 'destructive',
        });
        return null;
      }

      const codes = result.data?.codes ?? null;
      if (!codes) {
        toast({
          title: 'Error',
          description: "Couldn't generate backup codes. Please try again.",
          variant: 'destructive',
        });
        return null;
      }

      // Refresh status after generating
      await fetchStatus();
      return codes;
    } finally {
      setIsLoading(false);
    }
  }, [session?.access_token, fetchStatus, promptStepUp]);

  // Verifying a backup code IS the step-up proof — must not recurse through
  // invokeWithStepUp.
  const verifyCode = useCallback(async (code: string): Promise<boolean> => {
    if (!session?.access_token) return false;

    try {
      const { data, error } = await supabase.functions.invoke('manage-backup-codes', {
        body: { action: 'verify', code },
      });

      if (error) throw error;

      if (data.success) {
        await fetchStatus();
      }

      return data.success;
    } catch (error) {
      console.error('Error verifying backup code:', error);
      return false;
    }
  }, [session?.access_token, fetchStatus]);

  return {
    status,
    isLoading,
    fetchStatus,
    generateCodes,
    verifyCode,
  };
};
