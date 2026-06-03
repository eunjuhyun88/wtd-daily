<script lang="ts">
  /**
   * ChartMode — mobile Chart tab
   *
   * Hosts:
   *   - Full vertical: MultiPaneChart (lightweight-charts v5 native multi-pane)
   *
   * Gesture contract (W-0087):
   *   - During range-mode (chartSaveMode.active === true), a pointer layer
   *     intercepts single taps to set anchors. Long-press + drag >= 350ms
   *     required for pan. Pinch zoom always passes through.
   *   - Outside range-mode, native LWC interactions are unmodified.
   *
   * First-use onboarding:
   *   - MobileOnboardingOverlay is mounted on top; one-shot via localStorage.
   *   - A 3-second fade hint "드래그해서 구간을 지정하세요" shows when chart
   *     has data and save mode is not yet active.
   */

  import { onMount, type Component } from 'svelte';
  import { browser } from '$app/environment';
  import type { ISeriesApi, IChartApi } from 'lightweight-charts';
  import PhaseBadge from '../../chart/overlays/PhaseBadge.svelte';
  import RangeModeToast from '../../chart/overlays/RangeModeToast.svelte';
  import MobileOnboardingOverlay from './MobileOnboardingOverlay.svelte';
  import CaptureAnnotationLayer from '../../chart/CaptureAnnotationLayer.svelte';
  import CaptureReviewDrawer from '../../chart/CaptureReviewDrawer.svelte';
  import type { CaptureAnnotation } from '../../chart/primitives/CaptureMarkerPrimitive';
  import { activePairState } from '$lib/stores/activePairStore';
  import { chartSaveMode } from '$lib/stores/chartSaveMode';
  import { chartIndicators } from '$lib/stores/chartIndicators';
  import type { ChartSeriesPayload } from '$lib/api/terminalBackend';
  import { fetchAnalyze } from '$lib/api/terminalBackend';
  import type { AnalyzeEnvelope } from '$lib/contracts/terminalBackend';
  import { PriceLineManager } from '$lib/chart/usePriceLines';

  // Derive symbol (e.g. 'BTC/USDT' → 'BTCUSDT') and tf from live store
  const symbol = $derived($activePairState.pair.replace('/', ''));
  const tf = $derived($activePairState.timeframe);

  // Defer MultiPaneChart so the mobile chart-tab shell can paint the overlay,
  // hint, and onboarding chrome without parsing lightweight-charts (~196KB).
  let MultiPaneChartComp = $state<Component | null>(null);
  $effect.pre(() => {
    if (MultiPaneChartComp) return;
    void import('../../../hubs/terminal/workspace/MultiPaneChart.svelte').then((m) => {
      MultiPaneChartComp = m.default as unknown as Component;
    });
  });

  // Chart data state — set on each fetch, reset to null at start of each fetch
  let chartData = $state<ChartSeriesPayload | null>(null);

  // Indicator deriveds from shared store
  const showVolume  = $derived($chartIndicators.volume);
  const showCVD     = $derived($chartIndicators.cvd);
  const showOI      = $derived($chartIndicators.oi);
  const showFunding = $derived($chartIndicators.funding);
  const showLiq     = $derived($chartIndicators.liq);
  const showRSI     = $derived($chartIndicators.rsi);
  const showMACD    = $derived($chartIndicators.macd);

  // ── Price lines (ENTRY/STOP/TARGET) ─────────────────────────────────────
  const priceLineMgr = new PriceLineManager();
  let analyzeData = $state<AnalyzeEnvelope | null>(null);

  const verdictLevels = $derived(
    analyzeData?.entryPlan
      ? {
          entry:  analyzeData.entryPlan.entry,
          stop:   analyzeData.entryPlan.stop,
          target: analyzeData.entryPlan.targets?.[0]?.price,
        }
      : undefined
  );

  // ── Layer 3: Capture annotations (mobile) ────────────────────────────────
  let _candleSeries = $state<ISeriesApi<'Candlestick'> | null>(null);
  let selectedCapture = $state<CaptureAnnotation | null>(null);

  function _onChartReady(_chart: IChartApi, series: ISeriesApi<'Candlestick'> | ISeriesApi<'Line'>) {
    _candleSeries = series as ISeriesApi<'Candlestick'>;
  }

  // Wire price lines whenever series or verdict changes
  $effect(() => {
    priceLineMgr.setSeries(_candleSeries);
    priceLineMgr.updateVerdictLevels(verdictLevels);
  });

  // Fetch feed + analyze in parallel whenever symbol or tf changes
  $effect(() => {
    const sym = symbol;
    const timeframe = tf;
    if (!browser || !sym) return;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    chartData = null;
    analyzeData = null;
    async function load(isRetry = false) {
      try {
        const [feedRes] = await Promise.allSettled([
          fetch(`/api/chart/feed?symbol=${encodeURIComponent(sym)}&tf=${encodeURIComponent(timeframe)}&limit=500`),
          fetchAnalyze(sym, timeframe).then(r => { analyzeData = r; }),
        ]);
        if (feedRes.status === 'fulfilled') {
          const r = feedRes.value;
          if (r.status === 429 && !isRetry) { retryTimer = setTimeout(() => load(true), 5_000); return; }
          if (r.ok) chartData = await r.json() as ChartSeriesPayload;
        }
      } catch { /* silent */ }
    }
    load();
    return () => { if (retryTimer) clearTimeout(retryTimer); };
  });

  /**
   * First-use drag hint — visible for 3 seconds then fades.
   * Only shown when chart data is present and save mode not active.
   * Gated by the same localStorage key as the onboarding overlay; once
   * the overlay has been dismissed (key set), the hint has served its
   * purpose and we suppress it.
   */
  const STORAGE_KEY = 'cogochi.mobileOnboarded';
  const STORAGE_VERSION = 'v1';

  let showHint = $state(false);

  onMount(() => {
    if (!browser) return;
    const seen = localStorage.getItem(STORAGE_KEY);
    if (seen !== STORAGE_VERSION) {
      // Delay slightly so overlay shows first; hint fades in behind it
      // but becomes visible only after overlay is dismissed.
      const showTimer = setTimeout(() => {
        if (!$chartSaveMode.active) {
          showHint = true;
        }
      }, 600);
      const hideTimer = setTimeout(() => {
        showHint = false;
      }, 3600); // 600ms delay + 3000ms visible
      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
      };
    }
  });
</script>

<div class="chart-mode">
  <div class="canvas-area">
    {#if MultiPaneChartComp}
      <MultiPaneChartComp
        data={chartData}
        {symbol}
        {tf}
        chartMode="candle"
        {showVolume}
        {showCVD}
        {showOI}
        {showFunding}
        {showLiq}
        {showRSI}
        {showMACD}
        onChartReady={_onChartReady}
      />
    {:else}
      <div class="canvas-skeleton" aria-busy="true" aria-label="차트 로딩 중"></div>
    {/if}
    <!-- Layer 2 overlay — pointer-events: none on container (W-0086) -->
    <div class="canvas-overlay">
      <div class="overlay-topright">
        {#if $chartSaveMode.active}
          <RangeModeToast active={$chartSaveMode.active} anchorASet={$chartSaveMode.anchorA !== null} />
        {/if}
        <PhaseBadge phase={null} />
      </div>

      <!-- First-use drag hint: visible for 3s then fades; never shown during range-mode -->
      {#if showHint && !$chartSaveMode.active}
        <div class="drag-hint" aria-hidden="true">Drag to set a range</div>
      {/if}
    </div>

    <!-- First-visit onboarding overlay — mounts above everything in the canvas area -->
    <MobileOnboardingOverlay />
  </div>

</div>

<!-- Layer 3: Capture annotation overlay (mobile, headless) -->
<CaptureAnnotationLayer
  series={_candleSeries}
  {symbol}
  timeframe={tf}
/>

<!-- Bottom sheet review drawer (mobile variant) -->
<CaptureReviewDrawer
  annotation={selectedCapture}
  variant="sheet"
  onClose={() => { selectedCapture = null; }}
  onVerdict={(_id, _v) => { selectedCapture = null; }}
/>

<style>
  .chart-mode {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  /* Full available vertical space */
  .canvas-area {
    flex: 1;
    min-height: 0;
    position: relative;
    overflow: hidden;
    background: var(--sc-terminal-bg, #0a0c10);
  }

  /* Layer 2 overlay — pointer-events: none so LWC crosshair/pan/zoom are unblocked (W-0086) */
  .canvas-overlay {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 5;
  }

  .overlay-topright {
    position: absolute;
    top: 12px;
    right: 12px;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 6px;
    pointer-events: none;
  }

  /* First-use hint: bottom-center, semi-transparent, fades after mount via animation */
  .drag-hint {
    position: absolute;
    bottom: 16px;
    left: 50%;
    transform: translateX(-50%);
    font-family: var(--sc-font-mono);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.04em;
    color: rgba(247, 242, 234, 0.52);
    white-space: nowrap;
    pointer-events: none;
    /* 3-second fade: appear briefly then dissolve */
    animation: hint-fade 3s cubic-bezier(0.4, 0, 1, 1) forwards;
  }

  @keyframes hint-fade {
    0%   { opacity: 0; }
    15%  { opacity: 1; }
    70%  { opacity: 1; }
    100% { opacity: 0; }
  }

  .canvas-skeleton {
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.03) 100%);
    background-size: 200% 100%;
    animation: canvas-skeleton-shimmer 1.4s ease-in-out infinite;
  }
  @keyframes canvas-skeleton-shimmer {
    0% { background-position: 100% 0; }
    100% { background-position: -100% 0; }
  }
</style>
