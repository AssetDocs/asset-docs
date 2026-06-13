import { useCallback, useState } from 'react';
import {
  invokeWithStepUp,
  isStepUpCancelled,
  isStepUpPromptFailed,
} from '@/lib/invokeWithStepUp';
import { useStepUpPrompt } from '@/contexts/StepUpContext';
import { toast } from '@/hooks/use-toast';

/**
 * Centralized customer-portal opener. The edge function requires an active
 * MFA step-up for users with MFA enrolled — this hook auto-prompts and retries
 * exactly once via `invokeWithStepUp`. All error paths surface sanitized
 * toasts; raw FunctionsHttpError text is never shown.
 */
export function useOpenCustomerPortal(opts?: { newTab?: boolean }) {
  const [loading, setLoading] = useState(false);
  const { promptStepUp } = useStepUpPrompt();

  const open = useCallback(async () => {
    setLoading(true);
    try {
      const result = await invokeWithStepUp<{ url?: string }>(
        'customer-portal',
        {},
        () =>
          promptStepUp({
            title: 'Open billing portal',
            description: 'Verify with your authenticator to manage billing.',
          }),
      );

      if (isStepUpCancelled(result.error)) {
        toast({
          title: 'Verification cancelled',
          description: 'Billing portal was not opened.',
        });
        return;
      }
      if (isStepUpPromptFailed(result.error)) {
        toast({
          title: 'Verification failed',
          description: 'Could not complete verification. Please try again.',
          variant: 'destructive',
        });
        return;
      }
      if (result.error) {
        // Generic — never surface raw FunctionsHttpError text.
        toast({
          title: 'Error',
          description: "Couldn't open billing portal. Please try again.",
          variant: 'destructive',
        });
        return;
      }

      const url = result.data?.url;
      if (!url) {
        toast({
          title: 'Error',
          description: "Couldn't open billing portal. Please try again.",
          variant: 'destructive',
        });
        return;
      }
      if (opts?.newTab) window.open(url, '_blank');
      else window.location.href = url;
    } finally {
      setLoading(false);
    }
  }, [opts?.newTab, promptStepUp]);

  return { open, loading };
}
