/**
 * StepUpProvider — global MFA step-up prompt.
 *
 * Contract used by `invokeWithStepUp`:
 *  - `promptStepUp()` resolves `true` only AFTER the underlying verification
 *    flow has completed (including any required `supabase.auth.setSession()`
 *    for the TOTP path). The Asset Safe backup-code path does NOT replace
 *    the auth session — freshness lives server-side in the
 *    `mfa_step_up_sessions` table.
 *  - Resolves `false` when the user cancels / closes the dialog.
 *  - `handleOpenChange` must resolve the pending resolver exactly once.
 */
import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import MfaStepUpDialog from '@/components/MfaStepUpDialog';

type Resolver = (verified: boolean) => void;

interface StepUpContextValue {
  /**
   * Open the step-up dialog and resolve once the user verifies (true) or
   * cancels (false). Safe to call from anywhere inside <StepUpProvider />.
   */
  promptStepUp: (opts?: { title?: string; description?: string }) => Promise<boolean>;
}

const StepUpContext = createContext<StepUpContextValue | null>(null);

export const StepUpProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState<string | undefined>();
  const [description, setDescription] = useState<string | undefined>();
  const resolverRef = useRef<Resolver | null>(null);

  const promptStepUp = useCallback(
    (opts?: { title?: string; description?: string }) =>
      new Promise<boolean>((resolve) => {
        // If a previous prompt is somehow still open, reject it as a cancel.
        if (resolverRef.current) {
          try { resolverRef.current(false); } catch {}
        }
        resolverRef.current = resolve;
        setTitle(opts?.title);
        setDescription(opts?.description);
        setOpen(true);
      }),
    [],
  );

  const handleVerified = () => {
    const r = resolverRef.current;
    resolverRef.current = null;
    setOpen(false);
    r?.(true);
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      const r = resolverRef.current;
      resolverRef.current = null;
      // Closed without verifying → treat as cancel.
      r?.(false);
    }
  };

  return (
    <StepUpContext.Provider value={{ promptStepUp }}>
      {children}
      <MfaStepUpDialog
        open={open}
        onOpenChange={handleOpenChange}
        onVerified={handleVerified}
        title={title}
        description={description}
      />
    </StepUpContext.Provider>
  );
};

/**
 * Returns { promptStepUp } — call it to open the global step-up dialog and
 * await the user's response. Pair with `invokeWithStepUp` for auto-retry of
 * sensitive edge function calls that fail with `code: 'step_up_required'`.
 */
export function useStepUpPrompt(): StepUpContextValue {
  const ctx = useContext(StepUpContext);
  if (!ctx) throw new Error('useStepUpPrompt must be used inside <StepUpProvider />');
  return ctx;
}
