import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen, fireEvent } from '@testing-library/svelte';
import PatternVerdictCard from './PatternVerdictCard.svelte';
import type { PatternVerdict } from '$lib/types/patternVerdict';

afterEach(() => cleanup());

const HIGH_VERDICT: PatternVerdict = {
  pattern_slug: 'btc-bull-trap',
  confidence: 'high',
  updated_at: '2026-05-09T00:00:00Z',
  last_90d: {
    n_total: 80,
    n_closed: 60,
    n_wins: 39,
    win_rate: 0.65,
    ci95_lo: 0.52,
    ci95_hi: 0.76,
    avg_pnl_pct: 0.012,
    avg_pnl_ci95_lo: 0.005,
    avg_pnl_ci95_hi: 0.019,
  },
  all: {
    n_total: 240,
    n_closed: 200,
    n_wins: 120,
    win_rate: 0.6,
    ci95_lo: 0.53,
    ci95_hi: 0.67,
    avg_pnl_pct: 0.009,
    avg_pnl_ci95_lo: 0.003,
    avg_pnl_ci95_hi: 0.015,
  },
};

const INSUFFICIENT_VERDICT: PatternVerdict = {
  pattern_slug: 'btc-bull-trap',
  confidence: 'insufficient',
  updated_at: '2026-05-09T00:00:00Z',
  last_90d: { n_total: 5, n_closed: 3, n_wins: 1 },
  all: { n_total: 5, n_closed: 3, n_wins: 1 },
};

describe('PatternVerdictCard', () => {
  it('hides numbers and shows empty state when confidence is insufficient', () => {
    render(PatternVerdictCard, { slug: 'btc-bull-trap', verdict: INSUFFICIENT_VERDICT });
    expect(screen.getByText(/Not enough closed positions/)).toBeTruthy();
    expect(screen.queryByText(/Win rate/)).toBeNull();
  });

  it('renders 90d numbers by default and switches to all-time on toggle', async () => {
    render(PatternVerdictCard, { slug: 'btc-bull-trap', verdict: HIGH_VERDICT });
    expect(screen.getByText('65.0%')).toBeTruthy();

    const allBtn = screen.getByRole('tab', { name: 'all' });
    await fireEvent.click(allBtn);
    expect(screen.getByText('60.0%')).toBeTruthy();
  });

  it('renders stale pill when updated_at is older than 24h', () => {
    const stale: PatternVerdict = {
      ...HIGH_VERDICT,
      updated_at: '2026-05-06T00:00:00Z',
    };
    render(PatternVerdictCard, {
      slug: 'btc-bull-trap',
      verdict: stale,
      nowMs: Date.parse('2026-05-09T00:00:00Z'),
    });
    expect(screen.getByText('stale')).toBeTruthy();
  });

  it('handles null verdict by showing empty state', () => {
    render(PatternVerdictCard, { slug: 'btc-bull-trap', verdict: null });
    expect(screen.getByText(/Not enough closed positions/)).toBeTruthy();
  });
});
