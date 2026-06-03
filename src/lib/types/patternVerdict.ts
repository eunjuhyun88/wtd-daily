import type { components } from '$lib/contracts/generated/engine-openapi';

export type WindowAgg = components['schemas']['WindowAggResponse'];
export type PatternVerdict = components['schemas']['api__routes__patterns_verdicts__VerdictResponse'];

export type ConfidenceTier = 'insufficient' | 'low' | 'moderate' | 'high';

export const EMPTY_VERDICT: PatternVerdict = {
  pattern_slug: '',
  confidence: 'insufficient',
};

export function tierOf(v: PatternVerdict | null | undefined): ConfidenceTier {
  const c = v?.confidence;
  if (c === 'high' || c === 'moderate' || c === 'low') return c;
  return 'insufficient';
}

export function isStale(v: PatternVerdict | null | undefined, nowMs: number = Date.now()): boolean {
  if (!v?.updated_at) return false;
  const t = Date.parse(v.updated_at);
  if (Number.isNaN(t)) return false;
  return nowMs - t > 24 * 60 * 60 * 1000;
}
