import { supabase } from '@/integrations/supabase/client';

/**
 * invokeWithStepUp — wraps supabase.functions.invoke and, when the edge
 * function rejects with HTTP 403 + body `{ code: "step_up_required" }`,
 * asks the caller's `promptStepUp` callback to complete an MFA step-up,
 * then retries the original call exactly once.
 *
 * Contracts:
 *  - `promptStepUp()` MUST resolve `true` only AFTER any required
 *    `supabase.auth.setSession(...)` performed inside the verification
 *    path has completed. (TOTP path rotates the auth session via
 *    `setSession`; backup-code path does NOT replace the auth session —
 *    server-side freshness lives in `mfa_step_ups`.)
 *  - `getSession()` below is only used to verify a session still exists
 *    before retrying. It does NOT refresh or force any session state.
 *  - Exactly one retry. No recursion.
 *
 * Returns either the underlying invoke result (`{ data, error }`) or one
 * of the two typed sentinels: STEP_UP_CANCELLED, STEP_UP_PROMPT_FAILED.
 */

export const STEP_UP_CANCELLED = Object.freeze({
  code: 'step_up_cancelled' as const,
  message: 'Verification cancelled',
});
export type StepUpCancelled = typeof STEP_UP_CANCELLED;

export const STEP_UP_PROMPT_FAILED = Object.freeze({
  code: 'step_up_prompt_failed' as const,
  message: 'Could not complete verification. Please try again.',
});
export type StepUpPromptFailed = typeof STEP_UP_PROMPT_FAILED;

export function isStepUpCancelled(err: unknown): err is StepUpCancelled {
  return !!err && typeof err === 'object' && (err as any).code === 'step_up_cancelled';
}

export function isStepUpPromptFailed(err: unknown): err is StepUpPromptFailed {
  return !!err && typeof err === 'object' && (err as any).code === 'step_up_prompt_failed';
}

/**
 * Defensively read a `step_up_required` signal out of an unknown error.
 * Returns `null` when the error is not a 403 with the exact code, when the
 * response body cannot be parsed, when the body has already been consumed,
 * or when the parsed body is not a plain object with a `string` `code`.
 *
 * Never mutates the original error. Never caches anything on it.
 */
async function parseStepUpError(
  error: unknown,
): Promise<{ status: number; code: string } | null> {
  if (!error || typeof error !== 'object') return null;
  const ctx = (error as any).context;
  if (
    !ctx ||
    typeof ctx !== 'object' ||
    typeof (ctx as any).status !== 'number' ||
    typeof (ctx as any).clone !== 'function'
  ) {
    return null;
  }
  const status = (ctx as any).status as number;
  if (status !== 403) return null;

  let body: unknown;
  try {
    // `clone()` may itself throw if the underlying body is already consumed
    // in some runtimes; .json() rejects if the body is not valid JSON or has
    // already been read. Both cases → treat as un-parseable.
    const cloned = (ctx as any).clone();
    body = await cloned.json();
  } catch {
    return null;
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) return null;
  const code = (body as any).code;
  if (typeof code !== 'string') return null;
  return { status, code };
}

/**
 * Exact-match gate. Returns `true` ONLY when the underlying invoke result
 * is a 403 whose JSON body has `code === "step_up_required"`. A generic
 * 403 (or any other status) MUST NOT trigger an MFA prompt.
 */
export async function isStepUpRequired(result: {
  data: unknown;
  error: unknown;
}): Promise<boolean> {
  const parsed = await parseStepUpError(result.error);
  return parsed?.status === 403 && parsed.code === 'step_up_required';
}

export async function invokeWithStepUp<T = any>(
  functionName: string,
  options: Parameters<typeof supabase.functions.invoke>[1],
  promptStepUp: () => Promise<boolean>,
): Promise<{ data: T | null; error: any }> {
  const first = (await supabase.functions.invoke<T>(functionName, options)) as {
    data: T | null;
    error: any;
  };

  const needs = await isStepUpRequired(first);
  if (!needs) return first;

  // Ask caller to complete MFA. If the prompt itself throws, surface a
  // typed generic wrapper — never leak the thrown value, which may carry
  // internal details.
  let verified = false;
  try {
    verified = await promptStepUp();
  } catch {
    return { data: null, error: STEP_UP_PROMPT_FAILED };
  }

  if (!verified) return { data: null, error: STEP_UP_CANCELLED };

  // The prompt contract guarantees any required setSession() has already
  // resolved. This getSession() call is only used to verify a session
  // exists before issuing the retry — it does not refresh anything.
  let hasSession = false;
  try {
    const { data } = await supabase.auth.getSession();
    hasSession = !!data?.session;
  } catch {
    hasSession = false;
  }
  if (!hasSession) return { data: null, error: STEP_UP_PROMPT_FAILED };

  // Exactly one retry. If it still returns step_up_required, surface that
  // result as-is — do NOT prompt again, do NOT loop.
  return (await supabase.functions.invoke<T>(functionName, options)) as {
    data: T | null;
    error: any;
  };
}
