/**
 * useChartDataFeed — Svelte 5 rune composable for chart data loading.
 *
 * Encapsulates loadData() + loadMoreHistory() + rate-limit countdown logic
 * so ChartBoard.svelte can delegate fetch/cache management here.
 *
 * W-0287 Phase 4a.
 */
import type { IChartApi, ISeriesApi, SeriesType, UTCTimestamp } from 'lightweight-charts';
import type { ChartSeriesPayload } from '$lib/api/terminalBackend';
import { tfMinutes } from '$lib/chart/mtfAlign';
import {
  clearSharedChartLoad,
  getSharedChartLoad,
  readSharedChartPayload,
  setSharedChartLoad,
  writeSharedChartPayload,
} from '$lib/chart/chartFeedSharedCache';
import {
  calcATRBands,
  calcBB,
  calcEMA,
  calcMACD,
  calcRSI,
  calcVWAP,
  type Candle,
  type Point,
} from '$lib/chart/clientIndicators';

export interface ChartDataFeedOpts {
  /** Reactive getter for current symbol. */
  getSymbol: () => string;
  /** Reactive getter for current timeframe. */
  getTf: () => string;
  /** Reactive getter for optional higher-timeframe EMA override. */
  getEmaTf: () => string;
  /** Optional pre-fetched payload — skips network fetch when emaTf is blank. */
  getInitialData: () => ChartSeriesPayload | null;
  /** Reactive getter for the live main chart instance (for history prepend). */
  getChart: () => IChartApi | null;
  /** Reactive getter for the active price series (for history prepend). */
  getPriceSeries: () => ISeriesApi<SeriesType> | null;
  /** Whether heavy feed data (OI/funding/liq/HTF EMA) is needed right now. */
  getShouldLoadFullFeed: () => boolean;
  /** Snapshot of quick indicators that should be calculated from price bars. */
  getQuickIndicatorDemand: () => {
    ema: boolean;
    bb: boolean;
    vwap: boolean;
    atr: boolean;
    rsi: boolean;
    macd: boolean;
  };
}

type FastOhlcvBar = {
  t: number;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
  cvd: number;
};

function computeSmaSeries(candles: Candle[], period: number): Point[] {
  if (candles.length < period) return [];
  const out: Point[] = [];
  let sum = 0;
  for (let i = 0; i < candles.length; i++) {
    sum += candles[i].close;
    if (i >= period) sum -= candles[i - period].close;
    if (i >= period - 1) out.push({ time: candles[i].time, value: sum / period });
  }
  return out;
}

function buildPriceIndicators(
  candles: Candle[],
  demand: ChartDataFeedOpts['getQuickIndicatorDemand'] extends () => infer T ? T : never,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};

  if (demand.ema) {
    out.sma5 = computeSmaSeries(candles, 5);
    out.sma20 = computeSmaSeries(candles, 20);
    out.sma60 = computeSmaSeries(candles, 60);
    out.ema21 = calcEMA(candles, 21);
    out.ema55 = calcEMA(candles, 55);
  }
  if (demand.atr) {
    const atr = calcATRBands(candles, 14, 1);
    out.atr14 = atr.map((point) => ({ time: point.time, value: point.upper - point.middle }));
  }
  if (demand.vwap) {
    out.vwap = calcVWAP(candles);
  }
  if (demand.bb) {
    const bb = calcBB(candles, 20, 2);
    out.bbUpper = bb.map((point) => ({ time: point.time, value: point.upper }));
    out.bbLower = bb.map((point) => ({ time: point.time, value: point.lower }));
  }
  if (demand.rsi) {
    out.rsi14 = calcRSI(candles, 14);
  }
  if (demand.macd) {
    out.macd = calcMACD(candles, 12, 26, 9);
  }
  return out;
}

function compactDemandKey(demand: ReturnType<ChartDataFeedOpts['getQuickIndicatorDemand']>): string {
  return [
    demand.ema ? 'e' : '',
    demand.bb ? 'b' : '',
    demand.vwap ? 'v' : '',
    demand.atr ? 'a' : '',
    demand.rsi ? 'r' : '',
    demand.macd ? 'm' : '',
  ].join('');
}

function buildFastPricePayload(
  symbol: string,
  tf: string,
  bars: FastOhlcvBar[],
  demand: ReturnType<ChartDataFeedOpts['getQuickIndicatorDemand']>,
): ChartSeriesPayload | null {
  if (bars.length === 0) return null;
  const klines: Candle[] = bars.map((bar) => ({
    time: Math.floor(bar.t / 1000),
    open: bar.o,
    high: bar.h,
    low: bar.l,
    close: bar.c,
    volume: bar.v,
  }));

  return {
    symbol,
    tf,
    klines,
    oiBars: [],
    fundingBars: [],
    cvdBars: bars.map((bar) => ({ time: Math.floor(bar.t / 1000), value: bar.cvd })),
    liqBars: [],
    indicators: buildPriceIndicators(klines, demand),
  };
}

async function fetchFastPricePayload(
  symbol: string,
  tf: string,
  demand: ReturnType<ChartDataFeedOpts['getQuickIndicatorDemand']>,
): Promise<ChartSeriesPayload | null> {
  const res = await fetch(
    `/api/market/ohlcv?symbol=${encodeURIComponent(symbol)}&interval=${encodeURIComponent(tf)}&limit=500`,
    { signal: AbortSignal.timeout(10_000) },
  );
  if (!res.ok) return null;
  const data = await res.json() as { bars?: FastOhlcvBar[] };
  const bars = Array.isArray(data.bars) ? data.bars : [];
  return buildFastPricePayload(symbol, tf, bars, demand);
}

async function fetchFullChartPayload(symbol: string, tf: string, emaTf: string): Promise<Response> {
  const emaQ = emaTf ? `&emaTf=${encodeURIComponent(emaTf)}` : '';
  return fetch(`/api/chart/feed?symbol=${symbol}&tf=${tf}&limit=500${emaQ}`, {
    signal: AbortSignal.timeout(12_000),
  });
}

function mergeChartPayloads(
  pricePayload: ChartSeriesPayload | null,
  fullPayload: ChartSeriesPayload,
): ChartSeriesPayload {
  if (!pricePayload) return fullPayload;
  const fullIndicators = (fullPayload.indicators ?? {}) as Record<string, unknown>;
  const priceIndicators = (pricePayload.indicators ?? {}) as Record<string, unknown>;
  return {
    ...fullPayload,
    klines: pricePayload.klines,
    cvdBars: pricePayload.cvdBars?.length ? pricePayload.cvdBars : fullPayload.cvdBars,
    indicators: {
      ...fullIndicators,
      ...priceIndicators,
      ema21_mtf: fullIndicators.ema21_mtf,
      ema55_mtf: fullIndicators.ema55_mtf,
      emaSourceTf: fullIndicators.emaSourceTf,
    },
  };
}

function formatChartLoadError(error: unknown): string {
  if (error instanceof Error) {
    if (error.name === 'AbortError') return '';
    if (/aborted/i.test(error.message)) return '';
    if (error.name === 'TimeoutError') return 'Market data timed out. Keeping last chart snapshot.';
    if (error.message.startsWith('HTTP 5')) return 'Market data server is unstable. Keeping last chart snapshot.';
    if (error.message.startsWith('HTTP 4')) return 'Market data request failed. Retry in a moment.';
    return error.message;
  }
  if (typeof error === 'string' && error.trim()) {
    if (/aborted/i.test(error)) return '';
    return error;
  }
  return 'Market data is temporarily unavailable.';
}

export function useChartDataFeed(opts: ChartDataFeedOpts) {
  let chartData = $state<ChartSeriesPayload | null>(null);
  let loading = $state(true);
  let error = $state<string | null>(null);
  let rateLimitRetryIn = $state<number | null>(null);
  let historyLoadingMore = $state(false);
  let earliestBarTimeMs = $state<number | null>(null);

  const _cache = new Map<string, ChartSeriesPayload>();
  let _loadToken = 0;
  let _lastDataKey = '';
  let _fullFeedRetryTimer: ReturnType<typeof setTimeout> | null = null;
  let _fullFeedRetryCountdown: ReturnType<typeof setInterval> | null = null;

  function clearScheduledFullFeedRetry() {
    if (_fullFeedRetryTimer) {
      clearTimeout(_fullFeedRetryTimer);
      _fullFeedRetryTimer = null;
    }
    if (_fullFeedRetryCountdown) {
      clearInterval(_fullFeedRetryCountdown);
      _fullFeedRetryCountdown = null;
    }
    rateLimitRetryIn = null;
  }

  function scheduleFullFeedRetry(delayMs: number) {
    clearScheduledFullFeedRetry();
    rateLimitRetryIn = Math.max(1, Math.ceil(delayMs / 1000));
    _fullFeedRetryCountdown = setInterval(() => {
      rateLimitRetryIn = Math.max(0, (rateLimitRetryIn ?? 0) - 1);
      if ((rateLimitRetryIn ?? 0) <= 0 && _fullFeedRetryCountdown) {
        clearInterval(_fullFeedRetryCountdown);
        _fullFeedRetryCountdown = null;
      }
    }, 1_000);
    _fullFeedRetryTimer = setTimeout(() => {
      clearScheduledFullFeedRetry();
      void loadData();
    }, delayMs);
  }

  async function loadData() {
    const symbol = opts.getSymbol();
    const tf = opts.getTf();
    const emaTf = opts.getEmaTf();
    const shouldLoadFullFeed = opts.getShouldLoadFullFeed();
    const quickDemand = opts.getQuickIndicatorDemand();
    if (!symbol) return;

    const dataKey = `${symbol}:${tf}:${emaTf || 'chart'}:${shouldLoadFullFeed ? 'full' : 'price'}:${compactDemandKey(quickDemand)}`;
    if (dataKey === _lastDataKey && chartData) return;

    if (_cache.has(dataKey)) {
      chartData = _cache.get(dataKey) ?? null;
      error = null;
      loading = false;
      _lastDataKey = dataKey;
      return;
    }

    const sharedCached = readSharedChartPayload(dataKey);
    if (sharedCached) {
      _cache.set(dataKey, sharedCached);
      chartData = sharedCached;
      error = null;
      loading = false;
      _lastDataKey = dataKey;
      const firstBar = sharedCached.klines[0];
      if (firstBar) earliestBarTimeMs = firstBar.time * 1000;
      return;
    }

    // Only use server-prefetched initialData on the very first load (no prior key).
    // On TF/symbol changes _lastDataKey is already set, so stale initialData is ignored
    // and a real network fetch runs instead.
    const initialData = !_lastDataKey ? opts.getInitialData() : null;
    if (initialData && !emaTf) {
      _cache.set(dataKey, initialData);
      writeSharedChartPayload(dataKey, initialData);
      chartData = initialData;
      error = null;
      loading = false;
      _lastDataKey = dataKey;
      return;
    }

    const token = ++_loadToken;
    const previousChartData = chartData;
    const hadRenderableData = Boolean(previousChartData?.klines?.length);
    loading = true;
    error = null;
    clearScheduledFullFeedRetry();

    const sharedLoad = getSharedChartLoad(dataKey);
    if (sharedLoad) {
      try {
        const sharedPayload = await sharedLoad;
        if (token !== _loadToken) return;
        if (sharedPayload) {
          _cache.set(dataKey, sharedPayload);
          chartData = sharedPayload;
          error = null;
          loading = false;
          _lastDataKey = dataKey;
          const firstBar = sharedPayload.klines[0];
          if (firstBar) earliestBarTimeMs = firstBar.time * 1000;
          return;
        }
        if (hadRenderableData) {
          chartData = previousChartData;
        }
        error = 'No chart data available';
        loading = false;
      } catch (e) {
        if (token !== _loadToken) return;
        error = formatChartLoadError(e);
        loading = false;
        if (hadRenderableData) chartData = previousChartData;
      }
      return;
    }

    let resolveSharedLoad: ((payload: ChartSeriesPayload | null) => void) | null = null;
    let rejectSharedLoad: ((reason?: unknown) => void) | null = null;
    let sharedLoadSettled = false;
    const sharedLoadPromise = new Promise<ChartSeriesPayload | null>((resolve, reject) => {
      resolveSharedLoad = resolve;
      rejectSharedLoad = reject;
    });
    setSharedChartLoad(dataKey, sharedLoadPromise);
    const settleSharedLoad = (payload: ChartSeriesPayload | null) => {
      if (sharedLoadSettled) return;
      sharedLoadSettled = true;
      resolveSharedLoad?.(payload);
    };
    const failSharedLoad = (reason: unknown) => {
      if (sharedLoadSettled) return;
      sharedLoadSettled = true;
      rejectSharedLoad?.(reason);
    };

    let quickPayload: ChartSeriesPayload | null = null;

    try {
      quickPayload = await fetchFastPricePayload(symbol, tf, quickDemand);
      if (token !== _loadToken) {
        settleSharedLoad(null);
        return;
      }

      if (quickPayload) {
        chartData = quickPayload;
        loading = false;
        error = null;
        const firstBar = quickPayload.klines[0];
        if (firstBar) earliestBarTimeMs = firstBar.time * 1000;
        if (!shouldLoadFullFeed) {
          _cache.set(dataKey, quickPayload);
          writeSharedChartPayload(dataKey, quickPayload);
          _lastDataKey = dataKey;
          settleSharedLoad(quickPayload);
          return;
        }
      }
    } catch (e) {
      if (token !== _loadToken) {
        settleSharedLoad(null);
        return;
      }
      if (!shouldLoadFullFeed) {
        error = formatChartLoadError(e);
        loading = false;
        if (hadRenderableData) chartData = previousChartData;
        failSharedLoad(e);
      }
    }

    const needsFullFeed = shouldLoadFullFeed || !quickPayload;

    if (!needsFullFeed) {
      if (!quickPayload) {
        error = error ?? 'No chart data available';
        loading = false;
        if (hadRenderableData) {
          chartData = previousChartData;
          error = error ?? 'Market data is reconnecting.';
        }
      }
      return;
    }

    try {
      const chartRes = await fetchFullChartPayload(symbol, tf, emaTf);

      if (chartRes.status === 429) {
        if (token !== _loadToken) {
          settleSharedLoad(null);
          return;
        }
        if (!quickPayload) loading = false;
        scheduleFullFeedRetry(10_000);
        return;
      }

      if (!chartRes.ok) throw new Error(`HTTP ${chartRes.status}`);
      const fullPayload = (await chartRes.json()) as ChartSeriesPayload & { error?: unknown };
      if (fullPayload.error) {
        throw new Error(typeof fullPayload.error === 'string' ? fullPayload.error : 'Chart payload error');
      }
      if (token !== _loadToken) {
        settleSharedLoad(null);
        return;
      }

      const merged = mergeChartPayloads(quickPayload, fullPayload);

      _cache.set(dataKey, merged);
      writeSharedChartPayload(dataKey, merged);
      chartData = merged;
      loading = false;
      error = null;
      _lastDataKey = dataKey;
      clearScheduledFullFeedRetry();
      settleSharedLoad(merged);

      const firstBar = merged.klines[0];
      if (firstBar) earliestBarTimeMs = firstBar.time * 1000;
    } catch (e) {
      if (token !== _loadToken) {
        settleSharedLoad(null);
        return;
      }
      if (!quickPayload) {
        error = formatChartLoadError(e);
        loading = false;
        if (hadRenderableData) {
          chartData = previousChartData;
          scheduleFullFeedRetry(e instanceof Error && e.name === 'TimeoutError' ? 4_000 : 6_000);
        }
        failSharedLoad(e);
        return;
      }
      settleSharedLoad(quickPayload);
      scheduleFullFeedRetry(e instanceof Error && e.name === 'TimeoutError' ? 4_000 : 6_000);
    } finally {
      settleSharedLoad(quickPayload);
      clearSharedChartLoad(dataKey, sharedLoadPromise);
    }
  }

  async function loadMoreHistory() {
    const symbol = opts.getSymbol();
    const tf = opts.getTf();
    const emaTf = opts.getEmaTf();
    if (historyLoadingMore || earliestBarTimeMs == null || !symbol) return;

    const tfMs = tfMinutes(tf) * 60_000;
    const startTime = earliestBarTimeMs - 500 * tfMs;
    if (startTime < 0) return;

    historyLoadingMore = true;
    try {
      const emaQ = emaTf ? `&emaTf=${encodeURIComponent(emaTf)}` : '';
      const res = await fetch(
        `/api/chart/klines?symbol=${symbol}&tf=${tf}&limit=500&startTime=${startTime}${emaQ}`,
      );
      if (!res.ok) return;

      const older = (await res.json()) as {
        klines?: Array<{
          time: number;
          open: number;
          high: number;
          low: number;
          close: number;
          volume: number;
        }>;
      };
      if (!older.klines?.length) return;

      earliestBarTimeMs = older.klines[0].time * 1000;

      const mainChart = opts.getChart();
      const priceSeries = opts.getPriceSeries();
      const savedRange = mainChart?.timeScale().getVisibleLogicalRange();
      const current = (chartData?.klines ?? []) as Array<{
        time: number;
        open: number;
        high: number;
        low: number;
        close: number;
        volume: number;
      }>;
      const cutoff = older.klines[older.klines.length - 1].time;
      const merged = [...older.klines, ...current.filter((k) => k.time > cutoff)];

      if (priceSeries) {
        priceSeries.setData(
          merged.map((k) => ({
            time: k.time as UTCTimestamp,
            open: k.open,
            high: k.high,
            low: k.low,
            close: k.close,
          })),
        );
      }

      if (savedRange) {
        const prepended = older.klines.length;
        mainChart?.timeScale().setVisibleLogicalRange({
          from: savedRange.from + prepended,
          to: savedRange.to + prepended,
        });
      }
    } catch {
      /* lazy load is best-effort */
    } finally {
      historyLoadingMore = false;
    }
  }

  function reset() {
    _loadToken++;
    clearScheduledFullFeedRetry();
    loading = true;
    error = null;
    chartData = null;
    earliestBarTimeMs = null;
    rateLimitRetryIn = null;
    _lastDataKey = '';  // allow initialData shortcut on next first load
  }

  return {
    get chartData() { return chartData; },
    get loading() { return loading; },
    get error() { return error; },
    get rateLimitRetryIn() { return rateLimitRetryIn; },
    get historyLoadingMore() { return historyLoadingMore; },
    get earliestBarTimeMs() { return earliestBarTimeMs; },
    loadData,
    loadMoreHistory,
    reset,
  };
}
