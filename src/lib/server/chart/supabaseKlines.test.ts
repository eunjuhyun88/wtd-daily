import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// `$env/dynamic/private` must be mocked BEFORE the SUT import so the
// transitionalFallbackEnabled() helper reads our controlled env shim.
// vi.mock is hoisted above local declarations — use vi.hoisted so the
// shared `dynamicEnv` object is initialized before the factory runs.
const { dynamicEnv } = vi.hoisted(() => ({
  dynamicEnv: {} as Record<string, string | undefined>,
}));
vi.mock('$env/dynamic/private', () => ({ env: dynamicEnv }));

import { __test, fetchKlinesFromSupabase } from './supabaseKlines';

// ── Supabase client mock ─────────────────────────────────────────────────────
// Each test sets `mockResponse` per (table, symbol) pair before invoking
// `fetchKlinesFromSupabase`. Captures the chained call shape so we can assert
// that the reader used the right table, filters, sort, and limit.

type QueryCall = {
  table: string;
  selectCols?: string;
  eq?: Record<string, unknown>;
  gte?: { col: string; val: string };
  lt?:  { col: string; val: string };
  order?: { col: string; ascending: boolean };
  limit?: number;
};

let queryCalls: QueryCall[];
let mockResponses: Map<string, { data: unknown[] | null; error: unknown | null }>;

function makeBuilder(table: string) {
  const call: QueryCall = { table };
  const builder = {
    select(cols: string) { call.selectCols = cols; return builder; },
    eq(col: string, val: unknown) {
      call.eq = { ...(call.eq ?? {}), [col]: val };
      return builder;
    },
    gte(col: string, val: string) { call.gte = { col, val }; return builder; },
    lt(col: string, val: string)  { call.lt  = { col, val }; return builder; },
    order(col: string, opts: { ascending: boolean }) {
      call.order = { col, ascending: opts.ascending };
      return builder;
    },
    limit(n: number) {
      call.limit = n;
      queryCalls.push(call);
      const key = `${table}:${String(call.eq?.symbol ?? '')}`;
      const resp = mockResponses.get(key) ?? { data: [], error: null };
      return Promise.resolve(resp);
    },
  };
  return builder;
}

vi.mock('$lib/server/supabaseAdmin', () => ({
  getSupabaseAnon: () => ({
    from(table: string) { return makeBuilder(table); },
  }),
}));

beforeEach(() => {
  queryCalls = [];
  mockResponses = new Map();
  for (const k of Object.keys(dynamicEnv)) delete dynamicEnv[k];
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ── Tests ────────────────────────────────────────────────────────────────────

describe('fetchKlinesFromSupabase — table routing', () => {
  it.each([
    ['1m',  'kline_1m'],
    ['5m',  'kline_5m'],
    ['15m', 'kline_15m'],
    ['1h',  'kline_1h'],
    ['1d',  'kline_1d'],
  ])('routes tf %s to %s', async (tf, expectedTable) => {
    mockResponses.set(`${expectedTable}:BTCUSDT`, {
      data: [{ ts: '2026-05-01T00:00:00Z', open: 1, high: 2, low: 0.5, close: 1.5, volume_base: 100 }],
      error: null,
    });
    const bars = await fetchKlinesFromSupabase({ symbol: 'BTCUSDT', tf, limit: 500 });
    expect(bars).toHaveLength(1);
    expect(queryCalls[0].table).toBe(expectedTable);
    expect(queryCalls[0].eq?.symbol).toBe('BTCUSDT');
  });

  it('returns null for unsupported timeframes (caller falls back to Binance)', async () => {
    for (const tf of ['3m', '30m', '2h', '4h', '6h', '12h', '1w']) {
      const bars = await fetchKlinesFromSupabase({ symbol: 'BTCUSDT', tf, limit: 500 });
      expect(bars, `tf=${tf}`).toBeNull();
    }
    expect(queryCalls).toHaveLength(0);
  });

  it('uppercases symbol and lowercases tf before routing', async () => {
    mockResponses.set('kline_1h:ETHUSDT', { data: [], error: null });
    await fetchKlinesFromSupabase({ symbol: 'ethusdt', tf: '1H', limit: 10 });
    expect(queryCalls[0].table).toBe('kline_1h');
    expect(queryCalls[0].eq?.symbol).toBe('ETHUSDT');
  });
});

describe('fetchKlinesFromSupabase — ordering & limit', () => {
  it('pulls most-recent N bars DESC then reverses to ASC when no cursor given', async () => {
    mockResponses.set('kline_1h:BTCUSDT', {
      data: [
        { ts: '2026-05-01T02:00:00Z', open: 3, high: 4, low: 2, close: 3.5, volume_base: 30 },
        { ts: '2026-05-01T01:00:00Z', open: 2, high: 3, low: 1, close: 2.5, volume_base: 20 },
        { ts: '2026-05-01T00:00:00Z', open: 1, high: 2, low: 0.5, close: 1.5, volume_base: 10 },
      ],
      error: null,
    });
    const bars = await fetchKlinesFromSupabase({ symbol: 'BTCUSDT', tf: '1h', limit: 500 });
    expect(queryCalls[0].order).toEqual({ col: 'ts', ascending: false });
    expect(queryCalls[0].limit).toBe(500);
    expect(bars).not.toBeNull();
    // Output is ASC even though the DB returned DESC.
    expect(bars!.map((b) => b.time)).toEqual([
      Math.floor(Date.UTC(2026, 4, 1, 0,  0, 0) / 1000),
      Math.floor(Date.UTC(2026, 4, 1, 1,  0, 0) / 1000),
      Math.floor(Date.UTC(2026, 4, 1, 2,  0, 0) / 1000),
    ]);
  });

  it('caps limit at 1000 and floors at 1', async () => {
    mockResponses.set('kline_1h:BTCUSDT', { data: [], error: null });
    await fetchKlinesFromSupabase({ symbol: 'BTCUSDT', tf: '1h', limit: 9999 });
    expect(queryCalls[0].limit).toBe(1000);

    queryCalls = [];
    await fetchKlinesFromSupabase({ symbol: 'BTCUSDT', tf: '1h', limit: 0 });
    expect(queryCalls[0].limit).toBe(1);
  });

  it('applies [startTime, startTime + limit * tfMs) window in ASC order for cursor fetches', async () => {
    mockResponses.set('kline_1h:BTCUSDT', { data: [], error: null });
    const startTime = Date.UTC(2026, 4, 1, 0, 0, 0); // 2026-05-01 00:00 UTC
    await fetchKlinesFromSupabase({ symbol: 'BTCUSDT', tf: '1h', limit: 10, startTime });

    const call = queryCalls[0];
    expect(call.gte).toEqual({ col: 'ts', val: new Date(startTime).toISOString() });
    expect(call.lt).toEqual({
      col: 'ts',
      val: new Date(startTime + 10 * 3_600_000).toISOString(),
    });
    expect(call.order).toEqual({ col: 'ts', ascending: true });
    expect(call.limit).toBe(10);
  });

  it('uses 1m bucket size when computing the cursor window for 1m fetches', async () => {
    mockResponses.set('kline_1m:BTCUSDT', { data: [], error: null });
    const startTime = Date.UTC(2026, 4, 1, 0, 0, 0);
    await fetchKlinesFromSupabase({ symbol: 'BTCUSDT', tf: '1m', limit: 500, startTime });
    expect(queryCalls[0].lt).toEqual({
      col: 'ts',
      val: new Date(startTime + 500 * 60_000).toISOString(),
    });
  });
});

describe('fetchKlinesFromSupabase — transitional fallback', () => {
  it('falls back to raw_binance_usdt_kline_1h when kline_1h matview is empty', async () => {
    mockResponses.set('kline_1h:BTCUSDT', { data: [], error: null });
    mockResponses.set('raw_binance_usdt_kline_1h:BTCUSDT', {
      data: [{ ts: '2026-05-01T00:00:00Z', open: 1, high: 2, low: 0.5, close: 1.5, volume_base: 10 }],
      error: null,
    });
    const bars = await fetchKlinesFromSupabase({ symbol: 'BTCUSDT', tf: '1h', limit: 500 });
    expect(bars).toHaveLength(1);
    expect(queryCalls.map((c) => c.table)).toEqual(['kline_1h', 'raw_binance_usdt_kline_1h']);
  });

  it('falls back to raw_kline_1d when kline_1d matview is empty', async () => {
    mockResponses.set('kline_1d:BTCUSDT', { data: [], error: null });
    mockResponses.set('raw_kline_1d:BTCUSDT', {
      data: [{ ts: '2026-05-01T00:00:00Z', open: 1, high: 2, low: 0.5, close: 1.5, volume_base: 10 }],
      error: null,
    });
    const bars = await fetchKlinesFromSupabase({ symbol: 'BTCUSDT', tf: '1d', limit: 500 });
    expect(bars).toHaveLength(1);
    expect(queryCalls.map((c) => c.table)).toEqual(['kline_1d', 'raw_kline_1d']);
  });

  it('does NOT fall back to a transitional source for 1m / 5m / 15m', async () => {
    for (const tf of ['1m', '5m', '15m']) {
      queryCalls = [];
      mockResponses = new Map([[`kline_${tf}:BTCUSDT`, { data: [], error: null }]]);
      const bars = await fetchKlinesFromSupabase({ symbol: 'BTCUSDT', tf, limit: 100 });
      expect(bars).toEqual([]);
      expect(queryCalls).toHaveLength(1);
      expect(queryCalls[0].table).toBe(`kline_${tf}`);
    }
  });

  it('returns the matview rows when available (no transitional read)', async () => {
    mockResponses.set('kline_1h:BTCUSDT', {
      data: [{ ts: '2026-05-01T00:00:00Z', open: 1, high: 2, low: 0.5, close: 1.5, volume_base: 10 }],
      error: null,
    });
    await fetchKlinesFromSupabase({ symbol: 'BTCUSDT', tf: '1h', limit: 500 });
    expect(queryCalls).toHaveLength(1);
    expect(queryCalls[0].table).toBe('kline_1h');
  });
});

describe('rowToBar — column mapping', () => {
  it('coerces volume_base → volume and ts → unix seconds', () => {
    const bar = __test.rowToBar({
      ts: '2026-05-01T00:00:00Z',
      open: 1, high: 2, low: 0.5, close: 1.5,
      volume_base: 42,
    });
    expect(bar).toEqual({
      time:  Date.UTC(2026, 4, 1, 0, 0, 0) / 1000,
      open: 1, high: 2, low: 0.5, close: 1.5,
      volume: 42,
    });
  });

  it('defaults volume to 0 when volume_base is null/undefined', () => {
    const bar = __test.rowToBar({
      ts: '2026-05-01T00:00:00Z',
      open: 1, high: 2, low: 0.5, close: 1.5,
      volume_base: null,
    });
    expect(bar.volume).toBe(0);
  });
});

describe('fetchKlinesFromSupabase — error handling', () => {
  it('returns [] (not throwing) when Supabase responds with an error', async () => {
    mockResponses.set('kline_1h:BTCUSDT', { data: null, error: { code: '42P01', message: 'oops' } });
    const bars = await fetchKlinesFromSupabase({ symbol: 'BTCUSDT', tf: '1h', limit: 500 });
    // Transitional fallback also empty → still []
    expect(bars).toEqual([]);
  });
});

describe('TF_TABLE_PRIMARY mapping (test-only export)', () => {
  it('lists every supported tf', () => {
    expect(Object.keys(__test.TF_TABLE_PRIMARY).sort()).toEqual(
      ['15m', '1d', '1h', '1m', '5m'],
    );
  });
});

describe('CHART_SUPABASE_TRANSITIONAL_FALLBACK gate', () => {
  it('defaults to enabled (transitional fallback runs)', () => {
    expect(__test.transitionalFallbackEnabled()).toBe(true);
  });

  it.each(['false', 'FALSE', '0', 'off', 'no'])(
    'disables when env value is %s',
    (value) => {
      dynamicEnv.CHART_SUPABASE_TRANSITIONAL_FALLBACK = value;
      expect(__test.transitionalFallbackEnabled()).toBe(false);
    },
  );

  it.each(['true', '1', 'on', 'yes', ''])(
    'enables when env value is %s',
    (value) => {
      dynamicEnv.CHART_SUPABASE_TRANSITIONAL_FALLBACK = value;
      expect(__test.transitionalFallbackEnabled()).toBe(true);
    },
  );

  it('skips raw_binance_usdt_kline_1h fallback when gate is off (matview empty)', async () => {
    dynamicEnv.CHART_SUPABASE_TRANSITIONAL_FALLBACK = 'false';
    mockResponses.set('kline_1h:BTCUSDT', { data: [], error: null });
    mockResponses.set('raw_binance_usdt_kline_1h:BTCUSDT', {
      data: [{ ts: '2026-05-01T00:00:00Z', open: 1, high: 2, low: 0.5, close: 1.5, volume_base: 10 }],
      error: null,
    });
    const bars = await fetchKlinesFromSupabase({ symbol: 'BTCUSDT', tf: '1h', limit: 500 });
    expect(bars).toEqual([]);
    expect(queryCalls.map((c) => c.table)).toEqual(['kline_1h']);
  });

  it('skips raw_kline_1d fallback when gate is off (matview empty)', async () => {
    dynamicEnv.CHART_SUPABASE_TRANSITIONAL_FALLBACK = 'false';
    mockResponses.set('kline_1d:BTCUSDT', { data: [], error: null });
    mockResponses.set('raw_kline_1d:BTCUSDT', {
      data: [{ ts: '2026-05-01T00:00:00Z', open: 1, high: 2, low: 0.5, close: 1.5, volume_base: 10 }],
      error: null,
    });
    const bars = await fetchKlinesFromSupabase({ symbol: 'BTCUSDT', tf: '1d', limit: 500 });
    expect(bars).toEqual([]);
    expect(queryCalls.map((c) => c.table)).toEqual(['kline_1d']);
  });
});
