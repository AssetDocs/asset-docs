import {
  SCORED_QUESTIONS,
  GAP_TIE_BREAK,
  type BandKey,
  type CategoryKey,
} from '@/data/preparednessAssessment';

export type Answers = Partial<Record<CategoryKey, string>>;

export interface ScoreResult {
  fitScore: number;
  band: BandKey;
  topGaps: CategoryKey[];
}

export const bandFor = (score: number): BandKey => {
  if (score <= 24) return 'strong_foundation';
  if (score <= 49) return 'some_gaps';
  if (score <= 74) return 'significant_opportunity';
  return 'strong_asset_safe_fit';
};

/** UX-only mirror of the server calculation. Returns null if incomplete/invalid. */
export const scoreAssessment = (answers: Answers): ScoreResult | null => {
  const gaps: { key: CategoryKey; gap: number }[] = [];
  for (const q of SCORED_QUESTIONS) {
    const opt = q.options.find((o) => o.id === answers[q.key]);
    if (!opt) return null;
    gaps.push({ key: q.key, gap: (opt.points / 3) * q.weight });
  }
  const sum = gaps.reduce((t, g) => t + g.gap, 0);
  const fitScore = Math.round(sum * 100 + 1e-9);
  const topGaps = gaps
    .filter((g) => g.gap > 0)
    .sort(
      (a, b) =>
        b.gap - a.gap || GAP_TIE_BREAK.indexOf(a.key) - GAP_TIE_BREAK.indexOf(b.key),
    )
    .slice(0, 2)
    .map((g) => g.key);
  return { fitScore, band: bandFor(fitScore), topGaps };
};
