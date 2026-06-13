import { useCallback, useState } from 'react';
import {
  invokeWithStepUp,
  isStepUpCancelled,
  isStepUpPromptFailed,
} from '@/lib/invokeWithStepUp';
import { useStepUpPrompt } from '@/contexts/StepUpContext';
import { toast } from '@/hooks/use-toast';

/**
 * Typed result returned by `open()`. The portal URL is NEVER returned to
 * callers — it is single-use and only navigated inside this hook.
 *
 *  - `cancelled`     — user dismissed the MFA prompt.
 *  - `prompt_failed` — MFA prompt threw, or no session remained afterwards.
 *  - `portal_failed` — generic failure: invoke error, invalid/missing URL,
 *                      popup blocker, opener-isolation failure, or closed
 *                      placeholder by the time we tried to navigate it.
 *  - `busy`          — another portal open is already in flight anywhere
 *                      in the app. No toast is shown for this case (it is
 *                      the expected reaction to accidental double-clicks).
 */
export type OpenPortalResult =
  | { ok: true }
  | {
      ok: false;
      reason: 'cancelled' | 'prompt_failed' | 'portal_failed' | 'busy';
    };

/**
 * Module-level lock shared across every `useOpenCustomerPortal()` consumer.
 * A hook-local ref would only deduplicate within one component instance —
 * ManageTab and StripeTestPanel must share a single in-flight promise so
 * rapid double-invocations cannot trigger overlapping MFA prompts or
 * duplicate portal sessions.
 */
let inFlightPortal: Promise<OpenPortalResult> | null = null;

const PORTAL_FAILED_TOAST = {
  title: 'Error',
  description: "Couldn't open billing portal. Please try again.",
  variant: 'destructive' as const,
};

/**
 * Centralized customer-portal opener.
 *
 * Behavior:
 *  - Auto-prompts MFA step-up via `invokeWithStepUp` and retries once.
 *  - All error paths surface sanitized toasts; raw FunctionsHttpError text
 *    is never shown and the portal URL is never exposed.
 *  - When `newTab: true`, opens a hardened `about:blank` placeholder
 *    synchronously inside the user gesture (so popup blockers do not fire
 *    later, after async work), severs `opener` access (fail-closed if that
 *    cannot be established), then navigates the placeholder on success or
 *    closes it on failure.
 *  - A module-level lock prevents concurrent portal opens anywhere in the
 *    app; a second call while one is in flight returns `{ ok: false,
 *    reason: 'busy' }` with no toast.
 */
export function useOpenCustomerPortal(opts?: { newTab?: boolean }) {
  const [loading, setLoading] = useState(false);
  const { promptStepUp } = useStepUpPrompt();
  const newTab = !!opts?.newTab;

  const open = useCallback(async (): Promise<OpenPortalResult> => {
    // Module-level busy guard — silent by design.
    if (inFlightPortal) {
      return { ok: false, reason: 'busy' };
    }

    // ---- Synchronous placeholder open (must stay in the user gesture) ----
    let placeholder: Window | null = null;
    if (newTab) {
      try {
        placeholder = window.open('about:blank', '_blank');
      } catch {
        placeholder = null;
      }
      if (!placeholder) {
        toast(PORTAL_FAILED_TOAST);
        return { ok: false, reason: 'portal_failed' };
      }
      // Sever opener access. Fail closed if we cannot.
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (placeholder as any).opener = null;
      } catch {
        try {
          placeholder.close();
        } catch {
          /* ignore */
        }
        toast(PORTAL_FAILED_TOAST);
        return { ok: false, reason: 'portal_failed' };
      }
    }

    const closePlaceholder = () => {
      if (!placeholder) return;
      try {
        placeholder.close();
      } catch {
        /* ignore */
      }
    };

    setLoading(true);

    const work = (async (): Promise<OpenPortalResult> => {
      try {
        const result = await invokeWithStepUp<{ url?: string }>(
          'customer-portal',
          {},
          () =>
            promptStepUp({
              title: 'Open billing portal',
              description:
                'Verify with your authenticator to manage billing.',
            }),
        );

        if (isStepUpCancelled(result.error)) {
          closePlaceholder();
          toast({
            title: 'Verification cancelled',
            description: 'Billing portal was not opened.',
          });
          return { ok: false, reason: 'cancelled' };
        }
        if (isStepUpPromptFailed(result.error)) {
          closePlaceholder();
          toast({
            title: 'Verification failed',
            description:
              'Could not complete verification. Please try again.',
            variant: 'destructive',
          });
          return { ok: false, reason: 'prompt_failed' };
        }
        if (result.error) {
          closePlaceholder();
          toast(PORTAL_FAILED_TOAST);
          return { ok: false, reason: 'portal_failed' };
        }

        const url = result.data?.url;
        if (!url || typeof url !== 'string') {
          closePlaceholder();
          toast(PORTAL_FAILED_TOAST);
          return { ok: false, reason: 'portal_failed' };
        }

        if (newTab) {
          // Placeholder may have been closed by the user mid-flight, or
          // become inaccessible (cross-origin after a swap). Any failure
          // here is fail-closed.
          if (!placeholder || placeholder.closed) {
            toast(PORTAL_FAILED_TOAST);
            return { ok: false, reason: 'portal_failed' };
          }
          try {
            placeholder.location.replace(url);
          } catch {
            closePlaceholder();
            toast(PORTAL_FAILED_TOAST);
            return { ok: false, reason: 'portal_failed' };
          }
          return { ok: true };
        }

        window.location.href = url;
        return { ok: true };
      } catch {
        // Defensive: any unexpected throw is treated as a generic failure.
        closePlaceholder();
        toast(PORTAL_FAILED_TOAST);
        return { ok: false, reason: 'portal_failed' };
      } finally {
        setLoading(false);
      }
    })();

    inFlightPortal = work;
    try {
      return await work;
    } finally {
      inFlightPortal = null;
    }
  }, [newTab, promptStepUp]);

  return { open, loading };
}
