/**
 * Chart series service — orchestrates Binance fetch + indicator compute + cache.
 *
 * Three layers, each independently testable:
 *   1. fetchBinanceSeries()   — raw Binance FAPI calls
 *   2. computeIndicators()    — pure math (indicatorUtils.ts)
 *   3. getChartSeries()       — cache + orchestration (this file)
 */
import { alignHtfSeriesToLtfTimes, isStrictlyHigherTf } from '$lib/chart/mtfAlign';
import {
  atr, bollingerBands, emaPoints, macd, rsi, sma, vwap,
  type MacdPoint, type TimePoint,
} from './indicatorUtils';
import { getSharedCache, setSharedCache } from '$lib/server/sharedCache';
import { fetchLiquidationHistoryServer } from '$lib/server/providers/coinalyze';
import { engineFetch } from '$lib/server/engineTransport';
import { fetchKlinesFromSupabase } from './supabaseKlines';

// ── Types ────────────────────────────────────────────────────────────────────

export interface KlineBar {
  time: number; open: number; high: number; low: number; close: number; volume: number;
}

export interface LiqBar {
  time: number;
  longUsd: number;   // positive — long liquidations (red on chart)
  shortUsd: number;  // positive — short liquidations (green on chart)
}

export interface ChartPayload {
  symbol: string;
  tf: string;
  klines: KlineBar[];
  oiBars:      Array<{ time: number; value: number; color: string }>;
  fundingBars: Array<{ time: number; value: number; color: string }>;
  liqBars:     LiqBar[];
  cvdBars?:    Array<{ time: number; value: number }>;
  indicators: {
    sma5:   TimePoint[];
    sma20:  TimePoint[];
    sma60:  TimePoint[];
    ema21:  TimePoint[];
    ema55:  TimePoint[];
    atr14:  TimePoint[];
    vwap:   TimePoint[];
    bbUpper: TimePoint[];
    bbLower: TimePoint[];
    rsi14:  TimePoint[];
    macd:   MacdPoint[];
    ema21_mtf?:  TimePoint[];
    ema55_mtf?:  TimePoint[];
    emaSourceTf?: string;
  };
}

export type ChartSeriesResult = { payload: ChartPayload; cacheStatus: 'hit' | 'miss' };

type FetchLike = typeof fetch;

const CHART_CACHE_TTL_MS = 15_000;
const FAPI = 'https://fapi.binance.com';
const SPOT_HOSTS = ['https://api1.binance.com', 'https://api2.binance.com', 'https://api3.binance.com'];
const OKX_BASE = 'https://www.okx.com';
const chartCache = new Map<string, { expiresAt: number; payload: ChartPayload }>();

// ── Layer 1: Fetch ────────────────────────────────────────────────────────────

function rollingBands(
  values: number[],
  times: number[],
  period: number,
  stdevMultiplier: number,
): { upper: Array<{ time: number; value: number }>; lower: Array<{ time: number; value: number }> } {
  const upper: Array<{ time: number; value: number }> = [];
  const lower: Array<{ time: number; value: number }> = [];
  let sum = 0;
  let sumSquares = 0;
  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    sum += value;
    sumSquares += value * value;
    if (i >= period) {
      const removed = values[i - period];
      sum -= removed;
      sumSquares -= removed * removed;
    }
    if (i >= period - 1) {
      const mean = sum / period;
      const variance = Math.max(0, sumSquares / period - mean * mean);
      const std = Math.sqrt(variance);
      upper.push({ time: times[i], value: mean + std * stdevMultiplier });
      lower.push({ time: times[i], value: mean - std * stdevMultiplier });
    }
  }
  return { upper, lower };
}

function rollingAverageSeries(values: number[], times: number[], period: number, startIndex: number): Array<{ time: number; value: number }> {
  const out: Array<{ time: number; value: number }> = [];
  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    sum += values[i];
    if (i >= period) sum -= values[i - period];
    if (i >= startIndex) out.push({ time: times[i], value: sum / period });
  }
  return out;
}

function emaPointsFromKlines(bars: KlineBar[], period: number): Array<{ time: number; value: number }> {
  const k = 2 / (period + 1);
  const out: Array<{ time: number; value: number }> = [];
  let prev: number | null = null;
  for (let i = 0; i < bars.length; i++) {
    const price = bars[i].close;
    if (!Number.isFinite(price)) continue;
    if (prev == null) {
      prev = price;
    } else {
      prev = price * k + prev * (1 - k);
    }
    out.push({ time: bars[i].time, value: prev });
  }
  return out;
}

function ema(values: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const out: number[] = [];
  let prev = values.slice(0, period).reduce((a, b) => a + b, 0) / period;
  for (let i = 0; i < values.length; i++) {
    if (i < period - 1) {
      out.push(Number.NaN);
      continue;
    }
    if (i === period - 1) {
      out.push(prev);
      continue;
    }
    prev = values[i] * k + prev * (1 - k);
    out.push(prev);
  }
  return out;
}

const INTERVAL_MAP: Record<string, string> = {
  '1m': '1m', '3m': '3m', '5m': '5m', '15m': '15m', '30m': '30m',
  '1h': '1h', '2h': '2h', '4h': '4h', '6h': '6h', '12h': '12h',
  '1d': '1d', '1w': '1w',
};

const OI_PERIOD_MAP: Record<string, string> = {
  '5m': '5m', '15m': '15m', '30m': '30m',
  '1h': '1h', '2h': '2h', '4h': '4h', '6h': '6h', '12h': '12h', '1d': '1d',
};

function parseKlines(rawKlines: number[][]): KlineBar[] {
  return rawKlines.map((k) => ({
    time: Math.floor(k[0] / 1000),
    open: parseFloat(k[1] as unknown as string),
    high: parseFloat(k[2] as unknown as string),
    low: parseFloat(k[3] as unknown as string),
    close: parseFloat(k[4] as unknown as string),
    volume: parseFloat(k[5] as unknown as string),
  }));
}

function toOkxSymbol(symbol: string): string {
  const base = symbol.replace(/USDT$/, '').replace(/BUSD$/, '');
  const quote = symbol.endsWith('BUSD') ? 'BUSD' : 'USDT';
  return `${base}-${quote}-SWAP`;
}

function toOkxBar(interval: string): string {
  const unit = interval.slice(-1);
  const num = interval.slice(0, -1);
  return unit === 'm' ? `${num}m` : `${num}${unit.toUpperCase()}`;
}

async function fetchKlinesFromOKX(
  symbol: string,
  interval: string,
  limit: number,
  fetchImpl: FetchLike,
): Promise<KlineBar[]> {
  const instId = toOkxSymbol(symbol);
  const bar = toOkxBar(interval);
  const url = `${OKX_BASE}/api/v5/market/candles?instId=${instId}&bar=${bar}&limit=${Math.min(limit, 300)}`;
  const res = await fetchImpl(url);
  if (!res.ok) throw new Error(`OKX candles ${res.status}`);
  const data = await res.json() as { data: string[][] };
  return data.data.reverse().map(row => ({
    time: Math.floor(Number(row[0]) / 1000),
    open: parseFloat(row[1]), high: parseFloat(row[2]),
    low: parseFloat(row[3]), close: parseFloat(row[4]), volume: parseFloat(row[5]),
  }));
}

/**
 * W-0543 Phase B.1: data-source selector for klines.
 *   `supabase` — Supabase-only (errors if tf unsupported)
 *   `binance`  — Binance FAPI only (legacy path, pre-W-0543)
 *   `hybrid`   — try Supabase first, fall back to Binance on miss / unsupported tf
 *
 * Default is `hybrid` so charts keep working for the timeframes whose
 * matviews don't exist yet (`3m`, `30m`, `2h`, `4h`, …) or while the 1m
 * backfill is still landing.
 */
type KlineBackend = 'supabase' | 'binance' | 'hybrid';

function resolveBackend(): KlineBackend {
  const raw = (process.env.CHART_KLINES_BACKEND ?? '').trim().toLowerCase();
  if (raw === 'supabase' || raw === 'binance' || raw === 'hybrid') return raw;
  return 'hybrid';
}

async function fetchKlinesFromBinance(
  symbol: string,
  interval: string,
  limit: number,
  startTime: number | undefined,
  fetchImpl: FetchLike,
): Promise<KlineBar[]> {
  const headers: Record<string, string> = {};
  const binanceKey = process.env.BINANCE_API_KEY;
  if (binanceKey) headers['X-MBX-APIKEY'] = binanceKey;

  function buildQuery(base: string, path: string): string {
    let url = `${base}${path}?symbol=${symbol}&interval=${interval}&limit=${limit}`;
    if (startTime) url += `&startTime=${startTime}&endTime=${startTime + limit * intervalMs(interval)}`;
    return url;
  }

  let lastStatus = 0;
  try {
    const res = await fetchImpl(buildQuery(FAPI, '/fapi/v1/klines'), { headers });
    if (res.ok) return parseKlines(await res.json() as number[][]);
    lastStatus = res.status;
  } catch { /* network error — try spot */ }

  if (lastStatus !== 0 && lastStatus !== 418 && lastStatus !== 429) {
    throw new Error(`Binance FAPI klines ${lastStatus}`);
  }

  console.warn(`[chart] Binance FAPI ${lastStatus || 'error'} — trying spot hosts`);
  for (const host of SPOT_HOSTS) {
    try {
      const res = await fetchImpl(buildQuery(host, '/api/v3/klines'), { headers });
      if (res.ok) return parseKlines(await res.json() as number[][]);
      if (res.status !== 418 && res.status !== 429) break;
    } catch { /* try next spot host */ }
  }

  console.warn('[chart] Binance spot all failed — falling back to OKX');
  return fetchKlinesFromOKX(symbol, interval, limit, fetchImpl);
}

async function fetchKlines(
  symbol: string,
  interval: string,
  limit: number,
  startTime: number | undefined,
  fetchImpl: FetchLike,
): Promise<KlineBar[]> {
  const backend = resolveBackend();

  if (backend !== 'binance') {
    try {
      const sb = await fetchKlinesFromSupabase({ symbol, tf: interval, limit, startTime });
      if (sb && sb.length > 0) return sb;
      // sb === null → unsupported tf; sb === [] → supported but empty.
      if (backend === 'supabase') {
        // Strict mode: surface the empty result instead of silently hitting Binance.
        return sb ?? [];
      }
    } catch (err) {
      console.warn('[chart] Supabase kline read failed, falling back to Binance:', err);
      if (backend === 'supabase') throw err;
    }
  }

  return fetchKlinesFromBinance(symbol, interval, limit, startTime, fetchImpl);
}

function intervalMs(interval: string): number {
  const units: Record<string, number> = {
    m: 60_000, h: 3_600_000, d: 86_400_000, w: 604_800_000,
  };
  const n = parseInt(interval);
  const unit = interval.slice(-1);
  return n * (units[unit] ?? 60_000);
}

async function fetchOI(
  symbol: string,
  period: string,
  limit: number,
  fetchImpl: FetchLike,
): Promise<Array<{ time: number; value: number; color: string }>> {
  try {
    const res = await fetchImpl(
      `${FAPI}/futures/data/openInterestHist?symbol=${symbol}&period=${period}&limit=${Math.min(limit, 500)}`,
    );
    if (!res.ok) return [];
    const raw = await res.json() as Array<{ timestamp: number; sumOpenInterest: string }>;
    return raw.slice(1).map((item, i) => {
      const prev = parseFloat(raw[i].sumOpenInterest);
      const curr = parseFloat(item.sumOpenInterest);
      const pct = prev > 0 ? (curr - prev) / prev : 0;
      return {
        time:  Math.floor(item.timestamp / 1000),
        value: pct * 100,
        color: pct >= 0 ? 'rgba(99,179,237,0.6)' : 'rgba(248,113,113,0.6)',
      };
    });
  } catch { return []; }
}

async function fetchFunding(
  symbol: string,
  limit: number,
  fetchImpl: FetchLike,
): Promise<Array<{ time: number; value: number; color: string }>> {
  try {
    const res = await fetchImpl(
      `${FAPI}/fapi/v1/fundingRate?symbol=${symbol}&limit=${Math.min(limit, 500)}`,
    );
    if (!res.ok) return [];
    const raw = await res.json() as Array<{ fundingTime: number; fundingRate: string }>;
    return raw.map((item) => {
      const rate = parseFloat(item.fundingRate);
      return {
        time:  Math.floor(item.fundingTime / 1000),
        value: rate * 100,
        color: rate >= 0 ? 'rgba(38,166,154,0.65)' : 'rgba(239,83,80,0.65)',
      };
    });
  } catch { return []; }
}

async function fetchCvdEngine(
  symbol: string,
  interval: string,
  limit: number,
): Promise<Array<{ time: number; value: number }>> {
  try {
    const res = await engineFetch(`/cvd/${symbol}?interval=${interval}&limit=${limit}`);
    if (!res.ok) return [];
    const data = await res.json() as { bars?: Array<{ ts: number; cum: number }> };
    return (data.bars ?? []).map(b => ({ time: Math.floor(b.ts / 1000), value: b.cum }));
  } catch {
    return [];
  }
}

// ── Layer 2: Compute ──────────────────────────────────────────────────────────

function computeIndicators(klines: KlineBar[], htfKlines?: KlineBar[], emaTf?: string) {
  const closes  = klines.map((k) => k.close);
  const highs   = klines.map((k) => k.high);
  const lows    = klines.map((k) => k.low);
  const vols    = klines.map((k) => k.volume);
  const times   = klines.map((k) => k.time);

  const { upper: bbUpper, lower: bbLower } = bollingerBands(closes, times, 20, 2);

  const indicators: ChartPayload['indicators'] = {
    sma5:    sma(closes, times, 5),
    sma20:   sma(closes, times, 20),
    sma60:   sma(closes, times, 60),
    ema21:   emaPoints(klines, 21),
    ema55:   emaPoints(klines, 55),
    atr14:   atr(highs, lows, closes, times, 14),
    vwap:    vwap(highs, lows, closes, vols, times),
    bbUpper,
    bbLower,
    rsi14:   rsi(closes, times, 14),
    macd:    macd(closes, times),
  };

  if (htfKlines && emaTf) {
    const baseTimes = klines.map((k) => k.time);
    indicators.ema21_mtf  = alignHtfSeriesToLtfTimes(baseTimes, emaPoints(htfKlines, 21));
    indicators.ema55_mtf  = alignHtfSeriesToLtfTimes(baseTimes, emaPoints(htfKlines, 55));
    indicators.emaSourceTf = emaTf;
  }

  return indicators;
}

function normalise(args: {
  symbol?: string; tf?: string; limit?: number; emaTf?: string; startTime?: number;
}) {
  return {
    symbol:    (args.symbol ?? 'BTCUSDT').trim().toUpperCase(),
    tf:        (args.tf ?? '1h').trim().toLowerCase(),
    limit:     Math.min(Math.max(args.limit ?? 500, 1), 1000),
    emaTf:     args.emaTf?.trim() ?? '',
    startTime: args.startTime,
  };
}

export async function getChartSeries(args: {
  symbol?: string;
  tf?: string;
  limit?: number;
  emaTf?: string;
  /** Cursor: fetch bars starting at this Unix timestamp (ms). */
  startTime?: number;
  fetchImpl?: FetchLike;
}): Promise<ChartSeriesResult> {
  const { symbol, tf, limit, emaTf, startTime } = normalise(args);
  const fetchImpl = args.fetchImpl ?? fetch;
  const interval  = INTERVAL_MAP[tf] ?? '1h';

  // Cache key includes startTime so cursor fetches are independently cached.
  const cacheKey = `${symbol}:${tf}:${limit}:${emaTf || 'chart'}:st=${startTime ?? 0}`;
  const now = Date.now();
  const cached = chartCache.get(cacheKey);
  if (cached && cached.expiresAt > now) return { payload: cached.payload, cacheStatus: 'hit' };

  // Shared cache (cross-instance Redis) — before hitting Binance FAPI
  const shared = await getSharedCache<ChartPayload>('chart', cacheKey);
  if (shared) {
    chartCache.set(cacheKey, { expiresAt: now + CHART_CACHE_TTL_MS, payload: shared });
    return { payload: shared, cacheStatus: 'hit' };
  }

  // Parallel fetch: klines + funding + liquidations (OI needs period key)
  const pair = symbol.replace('USDT', '/USDT').replace('BUSD', '/BUSD');
  const [klines, fundingBars, liqRaw, cvdBars] = await Promise.all([
    fetchKlines(symbol, interval, limit, startTime, fetchImpl),
    fetchFunding(symbol, limit, fetchImpl),
    fetchLiquidationHistoryServer(pair, tf, Math.min(limit, 168)).catch(() => []),
    fetchCvdEngine(symbol, interval, limit).catch(() => []),
  ]);

  const liqBars: LiqBar[] = liqRaw.map((pt) => ({
    time: pt.time,
    longUsd: pt.long,
    shortUsd: pt.short,
  }));

  const oiPeriod = OI_PERIOD_MAP[tf];
  const oiBars = oiPeriod ? await fetchOI(symbol, oiPeriod, limit, fetchImpl) : [];

  // Optional HTF klines for multi-timeframe EMA
  let htfKlines: KlineBar[] | undefined;
  const emaTfOk = Boolean(emaTf) && Boolean(INTERVAL_MAP[emaTf]) && isStrictlyHigherTf(tf, emaTf);
  if (emaTfOk) {
    try {
      htfKlines = await fetchKlines(symbol, INTERVAL_MAP[emaTf], limit, undefined, fetchImpl);
    } catch { /* MTF EMA is optional */ }
  }

  const indicators = computeIndicators(klines, htfKlines, emaTfOk ? emaTf : undefined);

  const payload: ChartPayload = { symbol, tf, klines, oiBars, fundingBars, liqBars, cvdBars, indicators };
  chartCache.set(cacheKey, { expiresAt: now + CHART_CACHE_TTL_MS, payload });
  void setSharedCache('chart', cacheKey, payload, CHART_CACHE_TTL_MS);

  return { payload, cacheStatus: 'miss' };
}

// ── SubPanel-only refresh (candle close incremental) ──────────────────────

export interface SubPanelPayload {
  symbol:      string;
  tf:          string;
  cvdBars:     Array<{ time: number; value: number }>;
  fundingBars: Array<{ time: number; value: number; color: string }>;
  oiBars:      Array<{ time: number; value: number; color: string }>;
  liqBars:     LiqBar[];
}

export async function getSubPanelBars(args: {
  symbol?: string;
  tf?: string;
  limit?: number;
  fetchImpl?: FetchLike;
}): Promise<SubPanelPayload> {
  const { symbol, tf, limit } = normalise(args);
  const fetchImpl = args.fetchImpl ?? fetch;
  const interval  = INTERVAL_MAP[tf] ?? '1h';
  const pair      = symbol.replace('USDT', '/USDT').replace('BUSD', '/BUSD');
  const oiPeriod  = OI_PERIOD_MAP[tf];

  const [fundingBars, liqRaw, cvdBars, oiBars] = await Promise.all([
    fetchFunding(symbol, limit, fetchImpl),
    fetchLiquidationHistoryServer(pair, tf, Math.min(limit, 24)).catch(() => []),
    fetchCvdEngine(symbol, interval, limit).catch(() => []),
    oiPeriod ? fetchOI(symbol, oiPeriod, limit, fetchImpl) : Promise.resolve([]),
  ]);

  const liqBars: LiqBar[] = liqRaw.map((pt) => ({
    time: pt.time,
    longUsd: pt.long,
    shortUsd: pt.short,
  }));

  return { symbol, tf, cvdBars, fundingBars, oiBars, liqBars };
}
