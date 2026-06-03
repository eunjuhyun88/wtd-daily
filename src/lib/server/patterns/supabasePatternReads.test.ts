import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  __test,
  fetchPatternStatesNested,
  fetchPhaseTransitions,
  fetchPatternVerdict,
} from './supabasePatternReads';

// ── Supabase client mock ─────────────────────────────────────────────────────
// Captures chained calls (.from().select().eq().order().limit().maybeSingle())
// so each test can inspect the table, filters, and limit applied.

type QueryCall = {
  table: string;
  selectCols?: string;
  eq?: Record<string, unknown>;
  order?: { col: string; ascending: boolean };
  limit?: number;
  terminal: 'list' | 'maybeSingle';
};

let queryCalls: QueryCall[];
let mockResponses: Map<string, { data: unknown; error: unknown }>;

function makeBuilder(table: string) {
  const call: QueryCall = { table, terminal: 'list' };
  const builder = {
    select(cols: string) { call.selectCols = cols; return builder; },
    eq(col: string, val: unknown) {
      call.eq = { ...(call.eq ?? {}), [col]: val };
      return builder;
    },
    order(col: string, opts: { ascending: boolean }) {
      call.order = { col, ascending: opts.ascending };
      return builder;
    },
    limit(n: number) {
      call.limit = n;
      // .limit() is a thenable — list path resolves here.
      return {
        then: (resolve: (v: unknown) => void) => {
          call.terminal = 'list';
          queryCalls.push(call);
          const key = `${table}:list`;
          resolve(mockResponses.get(key) ?? { data: [], error: null });
        },
      };
    },
    maybeSingle() {
      call.terminal = 'maybeSingle';
      queryCalls.push(call);
      const key = `${table}:maybeSingle`;
      return Promise.resolve(mockResponses.get(key) ?? { data: null, error: null });
    },
    // When the chain ends without .limit() / .maybeSingle() (i.e. plain SELECT
    // with eq filters), the builder itself is awaited — make it thenable.
    then: (resolve: (v: unknown) => void) => {
      call.terminal = 'list';
      queryCalls.push(call);
      const key = `${table}:list`;
      resolve(mockResponses.get(key) ?? { data: [], error: null });
    },
  };
  return builder;
}

vi.mock('$lib/server/supabaseAdmin', () => ({
  getSupabaseAdmin: () => ({
    from(table: string) { return makeBuilder(table); },
  }),
}));

beforeEach(() => {
  queryCalls = [];
  mockResponses = new Map();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ── fetchPatternStatesNested ─────────────────────────────────────────────────

describe('fetchPatternStatesNested', () => {
  it('shapes flat rows into nested `{ patterns: { slug: { symbol: state } } }` map', async () => {
    mockResponses.set('pattern_states:list', {
      data: [
        {
          symbol: 'BTCUSDT', pattern_slug: 'btc-bull-trap', pattern_version: 1,
          timeframe: '1h', current_phase: 'ARCH_ZONE', current_phase_idx: 1,
          entered_at: '2026-05-01T00:00:00Z', bars_in_phase: 3,
          last_eval_at: '2026-05-01T01:00:00Z', last_transition_id: 'tx_1',
          active: true, invalidated: false, updated_at: '2026-05-01T01:00:00Z',
        },
        {
          symbol: 'ETHUSDT', pattern_slug: 'btc-bull-trap', pattern_version: 1,
          timeframe: '1h', current_phase: 'BREAKOUT', current_phase_idx: 4,
          entered_at: '2026-05-01T00:00:00Z', bars_in_phase: 1,
          last_eval_at: '2026-05-01T01:00:00Z', last_transition_id: 'tx_2',
          active: true, invalidated: false, updated_at: '2026-05-01T01:00:00Z',
        },
      ],
      error: null,
    });

    const nested = await fetchPatternStatesNested();
    expect(nested.patterns).toHaveProperty('btc-bull-trap');
    const slugMap = (nested.patterns as Record<string, Record<string, Record<string, unknown>>>)['btc-bull-trap'];
    expect(Object.keys(slugMap).sort()).toEqual(['BTCUSDT', 'ETHUSDT']);
    expect(slugMap['BTCUSDT'].phase_id).toBe('ARCH_ZONE');
    expect(slugMap['BTCUSDT'].phase_idx).toBe(1);
    expect(slugMap['ETHUSDT'].phase_id).toBe('BREAKOUT');
  });

  it('filters by active=true by default', async () => {
    mockResponses.set('pattern_states:list', { data: [], error: null });
    await fetchPatternStatesNested();
    expect(queryCalls[0].eq?.active).toBe(true);
  });

  it('skips active filter when activeOnly=false', async () => {
    mockResponses.set('pattern_states:list', { data: [], error: null });
    await fetchPatternStatesNested({ activeOnly: false });
    expect(queryCalls[0].eq?.active).toBeUndefined();
  });

  it('applies pattern_slug filter when slug is provided', async () => {
    mockResponses.set('pattern_states:list', { data: [], error: null });
    await fetchPatternStatesNested({ slug: 'btc-bull-trap' });
    expect(queryCalls[0].eq?.pattern_slug).toBe('btc-bull-trap');
  });

  it('returns empty patterns map on Supabase error', async () => {
    mockResponses.set('pattern_states:list', {
      data: null,
      error: { code: '42P01', message: 'oops' },
    });
    const nested = await fetchPatternStatesNested();
    expect(nested).toEqual({ patterns: {} });
  });
});

// ── fetchPhaseTransitions ────────────────────────────────────────────────────

describe('fetchPhaseTransitions', () => {
  it('orders by transitioned_at DESC and caps limit at 500', async () => {
    mockResponses.set('phase_transitions:list', { data: [], error: null });
    await fetchPhaseTransitions({ limit: 9999 });
    expect(queryCalls[0].order).toEqual({ col: 'transitioned_at', ascending: false });
    expect(queryCalls[0].limit).toBe(500);
  });

  it('defaults limit to 30 when not provided', async () => {
    mockResponses.set('phase_transitions:list', { data: [], error: null });
    await fetchPhaseTransitions();
    expect(queryCalls[0].limit).toBe(30);
  });

  it('applies slug filter when provided', async () => {
    mockResponses.set('phase_transitions:list', { data: [], error: null });
    await fetchPhaseTransitions({ slug: 'btc-bull-trap', limit: 15 });
    expect(queryCalls[0].eq?.pattern_slug).toBe('btc-bull-trap');
    expect(queryCalls[0].limit).toBe(15);
  });

  it('maps phase_transitions rows into Transition shape', async () => {
    mockResponses.set('phase_transitions:list', {
      data: [
        {
          transition_id: 'tx_42', symbol: 'BTCUSDT', pattern_slug: 'btc-bull-trap',
          pattern_version: 1, timeframe: '1h', from_phase: 'FAKE_DUMP',
          to_phase: 'ARCH_ZONE', from_phase_idx: 0, to_phase_idx: 1,
          transition_kind: 'forward', reason: 'block-A confirmed',
          transitioned_at: '2026-05-01T03:00:00Z', confidence: 0.78,
        },
      ],
      error: null,
    });
    const out = await fetchPhaseTransitions();
    expect(out).toEqual([
      {
        transition_id: 'tx_42', symbol: 'BTCUSDT', pattern_slug: 'btc-bull-trap',
        from_phase: 'FAKE_DUMP', to_phase: 'ARCH_ZONE',
        transition_kind: 'forward', reason: 'block-A confirmed',
        transitioned_at: '2026-05-01T03:00:00Z', confidence: 0.78,
      },
    ]);
  });

  it('returns [] on Supabase error', async () => {
    mockResponses.set('phase_transitions:list', { data: null, error: { code: 'X' } });
    expect(await fetchPhaseTransitions()).toEqual([]);
  });
});

// ── fetchPatternVerdict ──────────────────────────────────────────────────────

describe('fetchPatternVerdict', () => {
  it('returns null when slug is empty', async () => {
    expect(await fetchPatternVerdict('')).toBeNull();
    expect(queryCalls).toHaveLength(0);
  });

  it('maps pattern_verdicts row into all + last_90d WindowAgg pairs', async () => {
    mockResponses.set('pattern_verdicts:maybeSingle', {
      data: {
        pattern_slug: 'btc-bull-trap',
        n_total_all: 100, n_closed_all: 80, n_wins_all: 48,
        win_rate_all: 0.6, ci95_lo_all: 0.49, ci95_hi_all: 0.71,
        avg_pnl_pct_all: 1.2, avg_pnl_ci95_lo_all: 0.5, avg_pnl_ci95_hi_all: 1.9,
        n_total_90d: 30, n_closed_90d: 25, n_wins_90d: 18,
        win_rate_90d: 0.72, ci95_lo_90d: 0.55, ci95_hi_90d: 0.85,
        avg_pnl_pct_90d: 1.5, avg_pnl_ci95_lo_90d: 0.8, avg_pnl_ci95_hi_90d: 2.2,
        confidence: 'high',
        last_computed_position_id: '00000000-0000-0000-0000-000000000001',
        updated_at: '2026-05-01T00:00:00Z',
      },
      error: null,
    });
    const v = await fetchPatternVerdict('btc-bull-trap');
    expect(queryCalls[0].eq?.pattern_slug).toBe('btc-bull-trap');
    expect(v).not.toBeNull();
    expect(v!.pattern_slug).toBe('btc-bull-trap');
    expect(v!.confidence).toBe('high');
    expect(v!.all).toMatchObject({ n_total: 100, n_wins: 48, win_rate: 0.6 });
    expect(v!.last_90d).toMatchObject({ n_total: 30, n_wins: 18, win_rate: 0.72 });
    expect(v!.updated_at).toBe('2026-05-01T00:00:00Z');
  });

  it('defaults confidence to "insufficient" when row carries null', async () => {
    mockResponses.set('pattern_verdicts:maybeSingle', {
      data: {
        pattern_slug: 'rare-pattern',
        n_total_all: 0, n_closed_all: 0, n_wins_all: 0,
        win_rate_all: null, ci95_lo_all: null, ci95_hi_all: null,
        avg_pnl_pct_all: null, avg_pnl_ci95_lo_all: null, avg_pnl_ci95_hi_all: null,
        n_total_90d: 0, n_closed_90d: 0, n_wins_90d: 0,
        win_rate_90d: null, ci95_lo_90d: null, ci95_hi_90d: null,
        avg_pnl_pct_90d: null, avg_pnl_ci95_lo_90d: null, avg_pnl_ci95_hi_90d: null,
        confidence: null,
        last_computed_position_id: null, updated_at: null,
      },
      error: null,
    });
    const v = await fetchPatternVerdict('rare-pattern');
    expect(v!.confidence).toBe('insufficient');
    expect(v!.all?.n_total).toBe(0);
    expect(v!.all?.win_rate).toBeNull();
  });

  it('returns null on Supabase error', async () => {
    mockResponses.set('pattern_verdicts:maybeSingle', {
      data: null,
      error: { code: 'PGRST116' },
    });
    expect(await fetchPatternVerdict('missing-slug')).toBeNull();
  });

  it('returns null when maybeSingle yields no data', async () => {
    mockResponses.set('pattern_verdicts:maybeSingle', { data: null, error: null });
    expect(await fetchPatternVerdict('missing-slug')).toBeNull();
  });
});

// ── Mappers (direct pure-function tests) ────────────────────────────────────

describe('mappers (pure)', () => {
  it('rowsToNestedStates groups by pattern_slug then symbol', () => {
    const nested = __test.rowsToNestedStates([
      {
        symbol: 'BTCUSDT', pattern_slug: 'p1', pattern_version: 2, timeframe: '1h',
        current_phase: 'A', current_phase_idx: 1, entered_at: null, bars_in_phase: 2,
        last_eval_at: null, last_transition_id: null, active: true,
        invalidated: false, updated_at: null,
      },
    ]);
    const patterns = nested.patterns as Record<string, Record<string, Record<string, unknown>>>;
    expect(patterns.p1.BTCUSDT.pattern_version).toBe(2);
    expect(patterns.p1.BTCUSDT.bars_in_phase).toBe(2);
  });

  it('rowToTransition coerces null confidence to 0', () => {
    const t = __test.rowToTransition({
      transition_id: 't', symbol: 'BTCUSDT', pattern_slug: 'p',
      pattern_version: 1, timeframe: '1h', from_phase: null, to_phase: 'A',
      from_phase_idx: null, to_phase_idx: 0,
      transition_kind: null, reason: null,
      transitioned_at: null, confidence: null,
    });
    expect(t.confidence).toBe(0);
    expect(t.transition_kind).toBe('');
    expect(t.reason).toBe('');
  });
});
