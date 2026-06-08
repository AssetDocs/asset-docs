import { useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface StepUpResult {
  success: boolean;
  method?: 'totp' | 'backup_code';
  stepped_up_until?: string;
}

/**
 * useMfaStepUp — calls the `mfa-step-up` edge function which performs a
 * user-scoped TOTP challengeAndVerify (or backup-code redemption) and records
 * a server-side step-up session. If Supabase returns a refreshed session, we
 * forward it to the browser client so the local AAL2 state catches up.
 *
 * The security boundary is the server-side `mfa_step_up_sessions` row, not the
 * browser session AAL — sensitive edge functions re-check freshness themselves.
 */
export const useMfaStepUp = () => {
  const [isVerifying, setIsVerifying] = useState(false);

  const stepUpWithTotp = useCallback(async (factorId: string, code: string): Promise<StepUpResult> => {
    setIsVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke('mfa-step-up', {
        body: { factorId, code },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Step-up failed');

      // Best-effort: if the edge function returned a refreshed session, update
      // the browser client. Failures here are non-fatal — server enforcement
      // already happened via the mfa_step_up_sessions row.
      if (data.session?.access_token && data.session?.refresh_token) {
        try {
          await supabase.auth.setSession({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
          });
        } catch (e) {
          console.warn('Could not apply refreshed session from step-up:', e);
        }
      }

      return { success: true, method: data.method, stepped_up_until: data.stepped_up_until };
    } finally {
      setIsVerifying(false);
    }
  }, []);

  const stepUpWithBackupCode = useCallback(async (backupCode: string): Promise<StepUpResult> => {
    setIsVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke('mfa-step-up', {
        body: { backupCode },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Step-up failed');
      return { success: true, method: data.method, stepped_up_until: data.stepped_up_until };
    } finally {
      setIsVerifying(false);
    }
  }, []);

  return { isVerifying, stepUpWithTotp, stepUpWithBackupCode };
};
