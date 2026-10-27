// @ts-nocheck — run with `bun test`; bun:test types are not in the app tsconfig.
import { describe, expect, test } from 'bun:test';
import { scoreAssessment, bandFor } from './preparednessScoring';

const all = (id: string) => ({
  property_inventory: id,
  property_value_awareness: id,
  information_organization: id,
  digital_access: id,
  legacy_preparedness: id,
});

describe('Asset Safe Fit Score', () => {
  test('all A answers score 0%', () => {
    expect(scoreAssessment(all('a'))!.fitScore).toBe(0);
  });
  test('all D answers score 100%', () => {
    expect(scoreAssessment(all('d'))!.fitScore).toBe(100);
  });
  test('legacy D only = 30%', () => {
    expect(scoreAssessment({ ...all('a'), legacy_preparedness: 'd' })!.fitScore).toBe(30);
  });
  test('band boundaries 24/25, 49/50, 74/75', () => {
    expect(bandFor(24)).toBe('strong_foundation');
    expect(bandFor(25)).toBe('some_gaps');
    expect(bandFor(49)).toBe('some_gaps');
    expect(bandFor(50)).toBe('significant_opportunity');
    expect(bandFor(74)).toBe('significant_opportunity');
    expect(bandFor(75)).toBe('strong_asset_safe_fit');
  });
  test('top gaps tie-break follows weight order', () => {
    expect(scoreAssessment(all('d'))!.topGaps).toEqual([
      'legacy_preparedness',
      'property_inventory',
    ]);
    const r = scoreAssessment({ ...all('a'), property_value_awareness: 'd', digital_access: 'd' })!;
    expect(r.topGaps).toEqual(['property_value_awareness', 'digital_access']);
  });
  test('invalid option id is rejected', () => {
    expect(scoreAssessment({ ...all('a'), digital_access: 'z' })).toBeNull();
  });
});
