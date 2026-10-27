import React, { useMemo, useRef, useState } from 'react';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  SCORED_QUESTIONS,
  VALUE_LIST,
  WTP_OPTIONS,
  AUDIENCE_OPTIONS,
  INTEREST_OPTIONS,
  BAND_COPY,
  GAP_COPY,
  type CategoryKey,
} from '@/data/preparednessAssessment';
import { scoreAssessment, type Answers } from '@/lib/preparednessScoring';
import { ASSESSMENT_BACKEND_ENABLED, submitAssessment, joinEarlyAccess, saveResearch } from './assessmentApi';

const emailSchema = z.string().trim().min(1).max(254).email();
const TOTAL_STEPS = SCORED_QUESTIONS.length + 1;

interface OptionCardProps {
  label: string;
  selected: boolean;
  onSelect: () => void;
}

const OptionCard: React.FC<OptionCardProps> = ({ label, selected, onSelect }) => (
  <button
    type="button"
    onClick={onSelect}
    aria-pressed={selected}
    className={cn(
      'flex w-full min-h-[56px] items-center gap-3 rounded-lg border px-4 py-3 text-left text-base transition-colors',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2',
      selected
        ? 'border-brand-darkBlue bg-brand-darkBlue/5 text-brand-darkBlue'
        : 'border-gray-200 bg-white text-gray-800 hover:border-brand-blue/60',
    )}
  >
    <span
      className={cn(
        'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border',
        selected ? 'border-brand-darkBlue bg-brand-darkBlue text-white' : 'border-gray-300',
      )}
    >
      {selected && <Check className="h-3 w-3" />}
    </span>
    <span className="leading-snug">{label}</span>
  </button>
);

type Stage = 'questions' | 'result';

const PreparednessAssessment: React.FC = () => {
  const [step, setStep] = useState(0);
  const [stage, setStage] = useState<Stage>('questions');
  const [answers, setAnswers] = useState<Answers>({});
  const [wtp, setWtp] = useState<string | null>(null);
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [saveFailed, setSaveFailed] = useState(false);
  const [serverResult, setServerResult] = useState<
    { fitScore: number; band: keyof typeof BAND_COPY; topGaps: CategoryKey[] } | null
  >(null);
  const topRef = useRef<HTMLDivElement>(null);

  const localResult = useMemo(() => scoreAssessment(answers), [answers]);
  const result = serverResult ?? localResult;

  const scrollTop = () =>
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const choose = (key: CategoryKey, id: string) => {
    setAnswers((a) => ({ ...a, [key]: id }));
    window.setTimeout(() => {
      setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
    }, 180);
  };

  const save = async () => {
    if (!localResult || !wtp || submitting) return;
    setSubmitting(true);
    setNotice(null);
    try {
      if (!ASSESSMENT_BACKEND_ENABLED) throw new Error('disabled');
      const res = await submitAssessment({ answers, willingness_to_pay: wtp });
      if (!res?.assessment_id) throw new Error('no id');
      setAssessmentId(res.assessment_id);
      setServerResult({
        fitScore: res.fit_score,
        band: res.band as keyof typeof BAND_COPY,
        topGaps: res.top_gaps as CategoryKey[],
      });
      setSaveFailed(false);
    } catch {
      setSaveFailed(true);
    } finally {
      setSubmitting(false);
    }
  };

  const finish = async () => {
    await save();
    setStage('result');
    scrollTop();
  };

  const restart = () => {
    setAnswers({});
    setWtp(null);
    setAssessmentId(null);
    setServerResult(null);
    setSaveFailed(false);
    setStep(0);
    setStage('questions');
    scrollTop();
  };

  const progress = Math.round(((stage === 'result' ? TOTAL_STEPS : step) / TOTAL_STEPS) * 100);

  return (
    <div ref={topRef} className="scroll-mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-10">
      {stage === 'questions' && (
        <>
          <div className="mb-6 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="inline-flex min-h-[44px] items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-brand-darkBlue disabled:invisible"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <span className="text-sm text-gray-500">
              {step < SCORED_QUESTIONS.length
                ? `Question ${step + 1} of ${SCORED_QUESTIONS.length}`
                : 'One last question'}
            </span>
          </div>
          <div
            className="mb-8 h-1.5 w-full overflow-hidden rounded-full bg-gray-100"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className="h-full bg-brand-blue transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>

          {step < SCORED_QUESTIONS.length ? (
            (() => {
              const q = SCORED_QUESTIONS[step];
              return (
                <fieldset key={q.key}>
                  <legend className="text-xl font-semibold leading-snug text-brand-darkBlue sm:text-2xl">
                    {q.prompt}
                  </legend>
                  {q.support && <p className="mt-3 text-base italic text-gray-500">{q.support}</p>}
                  <div className="mt-6 grid gap-3">
                    {q.options.map((o) => (
                      <OptionCard
                        key={o.id}
                        label={o.label}
                        selected={answers[q.key] === o.id}
                        onSelect={() => choose(q.key, o.id)}
                      />
                    ))}
                  </div>
                </fieldset>
              );
            })()
          ) : (
            <fieldset>
              <p className="text-lg font-semibold text-brand-darkBlue sm:text-xl">
                Imagine one private place where you could organize your:
              </p>
              <ul className="mt-4 grid gap-x-6 gap-y-2 text-base text-gray-700 sm:grid-cols-2">
                {VALUE_LIST.map((v) => (
                  <li key={v} className="flex gap-2">
                    <Check className="mt-1 h-4 w-4 shrink-0 text-brand-blue" />
                    <span>{v}</span>
                  </li>
                ))}
              </ul>
              <legend className="sr-only">Monthly price</legend>
              <p className="mt-8 text-xl font-semibold text-brand-darkBlue sm:text-2xl">
                What monthly price would feel reasonable for something like this?
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {WTP_OPTIONS.map((o) => (
                  <OptionCard key={o.id} label={o.label} selected={wtp === o.id} onSelect={() => setWtp(o.id)} />
                ))}
              </div>
              <p className="mt-3 text-sm text-gray-500">This doesn't affect your result.</p>
              <Button
                type="button"
                onClick={finish}
                disabled={!wtp || !result || submitting}
                className="mt-8 h-12 w-full bg-brand-orange text-base font-semibold text-white hover:bg-brand-orange/90 sm:w-auto sm:px-8"
              >
                {submitting ? 'Calculating…' : 'See My Result'}
              </Button>
            </fieldset>
          )}
          {notice && <p className="mt-4 text-sm text-red-600">{notice}</p>}
        </>
      )}

      {stage === 'result' && result && (
        <ResultView
          fitScore={result.fitScore}
          band={result.band}
          topGaps={result.topGaps}
          assessmentId={assessmentId}
          saveFailed={saveFailed}
          retrying={submitting}
          onRetry={save}
          onRestart={restart}
        />
      )}
    </div>
  );
};

interface ResultViewProps {
  fitScore: number;
  band: keyof typeof BAND_COPY;
  topGaps: CategoryKey[];
  assessmentId: string | null;
  saveFailed: boolean;
  retrying: boolean;
  onRetry: () => void;
  onRestart: () => void;
}

const ResultView: React.FC<ResultViewProps> = ({
  fitScore, band, topGaps, assessmentId, saveFailed, retrying, onRetry, onRestart,
}) => {
  const copy = BAND_COPY[band];
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-blue">Your Asset Safe Fit Score</p>
      <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-center">
        <div className="text-6xl font-bold leading-none text-brand-darkBlue sm:text-7xl">
          {fitScore}
          <span className="text-3xl sm:text-4xl">%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 sm:max-w-xs">
          <div className="h-full bg-brand-orange" style={{ width: `${fitScore}%` }} />
        </div>
      </div>
      <p className="mt-3 text-sm text-gray-500">
        A higher score means your situation more closely matches the problems Asset Safe is designed to solve.
      </p>

      <h3 className="mt-8 text-2xl font-bold leading-snug text-brand-darkBlue">{copy.heading}</h3>
      {copy.body.map((p) => (
        <p key={p} className="mt-4 text-base leading-relaxed text-gray-700 sm:text-lg">{p}</p>
      ))}
      {copy.closing && <p className="mt-4 text-base font-semibold text-brand-blue sm:text-lg">{copy.closing}</p>}

      {topGaps.length > 0 && (
        <div className="mt-8">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-gray-500">Where you could start</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {topGaps.map((g) => (
              <div key={g} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="font-semibold text-brand-darkBlue">{GAP_COPY[g].title}</p>
                <p className="mt-1 text-sm leading-relaxed text-gray-600">{GAP_COPY[g].body}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {assessmentId ? (
        <EarlyAccess assessmentId={assessmentId} />
      ) : (
        <div role="alert" className="mt-10 rounded-xl border border-brand-orange/40 bg-brand-orange/5 p-5 sm:p-8">
          <p className="text-base text-gray-800">
            {saveFailed
              ? "We calculated your result, but couldn't save your assessment. Please try again before joining Early Access."
              : 'Saving your assessment…'}
          </p>
          {saveFailed && (
            <Button
              type="button"
              onClick={onRetry}
              disabled={retrying}
              className="mt-4 h-11 bg-brand-darkBlue text-white hover:bg-brand-darkBlue/90"
            >
              {retrying ? 'Trying again…' : 'Try Again'}
            </Button>
          )}
        </div>
      )}

      <button type="button" onClick={onRestart} className="mt-6 min-h-[44px] text-sm text-gray-500 underline hover:text-brand-darkBlue">
        Retake the assessment
      </button>
    </div>
  );
};

const EarlyAccess: React.FC<{ assessmentId: string }> = ({ assessmentId }) => {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done'>('idle');
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status !== 'idle') return;
    setError(null);
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) return setError('Please enter a valid email address.');
    if (!consent) return setError('Please confirm you would like to receive Early Access updates.');
    setStatus('submitting');
    try {
      const ok = await joinEarlyAccess({ assessment_id: assessmentId, email: parsed.data });
      if (!ok) throw new Error();
      setStatus('done');
    } catch {
      setError("We couldn't add you to Early Access. Please try again.");
      setStatus('idle');
    }
  };

  if (status === 'done') return <PostSignupResearch assessmentId={assessmentId} />;

  return (
    <form onSubmit={submit} noValidate className="mt-10 rounded-xl bg-brand-darkBlue/5 p-5 sm:p-8">
      <h3 className="text-xl font-bold text-brand-darkBlue sm:text-2xl">Join Asset Safe Early Access</h3>
      <p className="mt-2 text-base text-gray-600">
        Be among the first to use Asset Safe when it returns.
      </p>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <label htmlFor="ea-email" className="sr-only">Email address</label>
        <Input
          id="ea-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="Email address"
          maxLength={254}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-12 flex-1 bg-white text-base"
        />
        <Button
          type="submit"
          disabled={status === 'submitting'}
          className="h-12 whitespace-nowrap bg-brand-orange px-6 text-base font-semibold text-white hover:bg-brand-orange/90"
        >
          {status === 'submitting' ? 'Joining…' : 'Join Early Access'}
        </Button>
      </div>
      <label className="mt-4 flex items-start gap-3 text-sm text-gray-600">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 h-5 w-5 shrink-0 accent-brand-darkBlue"
        />
        <span>
          Yes, send me Asset Safe Early Access updates. Unsubscribe anytime. See our{' '}
          <Link to="/privacy-policy" className="underline hover:text-brand-blue">Privacy Policy</Link>.
        </span>
      </label>
      {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
    </form>
  );
};

const PostSignupResearch: React.FC<{ assessmentId: string }> = ({ assessmentId }) => {
  const [segment, setSegment] = useState<string | null>(null);
  const [interest, setInterest] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (saving || (!segment && !interest)) return;
    setSaving(true);
    try {
      await saveResearch({ assessment_id: assessmentId, audience_segment: segment, primary_interest: interest });
    } catch {
      /* optional — never blocks */
    }
    setSaving(false);
    setSaved(true);
  };

  return (
    <div className="mt-10 rounded-xl border border-brand-blue/25 bg-brand-blue/5 p-5 sm:p-8" role="status">
      <p className="text-lg font-semibold text-brand-darkBlue">You're on the Early Access list.</p>
      <p className="mt-1 text-base text-gray-600">We'll keep you informed as Asset Safe moves forward.</p>
      {saved ? (
        <p className="mt-6 text-base text-gray-700">Thank you — that helps us build the right thing.</p>
      ) : (
        <div className="mt-6">
          <p className="text-sm text-gray-500">Optional — two quick questions to help shape Asset Safe.</p>
          <p className="mt-4 font-semibold text-brand-darkBlue">Which best describes you?</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {AUDIENCE_OPTIONS.map((o) => (
              <OptionCard key={o.id} label={o.label} selected={segment === o.id} onSelect={() => setSegment(o.id)} />
            ))}
          </div>
          <p className="mt-6 font-semibold text-brand-darkBlue">What's the biggest reason Asset Safe interests you?</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {INTEREST_OPTIONS.map((o) => (
              <OptionCard key={o.id} label={o.label} selected={interest === o.id} onSelect={() => setInterest(o.id)} />
            ))}
          </div>
          <Button
            type="button"
            onClick={save}
            disabled={saving || (!segment && !interest)}
            className="mt-6 h-11 bg-brand-darkBlue text-white hover:bg-brand-darkBlue/90"
          >
            {saving ? 'Saving…' : 'Share'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default PreparednessAssessment;
