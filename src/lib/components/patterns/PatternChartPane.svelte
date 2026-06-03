<script lang="ts">
  import { selectedSlug } from '$lib/stores/patternsHub';
  import { fetchPatternBacktest } from '$lib/api/strategyBackend';
  import type { PatternBacktestStats } from '$lib/api/strategyBackend';
  import type { PatternStateView } from '$lib/contracts';
  import type { PnLStats } from '$lib/types/pnlStats';
  import type { PatternStats } from '$lib/types/patternStats';
  import BacktestChart from './BacktestChart.svelte';

  interface Props {
    summaryStats?: PatternStats | null;
    states?: PatternStateView[];
  }

  interface ChartPoint {
    time: number;
    value: number;
  }

  let { summaryStats = null, states = [] }: Props = $props();

  let tf = $state<'1h' | '4h' | '1d'>('1h');
  let chartRange = $state<'1m' | '3m' | '6m' | 'all'>('all');

  let loading = $state(false);
  let enginePending = $state(false);
  let stats = $state<PatternBacktestStats | null>(null);
  let btcSeries = $state<ChartPoint[]>([]);
  let curveSource = $state<'backtest' | 'pnl-stats' | null>(null);
  let loadSeq = 0;
  const BACKTEST_TIMEOUT_MS = 30_000;
  const PNL_FALLBACK_DELAY_MS = 1_200;
  const PNL_FALLBACK_TIMEOUT_MS = 4_000;

  function isoToEpochSec(iso: string | null | undefined): number | null {
    if (!iso) return null;
    const ms = new Date(iso).getTime();
    if (!Number.isFinite(ms)) return null;
    return Math.floor(ms / 1000);
  }

  function normalizeTimes(times: Array<string | null | undefined>): number[] {
    let last = 0;
    return times
      .map((time, index) => {
        const parsed = isoToEpochSec(time);
        const next = parsed == null ? last + 1 || index + 1 : Math.max(parsed, last + (index === 0 ? 0 : 1));
        last = next;
        return next;
      });
  }

  function buildSeries(curve: number[], timestamps: Array<string | null | undefined>): ChartPoint[] {
    if (curve.length < 2) return [];
    const times = normalizeTimes(timestamps.length === curve.length ? timestamps : timestamps.slice(0, curve.length));
    if (times.length !== curve.length) return [];
    return curve
      .map((value, index) => ({ time: times[index]!, value }))
      .filter((point) => Number.isFinite(point.time) && Number.isFinite(point.value));
  }

  function seriesFromPnlStats(points: PnLStats['equity_curve']): ChartPoint[] {
    const times = points.map((point) => point.ts);
    const values = points.map((point) => 1 + point.cumulative_pnl_bps / 10_000);
    return buildSeries(values, times);
  }

  function seriesFromBacktest(stats: PatternBacktestStats): ChartPoint[] {
    const timestamps = stats.equity_timestamps ?? [];
    if (timestamps.length === stats.equity_curve.length) {
      return buildSeries(stats.equity_curve, timestamps);
    }
    if (stats.since && timestamps.length === stats.equity_curve.length - 1) {
      return buildSeries(stats.equity_curve, [stats.since, ...timestamps]);
    }
    return [];
  }

  function tfToMs(timeframe: string): number {
    const table: Record<string, number> = {
      '1m': 60_000,
      '3m': 180_000,
      '5m': 300_000,
      '15m': 900_000,
      '30m': 1_800_000,
      '1h': 3_600_000,
      '2h': 7_200_000,
      '4h': 14_400_000,
      '6h': 21_600_000,
      '12h': 43_200_000,
      '1d': 86_400_000,
    };
    return table[timeframe] ?? table['1h'];
  }

  function btcFetchTf(timeframe: string, strategyPoints: ChartPoint[]): string {
    if (strategyPoints.length < 2) return '1d';
    const spanSeconds = Math.max(1, strategyPoints.at(-1)!.time - strategyPoints[0]!.time);
    const estimatedBars = Math.ceil((spanSeconds * 1000) / tfToMs(timeframe));
    if (estimatedBars <= 1000) return timeframe;
    if (estimatedBars / 4 <= 1000) return '4h';
    return '1d';
  }

  function alignBtcSeries(strategyPoints: ChartPoint[], klines: Array<{ time: number; close: number }>): ChartPoint[] {
    if (strategyPoints.length < 2 || klines.length < 2) return [];
    const sortedKlines = [...klines].sort((a, b) => a.time - b.time);
    const aligned: ChartPoint[] = [];
    let cursor = 0;
    let lastClose: number | null = null;

    for (const point of strategyPoints) {
      while (cursor < sortedKlines.length && sortedKlines[cursor]!.time <= point.time) {
        lastClose = sortedKlines[cursor]!.close;
        cursor += 1;
      }
      if (lastClose != null) aligned.push({ time: point.time, value: lastClose });
    }

    if (aligned.length < 2 || !Number.isFinite(aligned[0]!.value) || aligned[0]!.value === 0) return [];
    const base = aligned[0]!.value;
    return aligned.map((point) => ({ time: point.time, value: point.value / base }));
  }

  async function fetchPnlFallback(slug: string, timeframe: string): Promise<PatternBacktestStats | null> {
    const res = await fetch(`/api/patterns/${encodeURIComponent(slug)}/pnl-stats`, {
      signal: AbortSignal.timeout(PNL_FALLBACK_TIMEOUT_MS),
    });
    if (!res.ok) throw new Error(`pnl fallback failed: ${res.status}`);
    const body = await res.json() as PnLStats;
    const equitySeries = seriesFromPnlStats(body.equity_curve);
    if (equitySeries.length < 2) return null;
    return {
      slug,
      timeframe,
      universe_size: null,
      since: body.equity_curve[0]?.ts ?? null,
      n_signals: body.n,
      win_rate: body.win_rate,
      avg_return_72h: body.mean_pnl_bps != null ? body.mean_pnl_bps / 10_000 : null,
      hit_rate: body.win_rate,
      avg_peak_pct: null,
      sharpe: body.sharpe_like,
      apr: null,
      equity_curve: equitySeries.map((point) => point.value),
      equity_timestamps: equitySeries.map((point) => new Date(point.time * 1000).toISOString()),
      insufficient_data: body.preliminary,
      cache_hit: true,
      cached_at: body.equity_curve.at(-1)?.ts ?? null,
    };
  }

  async function loadStats(slug: string, timeframe: string) {
    const seq = ++loadSeq;
    loading = true;
    enginePending = true;
    stats = null;
    curveSource = null;
    const fallbackPromise = fetchPnlFallback(slug, timeframe).catch(() => null);
    const fallbackTimer = globalThis.setTimeout(() => {
      void fallbackPromise.then((fallback) => {
        if (seq !== loadSeq || stats) return;
        if (fallback) {
          stats = fallback;
          curveSource = 'pnl-stats';
        }
        loading = false;
      });
    }, PNL_FALLBACK_DELAY_MS);

    try {
      const next = await fetchPatternBacktest(slug, timeframe, {
        signal: AbortSignal.timeout(BACKTEST_TIMEOUT_MS),
      });
      if (seq !== loadSeq) return;
      if (next.equity_curve.length >= 2) {
        stats = next;
        curveSource = 'backtest';
        loading = false;
        return;
      }
    } catch {
      // Fall through to pnl-stats fallback below.
    } finally {
      globalThis.clearTimeout(fallbackTimer);
      if (seq === loadSeq) enginePending = false;
    }

    const fallback = await fallbackPromise;
    if (seq === loadSeq) {
      if (fallback) {
        stats = fallback;
        curveSource = 'pnl-stats';
      }
      loading = false;
    }
  }

  async function loadBtcCurve(strategyPoints: ChartPoint[], timeframe: string) {
    if (strategyPoints.length < 2) {
      btcSeries = [];
      return;
    }
    try {
      const fetchTf = btcFetchTf(timeframe, strategyPoints);
      const startMs = strategyPoints[0]!.time * 1000;
      const limit = Math.min(
        1000,
        Math.max(200, Math.ceil(((strategyPoints.at(-1)!.time - strategyPoints[0]!.time) * 1000) / tfToMs(fetchTf)) + 50),
      );
      const res = await fetch(`/api/chart/klines?symbol=BTCUSDT&tf=${encodeURIComponent(fetchTf)}&startTime=${startMs}&limit=${limit}`);
      if (!res.ok) return;
      const body = await res.json() as { klines?: number[][] };
      const btcKlines = (body.klines ?? [])
        .map((kline) => ({ time: Math.floor(Number(kline[0]) / 1000), close: Number(kline[4]) }))
        .filter((row) => Number.isFinite(row.time) && Number.isFinite(row.close));
      btcSeries = alignBtcSeries(strategyPoints, btcKlines);
    } catch {
      btcSeries = [];
    }
  }

  function fmtPct(value: number | null | undefined, digits = 0): string {
    if (value == null || !Number.isFinite(value)) return '—';
    return `${(value * 100).toFixed(digits)}%`;
  }

  function fmtSignedPct(value: number | null | undefined): string {
    if (value == null || !Number.isFinite(value)) return '—';
    const pct = value * 100;
    return `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`;
  }

  const visibleStates = $derived(states.slice(0, 8));
  const strategySeries = $derived(stats ? seriesFromBacktest(stats) : []);

  $effect(() => {
    const slug = $selectedSlug;
    const timeframe = tf;
    if (slug) {
      void loadStats(slug, timeframe);
    } else {
      stats = null;
      enginePending = false;
      btcSeries = [];
    }
  });

  $effect(() => {
    const points = strategySeries;
    const timeframe = stats?.timeframe ?? tf;
    if (points.length >= 2) {
      void loadBtcCurve(points, timeframe);
    } else {
      btcSeries = [];
    }
  });
</script>

{#if $selectedSlug}
  <div class="chart-pane">
    <div class="cp-head">
      <div class="cp-headline">
        <span class="cp-kicker">Backtest</span>
        {#if curveSource === 'pnl-stats'}
          <span class="cp-source">realized pnl</span>
        {/if}
      </div>
      <span class="cp-slug" title={$selectedSlug}>{$selectedSlug}</span>
    </div>
    <div class="cp-toolbar">
      <div class="seg-group">
        {#each (['1h', '4h', '1d'] as const) as t}
          <button class="seg" class:active={tf === t} onclick={() => { tf = t; }} type="button">{t}</button>
        {/each}
      </div>
      <div class="seg-group">
        {#each (['1m', '3m', '6m', 'all'] as const) as r}
          <button class="seg" class:active={chartRange === r} onclick={() => { chartRange = r; }} type="button">{r}</button>
        {/each}
      </div>
    </div>

    <div class="cp-summary">
      <div class="metric">
        <span class="metric-label">WR</span>
        <strong>{fmtPct(summaryStats?.hit_rate)}</strong>
      </div>
      <div class="metric">
        <span class="metric-label">EV</span>
        <strong>{fmtSignedPct(summaryStats?.expected_value)}</strong>
      </div>
      <div class="metric">
        <span class="metric-label">n</span>
        <strong>{summaryStats?.total_instances ?? (states.length || '—')}</strong>
      </div>
      <div class="metric">
        <span class="metric-label">Live</span>
        <strong>{states.length}</strong>
      </div>
    </div>

    {#if visibleStates.length > 0}
      <div class="cp-live-list" aria-label="Live symbols for {$selectedSlug}">
        {#each visibleStates as state (`${state.patternSlug}:${state.symbol}`)}
          <span class="live-chip" title={`${state.symbol} · ${state.phaseLabel}`}>
            <span>{state.symbol.replace('USDT', '')}</span>
            <em>{state.phaseLabel}</em>
          </span>
        {/each}
      </div>
    {/if}

    {#if loading}
      <div class="cp-loading">Loading…</div>
    {:else if stats && stats.equity_curve.length >= 2}
      <BacktestChart
        {strategySeries}
        {btcSeries}
        range={chartRange}
      />
    {:else if enginePending}
      <div class="cp-loading cp-loading-soft">엔진 백테스트 계산 중…</div>
    {:else}
      <div class="cp-empty">백테스트 데이터 없음</div>
    {/if}
  </div>
{/if}

<style>
  .chart-pane {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.07);
    background: rgba(0, 0, 0, 0.15);
  }
  .cp-head {
    display: grid;
    gap: 4px;
    padding: 12px 14px 10px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }
  .cp-headline {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .cp-kicker {
    font-size: 11px;
    font-family: var(--sc-font-mono, monospace);
    font-weight: 700;
    color: rgba(250, 247, 235, 0.34);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .cp-source {
    padding: 2px 6px;
    border-radius: 999px;
    border: 1px solid rgba(245, 158, 11, 0.22);
    background: rgba(245, 158, 11, 0.08);
    font-size: 11px;
    font-family: var(--sc-font-mono, monospace);
    color: #fcd34d;
    text-transform: uppercase;
  }
  .cp-slug {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 12px;
    font-family: var(--sc-font-mono, monospace);
    font-weight: 700;
    color: rgba(250, 247, 235, 0.78);
  }
  .cp-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }
  .seg-group { display: flex; gap: 2px; }
  .seg {
    padding: 3px 8px;
    font-size: 11px;
    font-family: var(--sc-font-mono, monospace);
    font-weight: 600;
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    color: rgba(255, 255, 255, 0.4);
    cursor: pointer;
  }
  .seg:hover { color: rgba(255, 255, 255, 0.7); border-color: rgba(255, 255, 255, 0.25); }
  .seg.active { background: rgba(96, 165, 250, 0.15); border-color: rgba(96, 165, 250, 0.4); color: #60a5fa; }

  .cp-summary {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 1px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    background: rgba(255, 255, 255, 0.04);
  }
  .metric {
    min-width: 0;
    display: grid;
    gap: 3px;
    padding: 9px 10px;
    background: rgba(7, 7, 10, 0.82);
  }
  .metric-label {
    font-size: 11px;
    font-family: var(--sc-font-mono, monospace);
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(250, 247, 235, 0.32);
  }
  .metric strong {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 13px;
    font-family: var(--sc-font-mono, monospace);
    color: rgba(250, 247, 235, 0.86);
  }
  .cp-live-list {
    display: flex;
    gap: 6px;
    overflow-x: auto;
    padding: 8px 10px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }
  .live-chip {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    max-width: 180px;
    padding: 4px 8px;
    border: 1px solid rgba(96, 165, 250, 0.22);
    border-radius: 4px;
    background: rgba(96, 165, 250, 0.08);
    font-family: var(--sc-font-mono, monospace);
    font-size: 11px;
    color: rgba(219, 234, 254, 0.86);
  }
  .live-chip span,
  .live-chip em {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .live-chip em {
    max-width: 90px;
    color: rgba(147, 197, 253, 0.64);
    font-style: normal;
  }
  .cp-loading, .cp-empty {
    flex: 1;
    min-height: 220px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--ui-text-xs, 11px);
    font-family: var(--sc-font-mono, monospace);
    color: rgba(255, 255, 255, 0.25);
  }
  .cp-loading-soft { color: rgba(255, 255, 255, 0.4); }
</style>
