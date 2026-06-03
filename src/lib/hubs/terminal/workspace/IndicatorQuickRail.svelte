<script lang="ts">
  import {
    chartIndicators,
    toggleIndicator,
    MAX_PANE_INDICATORS,
    type IndicatorKey,
  } from '$lib/stores/chartIndicators';
  import IndicatorCatalogModal from './IndicatorCatalogModal.svelte';
  import { trackChartIndicatorToggled } from '../telemetry';

  type IndicatorChip = {
    key: IndicatorKey;
    label: string;
    kind: 'overlay' | 'pane';
  };

  interface Props {
    compact?: boolean;
  }

  let { compact = false }: Props = $props();

  const QUICK_RAIL_CHIPS: IndicatorChip[] = [
    { key: 'ema', label: 'EMA', kind: 'overlay' },
    { key: 'bb', label: 'BOLL', kind: 'overlay' },
    { key: 'vwap', label: 'VWAP', kind: 'overlay' },
    { key: 'vwma', label: 'VWMA', kind: 'overlay' },
    { key: 'atr_bands', label: 'ATR', kind: 'overlay' },
    { key: 'volumeProfile', label: 'VP', kind: 'overlay' },
    { key: 'comparison', label: 'BTC', kind: 'overlay' },
    { key: 'volume', label: 'VOL', kind: 'pane' },
    { key: 'macd', label: 'MACD', kind: 'pane' },
    { key: 'rsi', label: 'RSI', kind: 'pane' },
    { key: 'oi', label: 'OI', kind: 'pane' },
    { key: 'cvd', label: 'CVD', kind: 'pane' },
    { key: 'funding', label: 'FUND', kind: 'pane' },
    { key: 'liq', label: 'LIQ', kind: 'pane' },
    { key: 'obv', label: 'OBV', kind: 'pane' },
  ];

  const overlayChips = QUICK_RAIL_CHIPS.filter((chip) => chip.kind === 'overlay');
  const paneChips = QUICK_RAIL_CHIPS.filter((chip) => chip.kind === 'pane');

  const paneActiveCount = $derived(
    QUICK_RAIL_CHIPS.reduce(
      (count, chip) => count + (chip.kind === 'pane' && $chartIndicators[chip.key] ? 1 : 0),
      0,
    ),
  );

  function paneDisabled(chip: IndicatorChip): boolean {
    if (chip.kind !== 'pane') return false;
    if ($chartIndicators[chip.key]) return false;
    return paneActiveCount >= MAX_PANE_INDICATORS;
  }

  function toggleChip(chip: IndicatorChip) {
    if (paneDisabled(chip)) return;
    trackChartIndicatorToggled({
      indicator_key: chip.key,
      action: $chartIndicators[chip.key] ? 'off' : 'on',
      source: 'quick_rail',
    });
    toggleIndicator(chip.key);
  }

  import { trackChartCatalogOpen } from '../telemetry';

  let catalogOpen = $state(false);

  function openCatalog() {
    const activeCount = QUICK_RAIL_CHIPS.reduce((n, c) => n + ($chartIndicators[c.key] ? 1 : 0), 0);
    trackChartCatalogOpen({ trigger: 'plus_button', indicator_count_before: activeCount });
    catalogOpen = true;
  }
</script>

<div class="indicator-quick-rail" class:is-compact={compact} aria-label="Chart indicators">
  <!-- Row 1: Overlay chips -->
  <div class="indicator-row">
    <span class="row-label">OVL</span>
    <div class="indicator-quick-scroll">
      <div class="chip-group" aria-label="Overlay indicators">
        {#each overlayChips as chip (chip.key)}
          <button
            class="indicator-quick-chip"
            class:is-active={$chartIndicators[chip.key]}
            onclick={() => toggleChip(chip)}
            aria-pressed={$chartIndicators[chip.key]}
            title={chip.label}
          >
            <span class="chip-label">{chip.label}</span>
          </button>
        {/each}
      </div>
    </div>
    <button
      class="catalog-add-btn"
      onclick={openCatalog}
      title="Add indicator"
      aria-label="Open indicator catalog"
    >+</button>
  </div>

  <!-- Row 2: Pane chips -->
  <div class="indicator-row">
    <span class="row-label">PNL</span>
    <div class="indicator-quick-scroll">
      <div class="chip-group" aria-label="Panel indicators">
        {#each paneChips as chip (chip.key)}
          <button
            class="indicator-quick-chip"
            class:is-active={$chartIndicators[chip.key]}
            class:is-disabled={paneDisabled(chip)}
            onclick={() => toggleChip(chip)}
            disabled={paneDisabled(chip)}
            aria-pressed={$chartIndicators[chip.key]}
            title={paneDisabled(chip) ? `Pane limit reached (${MAX_PANE_INDICATORS})` : `${chip.label} panel`}
          >
            <span class="chip-label">{chip.label}</span>
          </button>
        {/each}
      </div>
    </div>
    <span class="catalog-add-spacer"></span>
  </div>
</div>

<IndicatorCatalogModal open={catalogOpen} onClose={() => (catalogOpen = false)} />

<style>
  .indicator-quick-rail {
    flex: 0 0 auto;
    border-top: 1px solid var(--term-border, rgba(255,255,255,0.08));
    border-bottom: 1px solid var(--term-border, rgba(255,255,255,0.08));
    background: var(--term-surface-0, var(--g0, #131722));
    overflow: hidden;
    opacity: 0.72;
    transition: opacity 0.14s ease, border-color 0.14s ease, background 0.14s ease;
  }

  .indicator-quick-rail:hover,
  .indicator-quick-rail:focus-within {
    opacity: 1;
    border-color: color-mix(in srgb, var(--term-border, rgba(255,255,255,0.12)) 70%, rgba(249,216,194,0.28));
  }

  .indicator-row {
    display: flex;
    align-items: center;
    min-height: 22px;
  }
  .indicator-row + .indicator-row {
    border-top: 1px solid rgba(255,255,255,0.05);
  }

  .row-label {
    flex: 0 0 30px;
    font-family: var(--sc-font-mono, 'JetBrains Mono', monospace);
    font-size: 11px;
    letter-spacing: 0.1em;
    color: rgba(255,255,255,0.28);
    text-align: center;
    user-select: none;
  }

  .indicator-quick-scroll {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 2px 4px;
    overflow-x: auto;
    overflow-y: hidden;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }

  .indicator-quick-scroll::-webkit-scrollbar {
    display: none;
  }

  .chip-group {
    display: inline-flex;
    align-items: center;
    gap: 3px;
  }

  .indicator-quick-chip {
    flex: 0 0 auto;
    height: 20px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 0 7px;
    border-radius: 5px;
    border: 1px solid transparent;
    background: transparent;
    color: rgba(247,242,234,0.56);
    font-family: var(--sc-font-mono, 'JetBrains Mono', monospace);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    white-space: nowrap;
    transition: border-color 0.12s ease, background 0.12s ease, color 0.12s ease, opacity 0.12s ease, transform 0.12s ease;
  }

  .indicator-quick-chip:hover:not(:disabled) {
    color: rgba(255,248,242,0.86);
    background: rgba(255,255,255,0.03);
  }

  .indicator-quick-chip:active {
    transform: translateY(1px);
  }

  .indicator-quick-chip.is-active {
    border-color: rgba(219,154,159,0.3);
    background: rgba(219,154,159,0.1);
    color: rgba(255,248,242,0.96);
    box-shadow: inset 0 0 0 1px rgba(219,154,159,0.1);
  }

  .indicator-quick-chip.is-disabled {
    opacity: 0.28;
  }

  .indicator-quick-chip:disabled {
    cursor: default;
  }

  .chip-label {
    line-height: 1;
  }

  .catalog-add-btn {
    flex: 0 0 28px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    border-left: 1px solid rgba(255,255,255,0.06);
    color: rgba(255,255,255,0.38);
    font-size: 16px;
    font-weight: 300;
    cursor: pointer;
    transition: color 0.1s, background 0.1s;
  }
  .catalog-add-btn:hover {
    color: rgba(255,255,255,0.78);
    background: rgba(255,255,255,0.04);
  }

  .catalog-add-spacer {
    flex: 0 0 28px;
  }

  /* compact mode */
  .indicator-quick-rail.is-compact .indicator-row {
    min-height: 18px;
  }
  .indicator-quick-rail.is-compact .indicator-quick-scroll {
    gap: 2px;
    padding: 1px 4px;
  }
  .indicator-quick-rail.is-compact .chip-group {
    gap: 2px;
  }
  .indicator-quick-rail.is-compact .indicator-quick-chip {
    height: 18px;
    padding: 0 6px;
    font-size: 11px;
    letter-spacing: 0.1em;
  }
  .indicator-quick-rail.is-compact .catalog-add-btn {
    height: 18px;
  }
</style>
