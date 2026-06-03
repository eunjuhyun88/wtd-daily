<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { shellStore, activeTabState, activeDrawingMode } from '../shell.store';
  import type { ChartType, DrawingTool } from '../shell.store';
  import { chartSaveMode } from '$lib/stores/chartSaveMode';
  import { chartSaveModeV2 } from '$lib/stores/chartSaveMode.store';
  import { priceStore } from '$lib/stores/priceStore';
  import { getBaseSymbolFromPair } from '$lib/utils/price';
  import { get } from 'svelte/store';
  import {
    chartIndicators,
    toggleIndicator,
    type IndicatorKey,
  } from '$lib/stores/chartIndicators';
  import { activePaneId } from '$lib/stores/paneIndicators';
  import { getPaneIndicatorStore, togglePaneIndicator } from '$lib/stores/perPaneIndicators';
  import PriceBar from './PriceBar.svelte';
  import {
    trackChartTfSwitch,
    trackChartTypeChange,
    trackChartIndicatorToggled,
  } from '../telemetry';

  interface Props {
    onIndicators?: () => void;
    onSettings?: () => void;
    onSymbolTap?: () => void;
  }
  const { onIndicators, onSettings, onSymbolTap }: Props = $props();

  const CHART_TYPES: Array<{ id: ChartType; label: string; full: string }> = [
    { id: 'candle', label: 'CNDL', full: 'Candle' },
    { id: 'line',   label: 'LINE', full: 'Line' },
    { id: 'heikin', label: 'HA',   full: 'Heikin Ashi' },
    { id: 'bar',    label: 'BAR',  full: 'Bar' },
    { id: 'area',   label: 'AREA', full: 'Area' },
  ];

  // TradingView-style TF strip: most-used 7 inline + ▾ overflow for the rest.
  // Labels are TV shortform (`1` for 1m, `1H` for 1h, `D` for 1d) so 7 chips
  // stay visible even on narrow chart columns.
  const TF_PRIMARY: Array<{ id: string; label: string }> = [
    { id: '1m',  label: '1' },
    { id: '5m',  label: '5' },
    { id: '15m', label: '15' },
    { id: '30m', label: '30' },
    { id: '1h',  label: '1H' },
    { id: '4h',  label: '4H' },
    { id: '1d',  label: 'D' },
  ];
  const TF_OVERFLOW: Array<{ id: string; label: string }> = [
    { id: '3m',  label: '3m' },
    { id: '2h',  label: '2H' },
    { id: '6h',  label: '6H' },
    { id: '12h', label: '12H' },
    { id: '1w',  label: 'W' },
  ];
  const chartType = $derived($activeTabState.chartType ?? 'candle');
  const tf = $derived($activeTabState.timeframe ?? '4h');
  const symbol = $derived($activeTabState.symbol ?? 'BTCUSDT');
  const heatmapOn = $derived($activeTabState.heatmapOn ?? false);
  const vpOn = $derived($activeTabState.vpOn ?? false);
  // Per-pane indicator state — mirrors active pane store in multi-pane mode, global otherwise.
  let _ind = $state(get(chartIndicators));
  $effect(() => {
    const isMultiPane = $shellStore.workspaceMode !== 'single';
    const store = isMultiPane ? getPaneIndicatorStore($activePaneId) : chartIndicators;
    return store.subscribe(v => { _ind = v; });
  });

  const compareOn = $derived(_ind.comparison);
  const priceScaleMode = $derived($activeTabState.priceScaleMode ?? 'normal');

  function setPriceScale(mode: 'normal' | 'log' | 'percent') {
    shellStore.updateTabState((s) => ({ ...s, priceScaleMode: mode }));
  }

  const baseSym = $derived(getBaseSymbolFromPair(symbol));
  const dispSym = $derived(baseSym ? `${baseSym}/USDT` : symbol);

  const priceEntry = $derived($priceStore[baseSym]);
  const livePrice = $derived(priceEntry?.price ?? 0);
  const change24h = $derived(priceEntry?.change24h ?? 0);
  const high24h = $derived(priceEntry?.high24h ?? 0);
  const low24h = $derived(priceEntry?.low24h ?? 0);
  const volume24h = $derived(priceEntry?.volume24h ?? 0);
  const priceClass = $derived(change24h > 0 ? 'pos' : change24h < 0 ? 'neg' : 'flat');

  function formatVol(v: number): string {
    if (!v) return '—';
    if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(2)}B`;
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
    return v.toFixed(0);
  }

  const currentTypeLabel = $derived(
    CHART_TYPES.find((t) => t.id === chartType)?.label ?? 'CNDL',
  );

  let densityCompact = $state(browser ? document.documentElement.dataset.density === 'compact' : false);

  function toggleDensity() {
    densityCompact = !densityCompact;
    if (browser) {
      document.documentElement.dataset.density = densityCompact ? 'compact' : 'comfortable';
      try { localStorage.setItem('wtd.density', densityCompact ? 'compact' : 'comfortable'); } catch {}
    }
  }

  let typeOpen = $state(false);
  let typeMenu: HTMLDivElement | null = $state(null);
  let tfMoreOpen = $state(false);
  let tfMoreMenu: HTMLDivElement | null = $state(null);
  let overlaysOpen = $state(false);
  let overlaysMenu: HTMLDivElement | null = $state(null);
  let drawOpen = $state(false);
  let drawMenu: HTMLDivElement | null = $state(null);
  let indicatorsOpen = $state(false);
  let indicatorsMenu: HTMLDivElement | null = $state(null);

  // CPO P0 — Drawing combo dropdown. The single `Draw` button used to
  // hard-pick `trendLine` regardless of what the user actually wanted; the
  // other 6 drawing tools were unreachable from the toolbar. This dropdown
  // surfaces them inline with a glyph + label and toggles back to cursor
  // when the active tool is reselected (shell.store handles the toggle).
  const DRAWING_TOOLS: Array<{ id: DrawingTool; label: string; glyph: string }> = [
    { id: 'cursor',          label: 'Cursor',           glyph: '↖' },
    { id: 'trendLine',       label: 'Trend line',       glyph: '╱' },
    { id: 'horizontalLine',  label: 'Horizontal line',  glyph: '━' },
    { id: 'verticalLine',    label: 'Vertical line',    glyph: '│' },
    { id: 'extendedLine',    label: 'Extended line',    glyph: '↗' },
    { id: 'rectangle',       label: 'Rectangle',        glyph: '▭' },
    { id: 'fibRetracement',  label: 'Fib retracement',  glyph: 'φ' },
    { id: 'textLabel',       label: 'Text label',       glyph: 'T' },
  ];
  const activeDrawingTool = $derived(($shellStore.drawingTool ?? 'cursor') as DrawingTool);
  const drawingActive = $derived($activeDrawingMode && activeDrawingTool !== 'cursor');

  function pickDrawing(id: DrawingTool) {
    shellStore.setDrawingTool(id);
    drawOpen = false;
  }

  // CPO P0 — Indicators combo dropdown. The single `fx` icon button only
  // opened a separate settings dialog (mode-shift); the most common ask
  // is "toggle EMA / RSI / Volume" which doesn't need a dialog. The
  // dropdown groups indicators by where they render (overlay on the main
  // chart vs reserved sub-pane slot) so the user can predict the layout
  // impact before clicking. `More…` keeps the existing settings dialog
  // for parameter tuning. */
  type IndicatorRow = { key: IndicatorKey; label: string };
  const INDICATOR_OVERLAYS: IndicatorRow[] = [
    { key: 'ema',          label: 'EMA' },
    { key: 'bb',           label: 'Bollinger Bands' },
    { key: 'vwap',         label: 'VWAP' },
    { key: 'vwma',         label: 'VWMA 100' },
    { key: 'atr_bands',    label: 'ATR bands' },
    { key: 'volumeProfile',label: 'Volume profile' },
  ];
  const INDICATOR_PANES: IndicatorRow[] = [
    { key: 'volume',  label: 'Volume' },
    { key: 'rsi',     label: 'RSI' },
    { key: 'macd',    label: 'MACD' },
    { key: 'oi',      label: 'Open interest' },
    { key: 'cvd',     label: 'CVD' },
    { key: 'funding', label: 'Funding' },
    { key: 'liq',     label: 'Liquidations' },
    { key: 'obv',     label: 'OBV' },
  ];
  const indicatorsActiveCount = $derived(
    INDICATOR_OVERLAYS.reduce((n, r) => n + (_ind[r.key] ? 1 : 0), 0) +
    INDICATOR_PANES.reduce((n, r) => n + (_ind[r.key] ? 1 : 0), 0),
  );
  const paneActiveCount = $derived(
    INDICATOR_PANES.reduce((n, r) => n + (_ind[r.key] ? 1 : 0), 0),
  );
  const PANE_LIMIT = 6;

  function toggleInd(key: IndicatorKey) {
    if ($shellStore.workspaceMode !== 'single') togglePaneIndicator(get(activePaneId), key);
    else toggleIndicator(key);
  }

  function isPane(key: IndicatorKey): boolean {
    return INDICATOR_PANES.some((r) => r.key === key);
  }
  function paneDisabled(key: IndicatorKey): boolean {
    if (!isPane(key)) return false;
    if (_ind[key]) return false;
    return paneActiveCount >= PANE_LIMIT;
  }

  /** Single source of truth for the Overlays ▾ menu. The label is what
   *  shows next to the checkbox in the dropdown — "hover labels" the CPO
   *  asked for, but rendered as inline menu text instead of just title
   *  tooltips so they're always visible when the menu is open. */
  const OVERLAYS = $derived([
    {
      id: 'heatmap',
      label: 'Liquidation heatmap',
      short: 'HM',
      on: heatmapOn,
      toggle: toggleHeatmap,
      title: 'Liquidation heatmap overlay',
    },
    {
      id: 'btc',
      label: 'BTC comparison',
      short: 'BTC∥',
      on: compareOn,
      toggle: () => toggleInd('comparison'),
      title: 'Overlay BTC price for relative move',
    },
    {
      id: 'vp',
      label: 'Volume profile',
      short: 'VP',
      on: vpOn,
      toggle: toggleVP,
      title: 'Volume-by-price profile on right axis',
    },
  ] as const);
  const overlaysActiveCount = $derived(OVERLAYS.filter((o) => o.on).length);

  function pickType(id: ChartType) {
    trackChartTypeChange({ from_type: chartType, to_type: id, symbol });
    shellStore.setChartType(id);
    typeOpen = false;
  }

  function setTF(t: string) {
    trackChartTfSwitch({ from_tf: tf, to_tf: t, symbol, trigger: 'click' });
    shellStore.setTimeframe(t);
    tfMoreOpen = false;
  }

  // If the active TF lives in the overflow set, surface it with the ▾ button
  // so the user always sees what they're on.
  const overflowActive = $derived(TF_OVERFLOW.some((t) => t.id === tf));
  const overflowLabel = $derived(
    TF_OVERFLOW.find((t) => t.id === tf)?.label ?? '\u25be',
  );

  function dispatch(id: string) {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent('cogochi:cmd', { detail: { id } }));
  }

  function startSave() {
    chartSaveMode.enterRangeMode();
    chartSaveModeV2.enterRangeMode();
    shellStore.updateTabState((s) => ({ ...s, rangeSelection: true }));
  }

  function onIndicator() {
    if (onIndicators) onIndicators();
    else dispatch('open_indicator_settings');
  }

  function toggleHeatmap() {
    shellStore.updateTabState((s) => ({ ...s, heatmapOn: !s.heatmapOn }));
  }

  function toggleVP() {
    shellStore.updateTabState((s) => ({ ...s, vpOn: !s.vpOn }));
  }

  function formatPrice(p: number): string {
    if (!p) return '—';
    if (p >= 10000) return p.toLocaleString('en-US', { maximumFractionDigits: 0 });
    if (p >= 100) return p.toLocaleString('en-US', { maximumFractionDigits: 2 });
    return p.toLocaleString('en-US', { maximumFractionDigits: 4 });
  }

  function formatChange(c: number): string {
    const sign = c > 0 ? '+' : '';
    return `${sign}${c.toFixed(2)}%`;
  }

  // Close dropdowns on outside click / Escape. Generic walker so adding
  // a new menu only requires registering its (open, ref) pair below.
  onMount(() => {
    const menus = (): Array<[() => boolean, (v: boolean) => void, () => HTMLElement | null]> => [
      [() => typeOpen,        (v) => (typeOpen = v),        () => typeMenu],
      [() => tfMoreOpen,      (v) => (tfMoreOpen = v),      () => tfMoreMenu],
      [() => overlaysOpen,    (v) => (overlaysOpen = v),    () => overlaysMenu],
      [() => drawOpen,        (v) => (drawOpen = v),        () => drawMenu],
      [() => indicatorsOpen,  (v) => (indicatorsOpen = v),  () => indicatorsMenu],
    ];
    function onClick(e: MouseEvent) {
      const target = e.target as Node | null;
      if (!target) return;
      for (const [isOpen, set, ref] of menus()) {
        const el = ref();
        if (isOpen() && el && !el.contains(target)) set(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key !== 'Escape') return;
      for (const [isOpen, set] of menus()) if (isOpen()) set(false);
    }
    window.addEventListener('mousedown', onClick);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onClick);
      window.removeEventListener('keydown', onKey);
    };
  });
</script>

<div class="chart-toolbar" role="toolbar" aria-label="Chart toolbar">
  <!-- PriceBar: symbol + price + Δ% + 24h H/L/Vol -->
  <PriceBar
    {dispSym}
    {livePrice}
    {change24h}
    {high24h}
    {low24h}
    {volume24h}
    onSymbolTap={onSymbolTap}
  />

  <span class="tb-divider"></span>

  <!-- TF strip — TradingView-style: 7 primary chips inline, ▾ overflow for the
       rest. Active TF gets a brand bottom-border for unmistakable focus. -->
  <div class="tf-strip" role="group" aria-label="Timeframe">
    {#each TF_PRIMARY as t (t.id)}
      <button
        class="tf-chip"
        class:active={tf === t.id}
        onclick={() => setTF(t.id)}
        title="Timeframe {t.id}"
        aria-pressed={tf === t.id}
      >{t.label}</button>
    {/each}
    <div class="tf-more-wrap" bind:this={tfMoreMenu}>
      <button
        class="tf-chip tf-more"
        class:active={overflowActive}
        class:open={tfMoreOpen}
        onclick={() => (tfMoreOpen = !tfMoreOpen)}
        aria-haspopup="listbox"
        aria-expanded={tfMoreOpen}
        title="More timeframes"
      >{overflowLabel}<span class="tf-more-arrow" aria-hidden="true">▾</span></button>
      {#if tfMoreOpen}
        <div class="tf-more-menu" role="listbox" aria-label="More timeframes">
          {#each TF_OVERFLOW as t (t.id)}
            <button
              type="button"
              class="tf-more-item"
              class:active={tf === t.id}
              role="option"
              aria-selected={tf === t.id}
              onclick={() => setTF(t.id)}
            >{t.label}</button>
          {/each}
        </div>
      {/if}
    </div>
  </div>

  <span class="tb-divider"></span>

  <!-- Chart type dropdown -->
  <div class="ct-wrap" bind:this={typeMenu}>
    <button
      class="tb-btn tb-trigger"
      class:open={typeOpen}
      onclick={() => (typeOpen = !typeOpen)}
      title="Chart type"
      aria-haspopup="listbox"
      aria-expanded={typeOpen}
    >
      <span class="tb-label">{currentTypeLabel}</span>
      <span class="tb-arrow">▾</span>
    </button>
    {#if typeOpen}
      <div class="ct-menu" role="listbox" aria-label="Chart type">
        {#each CHART_TYPES as ct (ct.id)}
          <button
            type="button"
            class="ct-item"
            class:active={chartType === ct.id}
            role="option"
            aria-selected={chartType === ct.id}
            onclick={() => pickType(ct.id)}
          >
            <span class="ct-item-label">{ct.label}</span>
            <span class="ct-item-full">{ct.full}</span>
            {#if chartType === ct.id}<span class="ct-item-check">✓</span>{/if}
          </button>
        {/each}
      </div>
    {/if}
  </div>

  <span class="tb-divider"></span>

  <!-- Indicators ▾ — fx button used to fire onIndicators() and open a separate
       settings dialog (mode-shift). The dropdown now lists 13 indicators
       grouped by where they render (5 main-chart overlays + 8 reserved
       sub-pane slots) so the common "toggle EMA / RSI / Volume" ask doesn't
       require a dialog. `Settings…` keeps the original dialog path for
       parameter tuning. (CPO P0) -->
  <div class="indicators-wrap" bind:this={indicatorsMenu}>
    <button
      class="tb-btn tb-trigger"
      class:active={indicatorsActiveCount > 0}
      class:open={indicatorsOpen}
      onclick={() => (indicatorsOpen = !indicatorsOpen)}
      title="Indicators (fx)"
      aria-haspopup="menu"
      aria-expanded={indicatorsOpen}
    >
      <span class="tb-glyph">fx</span>
      {#if indicatorsActiveCount > 0}
        <span class="overlays-count" aria-label="{indicatorsActiveCount} active">{indicatorsActiveCount}</span>
      {/if}
      <span class="tb-arrow">▾</span>
    </button>
    {#if indicatorsOpen}
      <div class="overlays-menu wide" role="menu" aria-label="Chart indicators">
        <div class="menu-section-label">Overlays</div>
        {#each INDICATOR_OVERLAYS as r (r.key)}
          <button
            type="button"
            class="overlays-item"
            class:active={_ind[r.key]}
            role="menuitemcheckbox"
            aria-checked={_ind[r.key]}
            onclick={() => toggleInd(r.key)}
          >
            <span class="overlays-check" aria-hidden="true">{_ind[r.key] ? '✓' : ' '}</span>
            <span class="overlays-label">{r.label}</span>
          </button>
        {/each}
        <div class="menu-section-label">
          Panes
          <span class="menu-section-hint">{paneActiveCount}/{PANE_LIMIT}</span>
        </div>
        {#each INDICATOR_PANES as r (r.key)}
          <button
            type="button"
            class="overlays-item"
            class:active={_ind[r.key]}
            class:disabled={paneDisabled(r.key)}
            disabled={paneDisabled(r.key)}
            role="menuitemcheckbox"
            aria-checked={_ind[r.key]}
            onclick={() => toggleInd(r.key)}
            title={paneDisabled(r.key) ? `Pane limit reached (${PANE_LIMIT}). Disable another first.` : undefined}
          >
            <span class="overlays-check" aria-hidden="true">{_ind[r.key] ? '✓' : ' '}</span>
            <span class="overlays-label">{r.label}</span>
          </button>
        {/each}
        <button
          type="button"
          class="overlays-item menu-footer"
          onclick={() => { indicatorsOpen = false; onIndicator(); }}
        >
          <span class="overlays-check" aria-hidden="true"></span>
          <span class="overlays-label">Settings…</span>
        </button>
      </div>
    {/if}
  </div>

  <!-- Draw ▾ — exposes the 7 drawing tools the old `Draw` button hid behind
       a forced `trendLine` selection. Re-clicking the active tool toggles
       back to cursor (handled in shell.store). (CPO P0) -->
  <div class="overlays-wrap" bind:this={drawMenu}>
    <button
      class="tb-btn tb-trigger"
      class:active={drawingActive}
      class:open={drawOpen}
      onclick={() => (drawOpen = !drawOpen)}
      title="Drawing tools"
      aria-haspopup="menu"
      aria-expanded={drawOpen}
      aria-pressed={drawingActive}
    >
      <span class="tb-text">Draw</span>
      <span class="tb-arrow">▾</span>
    </button>
    {#if drawOpen}
      <div class="overlays-menu" role="menu" aria-label="Drawing tools">
        {#each DRAWING_TOOLS as t (t.id)}
          <button
            type="button"
            class="overlays-item"
            class:active={activeDrawingTool === t.id}
            role="menuitemradio"
            aria-checked={activeDrawingTool === t.id}
            onclick={() => pickDrawing(t.id)}
          >
            <span class="overlays-check" aria-hidden="true">{activeDrawingTool === t.id ? '✓' : ' '}</span>
            <span class="overlays-label">{t.label}</span>
            <span class="overlays-short" aria-hidden="true">{t.glyph}</span>
          </button>
        {/each}
      </div>
    {/if}
  </div>

  <button class="tb-btn" onclick={() => dispatch('chart_snapshot')} title="Save chart image">
    <span class="tb-text">Snap</span>
  </button>

  <span class="tb-divider"></span>

  <!-- Zoom + view controls -->
  <button class="tb-btn tb-icon" onclick={() => dispatch('chart_zoom_in')} title="Zoom in" aria-label="Zoom in">
    <span class="tb-glyph">+</span>
  </button>
  <button class="tb-btn tb-icon" onclick={() => dispatch('chart_zoom_out')} title="Zoom out" aria-label="Zoom out">
    <span class="tb-glyph">−</span>
  </button>
  <button class="tb-btn tb-icon" onclick={() => dispatch('chart_fit')} title="Fit content" aria-label="Fit content">
    <span class="tb-glyph">⤢</span>
  </button>
  <button class="tb-btn tb-icon" onclick={() => dispatch('chart_realtime')} title="Scroll to realtime" aria-label="Scroll to realtime">
    <span class="tb-glyph">↻</span>
  </button>

  <span class="tb-spacer"></span>

  <!-- Overlays ▾ — heatmap / BTC compare / volume profile collapsed into a
       single combo with descriptive labels. Reduces 3 always-visible icon
       toggles to 1, surfaces full names on hover (CPO P0). The trigger
       turns brand-coloured when at least one overlay is on so the user
       still knows something is layered on the chart at a glance. -->
  <div class="overlays-wrap" bind:this={overlaysMenu}>
    <button
      class="tb-btn tb-trigger"
      class:active={overlaysActiveCount > 0}
      class:open={overlaysOpen}
      onclick={() => (overlaysOpen = !overlaysOpen)}
      title="Chart overlays"
      aria-haspopup="menu"
      aria-expanded={overlaysOpen}
    >
      <span class="tb-text">Overlays</span>
      {#if overlaysActiveCount > 0}
        <span class="overlays-count" aria-label="{overlaysActiveCount} active">{overlaysActiveCount}</span>
      {/if}
      <span class="tb-arrow">▾</span>
    </button>
    {#if overlaysOpen}
      <div class="overlays-menu" role="menu" aria-label="Chart overlays">
        {#each OVERLAYS as o (o.id)}
          <button
            type="button"
            class="overlays-item"
            class:active={o.on}
            role="menuitemcheckbox"
            aria-checked={o.on}
            onclick={() => o.toggle()}
            title={o.title}
          >
            <span class="overlays-check" aria-hidden="true">{o.on ? '✓' : ' '}</span>
            <span class="overlays-label">{o.label}</span>
            <span class="overlays-short">{o.short}</span>
          </button>
        {/each}
      </div>
    {/if}
  </div>

  <span class="tb-divider"></span>

  <!-- Price scale mode -->
  <div class="scale-group" role="group" aria-label="Price scale">
    <button
      class="tb-btn scale-btn"
      class:active={priceScaleMode === 'normal'}
      onclick={() => setPriceScale('normal')}
      title="Auto scale"
    >Auto</button>
    <button
      class="tb-btn scale-btn"
      class:active={priceScaleMode === 'log'}
      onclick={() => setPriceScale('log')}
      title="Log scale"
    >Log</button>
    <button
      class="tb-btn scale-btn"
      class:active={priceScaleMode === 'percent'}
      onclick={() => setPriceScale('percent')}
      title="Percent scale"
    >%</button>
  </div>

  <span class="tb-divider"></span>

  <button
    class="tb-btn scale-btn"
    class:active={densityCompact}
    onclick={toggleDensity}
    title={densityCompact ? 'Switch to comfortable density' : 'Switch to compact density'}
    aria-pressed={densityCompact}
  ><span class="tb-text">{densityCompact ? 'Cmp' : 'Std'}</span></button>

  <span class="tb-divider"></span>

  <button class="tb-btn tb-primary" onclick={startSave} title="Save range (B)">
    <span class="tb-text">Save</span>
  </button>
</div>

<style>
  /* ── Design tokens ──────────────────────────────────────────────────────────
   * Transparent bg + clear borders + Space Grotesk labels + Mono for data.
   * This is the terminal panel pattern for W-0407.
   */

  .chart-toolbar {
    height: var(--term-toolbar-h, 30px);
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: var(--term-gap-1, 4px);
    padding: 0 var(--term-gap-2, 8px);
    background: var(--term-surface-1, var(--g1, #0a0a0a));
    border-bottom: 1px solid var(--term-border, var(--g4, rgba(255,255,255,0.08)));
    font-family: var(--fb, 'Space Grotesk', sans-serif);
    color: var(--g8, rgba(247,242,234,0.82));
    overflow: hidden;
  }

  .tb-divider {
    width: 1px;
    height: 16px;
    background: var(--term-border-strong, rgba(255, 255, 255, 0.14));
    margin: 0 2px;
    flex-shrink: 0;
  }

  .tb-spacer { flex: 1; }

  .scale-group {
    display: flex;
    gap: 0;
  }
  .scale-btn {
    padding: 0 5px;
    border-radius: 0;
  }
  .scale-btn:first-child { border-radius: 3px 0 0 3px; }
  .scale-btn:last-child  { border-radius: 0 3px 3px 0; }

  .tb-btn {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    height: var(--term-toolbar-btn-h, 24px);
    padding: 0 7px;
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--term-radius-sm, 5px);
    color: var(--term-text-1, rgba(255, 255, 255, 0.82));
    font-family: inherit;
    font-size: var(--ui-text-xs, 11px);
    cursor: pointer;
    transition: background 0.1s, color 0.1s, border-color 0.1s;
    flex-shrink: 0;
  }
  .tb-btn:hover {
    background: var(--term-surface-3, rgba(255, 255, 255, 0.07));
    color: var(--term-text-0, rgba(255, 255, 255, 0.92));
    border-color: var(--term-border-strong, rgba(255, 255, 255, 0.18));
  }
  .tb-btn.active {
    background: color-mix(in srgb, var(--brand, #4a9eff) 14%, transparent);
    color: var(--brand, #4a9eff);
    border-color: color-mix(in srgb, var(--brand, #4a9eff) 38%, transparent);
  }

  /* Symbol button — slightly more prominent */
  .sym-btn {
    gap: 5px;
    padding: 0 8px;
    border-color: var(--term-border-strong, rgba(255, 255, 255, 0.15)) !important;
    background: var(--term-surface-2, rgba(255, 255, 255, 0.05)) !important;
  }
  .sym-btn:hover {
    background: color-mix(in srgb, var(--term-surface-3, rgba(255,255,255,0.08)) 92%, transparent) !important;
    border-color: rgba(255, 255, 255, 0.22) !important;
  }
  .sym-icon { font-size: 12px; color: rgba(255, 255, 255, 0.38); }
  .sym-name {
    font-family: var(--fm, 'JetBrains Mono', monospace);
    font-weight: 700;
    letter-spacing: 0.03em;
    color: rgba(255, 255, 255, 0.95);
    font-size: var(--ui-text-xs, 11px);
  }
  .sym-price {
    font-family: var(--fm, 'JetBrains Mono', monospace);
    font-size: var(--ui-text-xs, 11px);
    color: rgba(255, 255, 255, 0.78);
    margin-left: 3px;
  }
  .sym-change {
    font-family: var(--fm, 'JetBrains Mono', monospace);
    font-size: var(--ui-text-xs, 11px);
  }
  .sym-change.pos { color: var(--bull, #26a69a); }
  .sym-change.neg { color: var(--bear, #ef5350); }
  .sym-change.flat { color: rgba(255, 255, 255, 0.42); }

  /* Price strip — H/L/Vol read-only stats, Binance-style compact */
  .price-strip {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 8px;
    flex-shrink: 0;
  }
  .price-stat {
    display: flex;
    align-items: baseline;
    gap: 3px;
  }
  .stat-lbl {
    font-size: var(--ui-text-xs, 11px);
    color: rgba(255, 255, 255, 0.35);
    letter-spacing: 0.04em;
  }
  .stat-val {
    font-family: var(--fm, 'JetBrains Mono', monospace);
    font-size: 11px;
    color: rgba(255, 255, 255, 0.62);
  }

  /* TF strip — TradingView pattern: minimal chrome, active TF marked with a
     2px brand bottom-border + brand color. No background fill so the strip
     reads as a single segmented control instead of N separate buttons. */
  .tf-strip {
    display: flex;
    align-items: stretch;
    gap: 0;
    height: var(--term-toolbar-btn-h, 24px);
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: none;
    min-width: 0;
    flex-shrink: 1;
  }
  .tf-strip::-webkit-scrollbar { display: none; }
  .tf-chip {
    min-width: 24px;
    height: var(--term-toolbar-btn-h, 24px);
    padding: 0 8px;
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    border-radius: 0;
    color: rgba(255, 255, 255, 0.55);
    font-family: var(--fm, 'JetBrains Mono', monospace);
    font-size: var(--ui-text-xs, 11px);
    font-weight: 600;
    letter-spacing: 0.02em;
    cursor: pointer;
    transition: color 0.1s, border-color 0.1s, background 0.1s;
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .tf-chip:hover {
    color: rgba(255, 255, 255, 0.92);
    background: rgba(255, 255, 255, 0.04);
  }
  .tf-chip.active {
    color: var(--brand, #4a9eff);
    border-bottom-color: var(--brand, #4a9eff);
    background: transparent;
  }

  /* ▾ overflow — same chip language; arrow is a soft afterthought */
  .tf-more-wrap {
    position: relative;
    display: inline-flex;
    align-items: stretch;
    margin-left: 2px;
  }
  .tf-more {
    gap: 2px;
    padding: 0 5px 0 7px;
  }
  .tf-more.open {
    color: rgba(255, 255, 255, 0.92);
    background: rgba(255, 255, 255, 0.06);
  }
  .tf-more-arrow {
    font-size: 11px;
    line-height: 1;
    color: rgba(255, 255, 255, 0.42);
    margin-left: 1px;
  }
  .tf-more.active .tf-more-arrow,
  .tf-more.open .tf-more-arrow { color: inherit; }

  .tf-more-menu {
    position: absolute;
    top: calc(100% + 1px);
    left: 0;
    z-index: 100;
    min-width: 80px;
    background: var(--g2, #111111);
    border: 1px solid var(--g4, rgba(255,255,255,0.08));
    border-radius: var(--term-radius-md, 10px);
    box-shadow: var(--term-shadow-float, 0 12px 32px rgba(0,0,0,0.35));
    padding: 3px;
    display: flex;
    flex-direction: column;
    gap: 1px;
  }
  .tf-more-item {
    height: 24px;
    padding: 0 9px;
    background: transparent;
    border: none;
    border-radius: var(--term-radius-sm, 6px);
    color: rgba(255, 255, 255, 0.72);
    font-family: var(--fm, 'JetBrains Mono', monospace);
    font-size: var(--ui-text-xs, 11px);
    font-weight: 600;
    letter-spacing: 0.02em;
    text-align: left;
    cursor: pointer;
    transition: background 0.08s, color 0.08s;
  }
  .tf-more-item:hover {
    background: rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.95);
  }
  .tf-more-item.active {
    color: var(--brand, #4a9eff);
    background: color-mix(in srgb, var(--brand, #4a9eff) 12%, transparent);
  }

  /* Toolbar text labels — Space Grotesk */
  .tb-glyph {
    font-size: 11px;
    line-height: 1;
    font-style: italic;
    font-family: var(--fm, 'JetBrains Mono', monospace);
  }
  .tb-text {
    font-size: var(--ui-text-xs, 11px);
    font-family: var(--fb, 'Space Grotesk', sans-serif);
    letter-spacing: 0;
    text-transform: none;
  }

  /* Chart type dropdown */
  .tb-trigger.open,
  .tb-trigger:focus-visible {
    background: rgba(255, 255, 255, 0.07);
    color: rgba(255, 255, 255, 0.92);
    border-color: rgba(255, 255, 255, 0.22);
    outline: none;
  }
  .tb-label {
    font-size: var(--ui-text-xs, 11px);
    font-family: var(--fb, 'Space Grotesk', sans-serif);
    font-weight: 600;
    color: rgba(255, 255, 255, 0.88);
  }
  .tb-arrow {
    font-size: var(--ui-text-xs);
    color: rgba(255, 255, 255, 0.42);
  }

  /* W-0541 PR1-A: .tb-primary removed (CAP button moved out of toolbar). */

  /* W-0541 PR1-C: Export image button — neutral styling, distinct from selection family */
  .tb-export {
    margin-left: 2px;
    color: rgba(255, 255, 255, 0.62);
    border-color: rgba(255, 255, 255, 0.12);
  }
  .tb-export:hover {
    background: rgba(255, 255, 255, 0.06);
    color: rgba(255, 255, 255, 0.85);
    border-color: rgba(255, 255, 255, 0.22);
  }

  /* Chart type menu dropdown */
  .ct-wrap {
    position: relative;
    display: inline-flex;
    align-items: center;
  }
  .ct-menu {
    position: absolute;
    top: calc(100% + 3px);
    left: 0;
    z-index: 100;
    min-width: 140px;
    background: var(--g2, #111111);
    border: 1px solid var(--g4, rgba(255,255,255,0.08));
    border-radius: var(--term-radius-md, 10px);
    box-shadow: var(--term-shadow-float, 0 12px 32px rgba(0,0,0,0.35));
    padding: 4px;
    display: flex;
    flex-direction: column;
  }
  .ct-item {
    display: grid;
    grid-template-columns: 36px 1fr 12px;
    align-items: center;
    gap: 6px;
    padding: 5px 8px;
    background: transparent;
    border: none;
    border-radius: var(--term-radius-sm, 6px);
    color: rgba(255, 255, 255, 0.62);
    font-family: var(--fb, 'Space Grotesk', sans-serif);
    font-size: var(--ui-text-xs, 11px);
    text-align: left;
    cursor: pointer;
    transition: background 0.08s, color 0.08s;
  }
  .ct-item:hover {
    background: rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.95);
  }
  .ct-item.active { color: var(--brand, #4a9eff); }
  .ct-item-label {
    font-family: var(--fm, 'JetBrains Mono', monospace);
    font-weight: 700;
    font-size: var(--ui-text-xs, 11px);
  }
  .ct-item-full { font-size: var(--ui-text-xs, 11px); }
  .ct-item-check { color: var(--brand, #4a9eff); font-size: var(--ui-text-xs, 11px); }

  /* ── Overlays / Draw / Indicators ▾ combos ───────────────────────────── */
  .overlays-wrap,
  .indicators-wrap {
    position: relative;
    display: inline-flex;
    align-items: center;
  }
  .overlays-count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 16px;
    height: 16px;
    padding: 0 3px;
    background: var(--brand, #4a9eff);
    color: #0a0a0a;
    font-family: var(--fm, 'JetBrains Mono', monospace);
    font-size: 11px;
    font-weight: 700;
    border-radius: 999px;
    margin-left: 2px;
  }
  .overlays-menu {
    position: absolute;
    top: calc(100% + 3px);
    right: 0;
    z-index: 100;
    min-width: 200px;
    background: var(--g2, #111111);
    border: 1px solid var(--g4, rgba(255,255,255,0.08));
    border-radius: var(--term-radius-md, 10px);
    box-shadow: var(--term-shadow-float, 0 12px 32px rgba(0,0,0,0.35));
    padding: 4px;
    display: flex;
    flex-direction: column;
    gap: 1px;
  }
  .overlays-item {
    display: grid;
    grid-template-columns: 14px 1fr auto;
    align-items: center;
    gap: 8px;
    padding: 5px 8px;
    background: transparent;
    border: none;
    border-radius: var(--term-radius-sm, 6px);
    color: rgba(255, 255, 255, 0.72);
    font-family: var(--fb, 'Space Grotesk', sans-serif);
    font-size: var(--ui-text-xs, 11px);
    text-align: left;
    cursor: pointer;
    transition: background 0.08s, color 0.08s;
    white-space: nowrap;
  }
  .overlays-item:hover {
    background: rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.95);
  }
  .overlays-item.active { color: var(--brand, #4a9eff); }
  .overlays-check {
    font-size: 11px;
    color: var(--brand, #4a9eff);
    text-align: center;
  }
  .overlays-label { font-weight: 500; }
  .overlays-short {
    font-family: var(--fm, 'JetBrains Mono', monospace);
    font-size: 11px;
    color: rgba(255, 255, 255, 0.42);
    letter-spacing: 0.04em;
  }
  .overlays-item.active .overlays-short { color: color-mix(in srgb, var(--brand, #4a9eff) 70%, transparent); }

  /* Pane-limit reached → row dims and stops responding. Keeps the option
     visible (so the user can see why they can't add another) instead of
     hiding it from the menu. */
  .overlays-item:disabled,
  .overlays-item.disabled {
    opacity: 0.32;
    cursor: not-allowed;
  }
  .overlays-item:disabled:hover,
  .overlays-item.disabled:hover {
    background: transparent;
    color: rgba(255, 255, 255, 0.72);
  }

  /* Indicators ▾ uses a wider menu (full names like "Bollinger Bands" don't
     fit the 200px overlays width without truncating). Section label tells
     the user which slot the indicator competes for. */
  .overlays-menu.wide { min-width: 240px; }
  .menu-section-label {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 8px 3px;
    font-family: var(--fb, 'Space Grotesk', sans-serif);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.38);
  }
  .menu-section-label:not(:first-child) {
    margin-top: 4px;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    padding-top: 8px;
  }
  .menu-section-hint {
    font-family: var(--fm, 'JetBrains Mono', monospace);
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0;
    text-transform: none;
    color: rgba(255, 255, 255, 0.32);
  }
  .menu-footer {
    margin-top: 4px;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    padding-top: 8px;
    color: rgba(255, 255, 255, 0.52);
  }
  .menu-footer .overlays-label { font-style: italic; }

  @media (max-width: 600px) {
    .tb-text { display: none; }
    .sym-price, .sym-change { display: none; }
    .overlays-wrap .tb-text { display: inline; } /* keep label even on narrow */
  }
  @media (max-width: 480px) {
    .tf-strip { display: none; }
  }
</style>
