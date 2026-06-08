import { useCallback, useState } from 'react';
import { invokeWithStepUp, isStepUpRequired } from '@/lib/invokeWithStepUp';
import { useStepUpPrompt } from '@/contexts/StepUpContext';
import { toast } from '@/hooks/use-toast';

/**
 * Centralized customer-portal opener. The edge function requires an active
 * MFA step-up for users with MFA enrolled — this hook auto-prompts and retries.
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
      if (isStepUpRequired(result)) {
        toast({
          title: 'MFA verification required',
          description: 'Please verify to open the billing portal.',
          variant: 'destructive',
        });
        return;
      }
      if (result.error) throw result.error;
      const url = result.data?.url;
      if (!url) throw new Error('No portal URL returned');
      if (opts?.newTab) window.open(url, '_blank');
      else window.location.href = url;
    } catch (e: any) {
      toast({
        title: 'Error',
        description: e?.message || 'Failed to open billing portal. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [opts?.newTab, promptStepUp]);

  return { open, loading };
}
