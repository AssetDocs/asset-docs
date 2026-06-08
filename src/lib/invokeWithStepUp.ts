import { supabase } from '@/integrations/supabase/client';

/**
 * invokeWithStepUp — wraps supabase.functions.invoke and, when the edge
 * function rejects with `code: 'step_up_required'` (HTTP 403), waits for the
 * caller to complete an MFA step-up and then retries once.
 *
 * The caller provides a `promptStepUp` callback (typically tied to a
 * <MfaStepUpDialog />) which resolves `true` once the user has completed
 * step-up. If they cancel, resolve `false` and we surface the original error.
 *
 * Example:
 *   const { open, prompt } = useStepUpPrompt(); // your own dialog wiring
 *   const { data, error } = await invokeWithStepUp(
 *     'cancel-subscription',
 *     { body: { action: 'cancel' } },
 *     prompt,
 *   );
 */
export async function invokeWithStepUp<T = any>(
  functionName: string,
  options: Parameters<typeof supabase.functions.invoke>[1],
  promptStepUp: () => Promise<boolean>,
): Promise<{ data: T | null; error: any }> {
  const first = await supabase.functions.invoke<T>(functionName, options);
  if (!isStepUpRequired(first)) return first as any;

  const verified = await promptStepUp();
  if (!verified) return first as any;

  // Small delay so the freshly-written step-up row is visible to the retry.
  await new Promise((r) => setTimeout(r, 150));
  return (await supabase.functions.invoke<T>(functionName, options)) as any;
}

export function isStepUpRequired(result: { data: any; error: any }): boolean {
  const status = result.error?.context?.response?.status;
  const dataCode = (result.data as any)?.code;
  const errCode = (result.error as any)?.code;
  const msg = ((result.error as any)?.message ?? '').toLowerCase();
  return (
    status === 403 ||
    dataCode === 'step_up_required' ||
    errCode === 'step_up_required' ||
    msg.includes('step-up required') ||
    msg.includes('step_up_required')
  );
}
