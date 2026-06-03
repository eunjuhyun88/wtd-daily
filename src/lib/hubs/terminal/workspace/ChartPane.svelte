<script lang="ts">
  /**
   * ChartPane — Single pane in the multi-chart grid.
   *
   * Each pane owns its own symbol + timeframe state and renders a
   * full ChartBoard inside.  Clicking the pane marks it as active;
   * the active pane gets a blue border (TradingView style).
   *
   * Symbol change: user clicks the symbol badge in the pane header →
   * an inline input appears for a quick search.
   */
  import type { Component } from 'svelte';
  import { setActivePane } from '$lib/stores/paneIndicators';

  // Compact TF options surfaced in the pane header when multi-pane (closeable=true).
  const PANE_TF_CHIPS: Array<{ id: string; label: string }> = [
    { id: '1m',  label: '1m' },
    { id: '5m',  label: '5m' },
    { id: '15m', label: '15' },
    { id: '1h',  label: '1H' },
    { id: '4h',  label: '4H' },
    { id: '1d',  label: 'D' },
  ];

  // Defer ChartBoard so the multi-pane grid shell can paint without
  // pulling lightweight-charts (~196KB) on the static graph.
  let ChartBoardComp = $state<Component | null>(null);
  $effect.pre(() => {
    if (ChartBoardComp) return;
    void import('./ChartBoard.svelte').then((m) => { ChartBoardComp = m.default as unknown as Component; });
  });

  interface Props {
    /** Initial / controlled symbol */
    symbol: string;
    /** Initial / controlled timeframe */
    tf: string;
    /** Unique pane ID for per-pane indicator isolation (W-0304) */
    paneId?: number;
    /** Whether this pane is the active (focused) pane */
    active?: boolean;
    /** Whether the close button is visible (hidden when only 1 pane) */
    closeable?: boolean;
    /** Propagate symbol change upward */
    onSymbolChange?: (sym: string) => void;
    /** Propagate tf change upward */
    onTfChange?: (tf: string) => void;
    /** Activate this pane */
    onActivate?: () => void;
    /** Remove this pane from the grid */
    onClose?: () => void;
    /** contextMode forwarded to ChartBoard */
    contextMode?: 'full' | 'chart';
    /** surfaceStyle forwarded to ChartBoard */
    surfaceStyle?: 'default' | 'velo';
  }

  let {
    symbol: initialSymbol,
    tf: initialTf,
    paneId = 0,
    active = false,
    closeable = true,
    onSymbolChange,
    onTfChange,
    onActivate,
    onClose,
    contextMode = 'chart',
    surfaceStyle = 'velo',
  }: Props = $props();

  // ── Per-pane state ──────────────────────────────────────────────────────────
  let symbol = $state('');
  let tf     = $state('');

  // Inline symbol editor
  let editing = $state(false);
  let editVal = $state('');
  let inputEl: HTMLInputElement | undefined = $state();

  $effect(() => { symbol = initialSymbol; });
  $effect(() => { tf     = initialTf; });

  function startEdit() {
    if (!active) {
      setActivePane(paneId);
      onActivate?.();
    }
    editVal = symbol;
    editing = true;
  }

  $effect(() => {
    if (editing && inputEl) {
      inputEl.focus();
      inputEl.select();
    }
  });

  function commitEdit() {
    const trimmed = editVal.trim().toUpperCase();
    if (trimmed && trimmed !== symbol) {
      symbol = trimmed;
      onSymbolChange?.(trimmed);
    }
    editing = false;
  }

  function cancelEdit() {
    editing = false;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter')  commitEdit();
    if (e.key === 'Escape') cancelEdit();
  }

  function handlePaneClick() {
    if (!active) {
      setActivePane(paneId);
      onActivate?.();
    }
  }
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
  class="chart-pane"
  class:active
  role="region"
  aria-label="Chart pane"
  onclick={handlePaneClick}
  onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') handlePaneClick(); }}
>
  <!-- Pane header: symbol badge + tf badge + close button -->
  <div class="pane-header" role="toolbar" aria-label="Chart pane controls">
    {#if editing}
      <input
        bind:this={inputEl}
        bind:value={editVal}
        class="sym-input"
        type="text"
        placeholder="BTCUSDT"
        onblur={commitEdit}
        onkeydown={handleKeydown}
        aria-label="Edit symbol"
      />
    {:else}
      <button class="sym-badge" onclick={startEdit} aria-label="Change symbol: {symbol}">
        {symbol}
      </button>
    {/if}

    <!-- TF selector: clickable chips in multi-pane, static badge in single-pane -->
    {#if closeable}
      <div class="pane-tf-strip" role="group" aria-label="Timeframe">
        {#each PANE_TF_CHIPS as t (t.id)}
          <button
            class="pane-tf-chip"
            class:active={tf === t.id}
            onclick={(e) => {
              e.stopPropagation();
              if (!active) { setActivePane(paneId); onActivate?.(); }
              tf = t.id;
              onTfChange?.(t.id);
            }}
            title={t.id}
            aria-pressed={tf === t.id}
          >{t.label}</button>
        {/each}
        {#if !PANE_TF_CHIPS.some(t => t.id === tf)}
          <span class="pane-tf-current">{tf}</span>
        {/if}
      </div>
    {:else}
      <span class="tf-badge">{tf}</span>
    {/if}

    {#if closeable}
      <button
        class="close-btn"
        onclick={(e) => { e.stopPropagation(); onClose?.(); }}
        aria-label="Close pane"
      >
        ✕
      </button>
    {/if}
  </div>

  <!-- Inactive overlay — captures clicks on the chart canvas to activate the pane.
       Removed once the pane is active so the chart regains full interactivity. -->
  {#if !active}
    <button class="activate-overlay" onclick={handlePaneClick} aria-label="Activate pane" tabindex="-1"></button>
  {/if}

  <!-- Chart body -->
  <div class="pane-body">
    {#if ChartBoardComp}
      <ChartBoardComp
        {symbol}
        tf={tf}
        {paneId}
        {contextMode}
        {surfaceStyle}
        onTfChange={(newTf: string) => { tf = newTf; onTfChange?.(newTf); }}
      />
    {:else}
      <div class="chart-loading-skeleton" aria-busy="true" aria-label="차트 로딩 중"></div>
    {/if}
  </div>
</div>

<style>
  .chart-pane {
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
    position: relative;
    background: #0d1117;
    border: 1.5px solid transparent;
    border-radius: 4px;
    overflow: hidden;
    cursor: default;
    transition: border-color 0.15s;
  }

  .chart-pane.active {
    border-color: #2563eb;   /* TradingView blue */
  }

  /* ── Pane header ── */
  .pane-header {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 3px 6px;
    background: rgba(255, 255, 255, 0.03);
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    height: 28px;
    flex-shrink: 0;
    position: relative;
    z-index: 20;
  }

  /* Activation overlay — sits above the chart canvas, below the header.
     Disappears once the pane is active so chart interactions resume. */
  .activate-overlay {
    position: absolute;
    top: 28px;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 10;
    background: transparent;
    border: none;
    cursor: pointer;
  }

  .sym-badge {
    font-size: 11px;
    font-weight: 700;
    color: #e2e8f0;
    letter-spacing: 0.04em;
    background: none;
    border: none;
    cursor: pointer;
    padding: 2px 4px;
    border-radius: 3px;
    transition: background 0.1s;
    font-family: inherit;
  }

  .sym-badge:hover {
    background: rgba(255, 255, 255, 0.08);
  }

  .tf-badge {
    font-size: var(--ui-text-xs);
    color: rgba(255, 255, 255, 0.4);
    padding: 1px 4px;
    border-radius: 3px;
    background: rgba(255, 255, 255, 0.05);
  }

  /* ── Per-pane TF strip (multi-pane mode) ── */
  .pane-tf-strip {
    display: flex;
    align-items: stretch;
    gap: 0;
    height: 22px;
    margin-left: 2px;
  }
  .pane-tf-chip {
    height: 22px;
    padding: 0 5px;
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    color: rgba(255, 255, 255, 0.38);
    font-family: var(--fm, 'JetBrains Mono', monospace);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.02em;
    cursor: pointer;
    transition: color 0.1s, border-color 0.1s;
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
  }
  .pane-tf-chip:hover {
    color: rgba(255, 255, 255, 0.82);
  }
  .pane-tf-chip.active {
    color: var(--brand, #db9a9f);
    border-bottom-color: var(--brand, #db9a9f);
  }
  .pane-tf-current {
    font-family: var(--fm, 'JetBrains Mono', monospace);
    font-size: 11px;
    font-weight: 600;
    color: var(--brand, #db9a9f);
    padding: 0 4px;
    align-self: center;
  }

  .sym-input {
    font-size: 11px;
    font-weight: 700;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #e2e8f0;
    border-radius: 3px;
    padding: 2px 6px;
    width: 100px;
    outline: none;
    font-family: inherit;
    letter-spacing: 0.04em;
  }

  .close-btn {
    margin-left: auto;
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.2);
    cursor: pointer;
    font-size: var(--ui-text-xs);
    padding: 2px 4px;
    border-radius: 3px;
    line-height: 1;
    transition: color 0.1s, background 0.1s;
  }

  .close-btn:hover {
    color: rgba(255, 255, 255, 0.7);
    background: rgba(255, 255, 255, 0.08);
  }

  /* ── Pane body fills remaining space ── */
  .pane-body {
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }
  .chart-loading-skeleton {
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 100%);
    background-size: 200% 100%;
    animation: chart-skeleton-shimmer 1.4s ease-in-out infinite;
  }
  @keyframes chart-skeleton-shimmer {
    0% { background-position: 100% 0; }
    100% { background-position: -100% 0; }
  }
</style>
