/**
 * Backend selector unit test for `getChartSeries` — verifies the W-0543
 * Phase B.1 Supabase-first read path falls through to Binance FAPI when the
 * timeframe has no Supabase backing or the matview is still empty.
 *
 * The full indicator-compute path is covered by Binance-only legacy tests.
 * Here we only assert which network call lands on which provider.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mocks must be hoisted: vitest evaluates `vi.mock(...)` before any imports.
const supabaseFetch = vi.fn();
const liquidationsFetch = vi.fn();
const engineFetchMock = vi.fn();
const sharedCacheGet = vi.fn();

vi.mock('./supabaseKlines', () => ({
  fetchKlinesFromSupabase: (...args: unknown[]) => supabaseFetch(...args),
}));
vi.mock('$lib/server/providers/coinalyze', () => ({
  fetchLiquidationHistoryServer: (...args: unknown[]) => liquidationsFetch(...args),
}));
vi.mock('$lib/server/engineTransport', () => ({
  engineFetch: (...args: unknown[]) => engineFetchMock(...args),
}));
vi.mock('$lib/server/sharedCache', () => ({
  getSharedCache: (...args: unknown[]) => sharedCacheGet(...args),
  setSharedCache: vi.fn(),
}));

import { getChartSeries } from './chartSeriesService';

function binanceKlineRow(tsSec: number) {
  const tsMs = tsSec * 1000;
  return [tsMs, '1', '2', '0.5', '1.5', '100', tsMs + 60_000, '150', 3, '60', '90', '0'];
}

function fapiResponse(bars: ReturnType<typeof binanceKlineRow>[]) {
  return { ok: true, status: 200, json: async () => bars } as unknown as Response;
}

// The chart service has a module-level in-memory cache keyed by
// `symbol:tf:limit:emaTf:startTime`. Per-test we mint a unique symbol so the
// cache never bleeds across cases.
let symbolCounter = 0;
const nextSymbol = () => `T${(++symbolCounter).toString().padStart(3, '0')}USDT`;

beforeEach(() => {
  supabaseFetch.mockReset();
  liquidationsFetch.mockReset().mockResolvedValue([]);
  engineFetchMock.mockReset().mockResolvedValue({ ok: false, status: 404 } as Response);
  sharedCacheGet.mockReset().mockResolvedValue(null);
  delete process.env.CHART_KLINES_BACKEND;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('getChartSeries — Supabase-first backend (W-0543 B.1)', () => {
  it('default backend (hybrid): uses Supabase rows when present and skips Binance kline fetch', async () => {
    const symbol = nextSymbol();
    const supabaseBars = [
      { time: 1_700_000_000, open: 1, high: 2, low: 0.5, close: 1.5, volume: 100 },
    ];
    supabaseFetch.mockResolvedValue(supabaseBars);

    const fetchImpl = vi.fn(async (url: string) => {
      // Binance FAPI klines must NOT be called when Supabase returned data.
      if (url.includes('/fapi/v1/klines')) {
        throw new Error('fapi klines should not be called: ' + url);
      }
      // Funding rate / OI fall through to live Binance — return empty.
      return fapiResponse([]);
    });

    const { payload } = await getChartSeries({
      symbol, tf: '1h', limit: 50, fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    expect(supabaseFetch).toHaveBeenCalledTimes(1);
    expect(payload.klines).toEqual(supabaseBars);
    expect(payload.symbol).toBe(symbol);
  });

  it('default backend (hybrid): falls back to Binance FAPI when Supabase returns null (unsupported tf)', async () => {
    const symbol = nextSymbol();
    supabaseFetch.mockResolvedValue(null); // unsupported tf
    const binanceBars = [binanceKlineRow(1_700_000_000)];
    const fetchImpl = vi.fn(async (url: string) => {
      if (url.includes('/fapi/v1/klines')) return fapiResponse(binanceBars);
      return fapiResponse([]);
    });

    const { payload } = await getChartSeries({
      symbol, tf: '4h', limit: 50, fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    expect(supabaseFetch).toHaveBeenCalledTimes(1);
    expect(fetchImpl).toHaveBeenCalledWith(expect.stringContaining('/fapi/v1/klines'), expect.any(Object));
    expect(payload.klines).toHaveLength(1);
  });

  it('default backend (hybrid): falls back to Binance FAPI when Supabase returns []', async () => {
    const symbol = nextSymbol();
    supabaseFetch.mockResolvedValue([]); // supported tf but empty matview
    const binanceBars = [binanceKlineRow(1_700_000_000)];
    const fetchImpl = vi.fn(async (url: string) => {
      if (url.includes('/fapi/v1/klines')) return fapiResponse(binanceBars);
      return fapiResponse([]);
    });
    const { payload } = await getChartSeries({
      symbol, tf: '1h', limit: 50, fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    expect(fetchImpl).toHaveBeenCalledWith(expect.stringContaining('/fapi/v1/klines'), expect.any(Object));
    expect(payload.klines).toHaveLength(1);
  });

  it('backend=binance: bypasses Supabase entirely', async () => {
    const symbol = nextSymbol();
    process.env.CHART_KLINES_BACKEND = 'binance';
    supabaseFetch.mockResolvedValue([{ time: 1, open: 1, high: 1, low: 1, close: 1, volume: 1 }]);

    const binanceBars = [binanceKlineRow(1_700_000_000)];
    const fetchImpl = vi.fn(async (url: string) => {
      if (url.includes('/fapi/v1/klines')) return fapiResponse(binanceBars);
      return fapiResponse([]);
    });

    await getChartSeries({
      symbol, tf: '1h', limit: 50, fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    expect(supabaseFetch).not.toHaveBeenCalled();
    expect(fetchImpl).toHaveBeenCalledWith(expect.stringContaining('/fapi/v1/klines'), expect.any(Object));
  });

  it('backend=supabase: returns Supabase bars even when empty, does NOT fall back to Binance', async () => {
    const symbol = nextSymbol();
    process.env.CHART_KLINES_BACKEND = 'supabase';
    supabaseFetch.mockResolvedValue([]); // strict mode keeps the empty array

    const fetchImpl = vi.fn(async (url: string) => {
      if (url.includes('/fapi/v1/klines')) {
        throw new Error('strict supabase mode should not hit Binance');
      }
      return fapiResponse([]);
    });

    const { payload } = await getChartSeries({
      symbol, tf: '1h', limit: 50, fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    expect(payload.klines).toEqual([]);
  });

  it('hybrid: Supabase throw is logged and Binance fallback runs', async () => {
    const symbol = nextSymbol();
    supabaseFetch.mockRejectedValue(new Error('supabase down'));
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const binanceBars = [binanceKlineRow(1_700_000_000)];
    const fetchImpl = vi.fn(async (url: string) => {
      if (url.includes('/fapi/v1/klines')) return fapiResponse(binanceBars);
      return fapiResponse([]);
    });

    const { payload } = await getChartSeries({
      symbol, tf: '1h', limit: 50, fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    expect(payload.klines).toHaveLength(1);
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});
