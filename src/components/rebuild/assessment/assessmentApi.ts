import { supabase } from '@/integrations/supabase/client';
import { ASSESSMENT_VERSION } from '@/data/preparednessAssessment';
import type { Answers } from '@/lib/preparednessScoring';

/**
 * Off until the preparedness-assessment Edge Function and table are approved
 * and deployed. While false, nothing is sent to the backend.
 */
export const ASSESSMENT_BACKEND_ENABLED = false;

const FN = 'preparedness-assessment';

const sessionId = (): string => {
  const k = 'as_assessment_session';
  try {
    let v = sessionStorage.getItem(k);
    if (!v) {
      v = crypto.randomUUID();
      sessionStorage.setItem(k, v);
    }
    return v;
  } catch {
    return crypto.randomUUID();
  }
};

const utm = (): Record<string, string> | undefined => {
  const p = new URLSearchParams(window.location.search);
  const out: Record<string, string> = {};
  for (const k of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']) {
    const v = p.get(k);
    if (v) out[k] = v.slice(0, 100);
  }
  return Object.keys(out).length ? out : undefined;
};

export const submitAssessment = async (input: { answers: Answers; willingness_to_pay: string }) => {
  const { data, error } = await supabase.functions.invoke(FN, {
    body: {
      action: 'submit',
      version: ASSESSMENT_VERSION,
      session_id: sessionId(),
      answers: input.answers,
      willingness_to_pay: input.willingness_to_pay,
      utm: utm(),
    },
  });
  if (error || !data?.ok) throw new Error('submit failed');
  return data as { ok: true; assessment_id: string; fit_score: number; band: string; top_gaps: string[] };
};

export const joinEarlyAccess = async (input: { assessment_id: string; email: string }) => {
  const { data, error } = await supabase.functions.invoke(FN, {
    body: { action: 'join', assessment_id: input.assessment_id, email: input.email, consent: true },
  });
  return !error && !!data?.ok;
};

export const saveResearch = async (input: {
  assessment_id: string;
  audience_segment: string | null;
  primary_interest: string | null;
}) => {
  await supabase.functions.invoke(FN, { body: { action: 'research', ...input } });
};
