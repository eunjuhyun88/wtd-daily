<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { IChartApi, ISeriesApi } from 'lightweight-charts';

  type LCModule = typeof import('lightweight-charts');
  let lc: LCModule | null = null;

  interface ChartPoint {
    time: number;
    value: number;
  }

  interface Props {
    strategySeries: ChartPoint[];
    btcSeries: ChartPoint[];
    range: '1m' | '3m' | '6m' | 'all';
    onRangeChange?: (r: '1m' | '3m' | '6m' | 'all') => void;
  }

  let { strategySeries, btcSeries, range = 'all', onRangeChange }: Props = $props();

  let container = $state<HTMLDivElement | null>(null);

  let chart: IChartApi | null = null;
  let stratSeries: ISeriesApi<'Line'> | null = null;
  let btcLineSeries: ISeriesApi<'Line'> | null = null;

  function sanitizeSeries(series: ChartPoint[]): ChartPoint[] {
    return series.filter((point) => Number.isFinite(point.time) && Number.isFinite(point.value));
  }

  function cutoffSeconds(points: ChartPoint[]): number | null {
    if (range === 'all' || points.length === 0) return null;
    const last = points.at(-1)?.time ?? 0;
    const days = range === '1m' ? 30 : range === '3m' ? 90 : 180;
    return last - (days * 24 * 60 * 60);
  }

  function seriesInRange(series: ChartPoint[], cutoff: number | null): ChartPoint[] {
    if (cutoff == null) return series;
    const filtered = series.filter((point) => point.time >= cutoff);
    return filtered.length >= 2 ? filtered : series.slice(-Math.min(series.length, 2));
  }

  function updateData() {
    if (!chart || !stratSeries || !lc) return;

    const cleanStrategy = sanitizeSeries(strategySeries);
    const cutoff = cutoffSeconds(cleanStrategy);
    const visibleStrategy = seriesInRange(cleanStrategy, cutoff);
    stratSeries.setData(visibleStrategy as never);

    if (btcLineSeries) {
      chart.removeSeries(btcLineSeries);
      btcLineSeries = null;
    }

    const cleanBtc = sanitizeSeries(btcSeries);
    const visibleBtc = seriesInRange(cleanBtc, cutoff);
    if (visibleBtc.length >= 2) {
      btcLineSeries = chart.addSeries(lc.LineSeries, { color: '#64748b', lineWidth: 1 });
      btcLineSeries.setData(visibleBtc as never);
    }

    chart.timeScale().fitContent();
  }

  onMount(() => {
    let cancelled = false;
    void (async () => {
      lc = await import('lightweight-charts');
      if (cancelled || !container) return;
      chart = lc.createChart(container, {
        layout: {
          background: { type: lc.ColorType.Solid, color: 'transparent' },
          textColor: 'rgba(255,255,255,0.4)',
        },
        grid: {
          vertLines: { color: 'rgba(255,255,255,0.04)' },
          horzLines: { color: 'rgba(255,255,255,0.04)' },
        },
        crosshair: { mode: 1 },
        rightPriceScale: { borderColor: 'rgba(255,255,255,0.08)' },
        timeScale: { borderColor: 'rgba(255,255,255,0.08)', timeVisible: true, secondsVisible: false },
        handleScroll: false,
        handleScale: false,
      });

      stratSeries = chart.addSeries(lc.LineSeries, { color: '#22c55e', lineWidth: 2 });
      updateData();
    })();
    return () => {
      cancelled = true;
    };
  });

  onDestroy(() => {
    chart?.remove();
    chart = null;
  });

  $effect(() => {
    const _strat = strategySeries;
    const _btc = btcSeries;
    const _range = range;
    if (chart && stratSeries) updateData();
  });

  const stratReturn = $derived(
    sanitizeSeries(strategySeries).length > 0
      ? ((sanitizeSeries(strategySeries).at(-1)?.value ?? 1) - 1) * 100
      : 0
  );
  const btcReturn = $derived(
    sanitizeSeries(btcSeries).length > 0
      ? ((sanitizeSeries(btcSeries).at(-1)?.value ?? 1) - 1) * 100
      : 0
  );
</script>

<div class="chart-wrap">
  <div class="legend">
    <span class="leg-item strat">
      Strategy {stratReturn >= 0 ? '+' : ''}{stratReturn.toFixed(2)}%
    </span>
    {#if btcSeries.length >= 2}
      <span class="leg-item btc">
        BTC {btcReturn >= 0 ? '+' : ''}{btcReturn.toFixed(2)}%
      </span>
    {/if}
  </div>
  <div bind:this={container} class="chart-container"></div>
  <div class="range-btns">
    {#each (['1m', '3m', '6m', 'all'] as const) as r}
      <button
        class="range-btn"
        class:active={range === r}
        onclick={() => onRangeChange?.(r)}
      >{r === '1m' ? '1M' : r === '3m' ? '3M' : r === '6m' ? '6M' : 'All'}</button>
    {/each}
  </div>
</div>

<style>
  .chart-wrap {
    display: flex;
    flex-direction: column;
    gap: 6px;
    width: 100%;
  }
  .legend {
    display: flex;
    gap: 12px;
    padding: 0 2px;
  }
  .leg-item {
    font-size: var(--ui-text-xs, 12px);
    font-family: var(--sc-font-mono, monospace);
    font-weight: 500;
  }
  .leg-item.strat { color: #22c55e; }
  .leg-item.btc { color: #64748b; }
  .chart-container {
    width: 100%;
    height: 220px;
  }
  .range-btns {
    display: flex;
    gap: 4px;
    justify-content: flex-end;
  }
  .range-btn {
    padding: 2px 8px;
    background: none;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 3px;
    font-size: var(--ui-text-xs, 12px);
    font-family: var(--sc-font-mono, monospace);
    color: rgba(255,255,255,0.4);
    cursor: pointer;
    transition: background 0.1s, color 0.1s;
  }
  .range-btn:hover {
    background: rgba(255,255,255,0.06);
    color: rgba(255,255,255,0.7);
  }
  .range-btn.active {
    background: rgba(255,255,255,0.1);
    border-color: rgba(255,255,255,0.25);
    color: rgba(255,255,255,0.9);
  }
</style>
