import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchPatternStatsFromVerdicts } from './supabasePatternStats';

type QueryCall = {
  table: string;
  selectCols?: string;
  order?: { col: string; ascending: boolean };
  limit?: number;
};

let queryCalls: QueryCall[];
let mockResponse: { data: unknown; error: unknown };

function makeBuilder(table: string) {
  const call: QueryCall = { table };
  const builder = {
    select(cols: string) {
      call.selectCols = cols;
      return builder;
    },
    order(col: string, opts: { ascending: boolean }) {
      call.order = { col, ascending: opts.ascending };
      return builder;
    },
    limit(n: number) {
      call.limit = n;
      return {
        then: (resolve: (value: unknown) => void) => {
          queryCalls.push(call);
          resolve(mockResponse);
        },
      };
    },
  };
  return builder;
}

vi.mock('$lib/server/supabaseAdmin', () => ({
  getSupabaseAdmin: () => ({
    from(table: string) {
      return makeBuilder(table);
    },
  }),
}));

beforeEach(() => {
  queryCalls = [];
  mockResponse = { data: [], error: null };
});

describe('fetchPatternStatsFromVerdicts', () => {
  it('maps pattern verdict aggregate rows into PatternStats', async () => {
    mockResponse = {
      data: [
        {
          pattern_slug: 'volatility-squeeze-breakout-v1',
          n_total_all: 42,
          n_closed_all: 30,
          n_wins_all: 18,
          win_rate_all: 0.6,
          avg_pnl_pct_all: 0.024,
          n_total_90d: 12,
          win_rate_90d: 0.58,
          updated_at: '2026-05-11T00:00:00Z',
        },
      ],
      error: null,
    };

    const stats = await fetchPatternStatsFromVerdicts(10);

    expect(queryCalls[0]).toMatchObject({
      table: 'pattern_verdicts',
      order: { col: 'updated_at', ascending: false },
      limit: 10,
    });
    expect(stats).toEqual([
      expect.objectContaining({
        pattern_slug: 'volatility-squeeze-breakout-v1',
        total_instances: 42,
        success_count: 18,
        failure_count: 12,
        pending_count: 12,
        hit_rate: 0.6,
        expected_value: 0.024,
        recent_30d_count: 12,
        recent_30d_success_rate: 0.58,
      }),
    ]);
  });

  it('returns an empty list on Supabase errors', async () => {
    mockResponse = { data: null, error: { message: 'unavailable' } };

    await expect(fetchPatternStatsFromVerdicts()).resolves.toEqual([]);
  });
});
