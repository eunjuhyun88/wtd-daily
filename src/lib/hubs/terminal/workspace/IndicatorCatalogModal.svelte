<script lang="ts">
  import { chartIndicators, toggleIndicator, MAX_PANE_INDICATORS } from '$lib/stores/chartIndicators';
  import { INDICATOR_CATALOG, CATALOG_CATEGORIES, type CatalogCategory } from '$lib/chart-engine/constants/indicatorCatalog';

  interface Props {
    open: boolean;
    onClose: () => void;
  }
  let { open, onClose }: Props = $props();

  let activeCategory = $state<CatalogCategory>('Overlay');

  const filteredEntries = $derived(
    INDICATOR_CATALOG.filter((e) => e.category === activeCategory)
  );

  const paneActiveCount = $derived(
    INDICATOR_CATALOG.reduce(
      (n, e) => n + (e.kind === 'pane' && $chartIndicators[e.key] ? 1 : 0), 0
    )
  );

  function isDisabled(entry: typeof INDICATOR_CATALOG[0]): boolean {
    if ($chartIndicators[entry.key]) return false;
    return entry.kind === 'pane' && paneActiveCount >= MAX_PANE_INDICATORS;
  }

  function handleBackdrop(e: MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }

  function handleKey(e: KeyboardEvent) {
    if (e.key === 'Escape') onClose();
  }
</script>

{#if open}
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div class="catalog-backdrop" role="dialog" aria-modal="true" aria-label="Indicator catalog" tabindex="-1"
    onmousedown={handleBackdrop}
    onkeydown={handleKey}
  >
    <div class="catalog-panel">
      <div class="catalog-header">
        <span class="catalog-title">Indicators</span>
        <button class="catalog-close" onclick={onClose} aria-label="Close">✕</button>
      </div>

      <div class="catalog-tabs" role="tablist">
        {#each CATALOG_CATEGORIES as cat}
          <button
            class="catalog-tab"
            class:active={activeCategory === cat}
            role="tab"
            aria-selected={activeCategory === cat}
            onclick={() => (activeCategory = cat)}
          >{cat}</button>
        {/each}
      </div>

      <div class="catalog-list" role="tabpanel">
        {#each filteredEntries as entry (entry.key)}
          {@const active = $chartIndicators[entry.key]}
          {@const disabled = isDisabled(entry)}
          <button
            class="catalog-entry"
            class:active
            class:disabled
            onclick={() => { if (!disabled) toggleIndicator(entry.key); }}
            {disabled}
            aria-pressed={active}
            title={disabled ? `Pane limit reached (${MAX_PANE_INDICATORS})` : undefined}
          >
            <span class="entry-check" aria-hidden="true">{active ? '✓' : ' '}</span>
            <div class="entry-info">
              <span class="entry-label">{entry.label}</span>
              <span class="entry-desc">{entry.description}</span>
            </div>
            <span class="entry-kind">{entry.kind}</span>
          </button>
        {/each}
        {#if filteredEntries.length === 0}
          <span class="catalog-empty">No indicators in this category</span>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .catalog-backdrop {
    position: fixed;
    inset: 0;
    z-index: 500;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    background: rgba(0, 0, 0, 0);
    animation: backdrop-in 0.2s forwards;
  }
  @keyframes backdrop-in {
    to { background: rgba(0, 0, 0, 0.4); }
  }

  .catalog-panel {
    width: 360px;
    max-width: 100vw;
    max-height: 60vh;
    display: flex;
    flex-direction: column;
    background: var(--g2, #111111);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px 12px 0 0;
    box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.4);
    animation: panel-in 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    transform: translateY(100%);
  }
  @keyframes panel-in {
    to { transform: translateY(0); }
  }

  .catalog-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px 8px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }
  .catalog-title {
    font-family: var(--fb, 'Space Grotesk', sans-serif);
    font-size: 13px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.88);
  }
  .catalog-close {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.42);
    font-size: 12px;
    cursor: pointer;
    border-radius: 4px;
    transition: color 0.1s, background 0.1s;
  }
  .catalog-close:hover { color: rgba(255,255,255,0.8); background: rgba(255,255,255,0.06); }

  .catalog-tabs {
    display: flex;
    gap: 2px;
    padding: 6px 8px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    overflow-x: auto;
    scrollbar-width: none;
  }
  .catalog-tabs::-webkit-scrollbar { display: none; }

  .catalog-tab {
    flex: 0 0 auto;
    height: 24px;
    padding: 0 10px;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 5px;
    color: rgba(255, 255, 255, 0.45);
    font-family: var(--fb, 'Space Grotesk', sans-serif);
    font-size: 11px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.1s;
  }
  .catalog-tab:hover { color: rgba(255,255,255,0.78); background: rgba(255,255,255,0.04); }
  .catalog-tab.active {
    color: rgba(255,255,255,0.92);
    border-color: rgba(255,255,255,0.15);
    background: rgba(255,255,255,0.06);
  }

  .catalog-list {
    flex: 1;
    overflow-y: auto;
    padding: 4px;
  }

  .catalog-entry {
    display: grid;
    grid-template-columns: 20px 1fr auto;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 8px 12px;
    background: transparent;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    text-align: left;
    transition: background 0.08s;
  }
  .catalog-entry:hover:not(:disabled) { background: rgba(255,255,255,0.05); }
  .catalog-entry.active { background: rgba(249,216,194,0.06); }
  .catalog-entry.disabled { opacity: 0.3; cursor: default; }

  .entry-check {
    font-size: 11px;
    color: var(--candle-up, #adca7c);
    font-family: var(--fm, 'JetBrains Mono', monospace);
    width: 12px;
  }
  .entry-info {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }
  .entry-label {
    font-family: var(--fb, 'Space Grotesk', sans-serif);
    font-size: 12px;
    font-weight: 600;
    color: rgba(255,255,255,0.88);
  }
  .entry-desc {
    font-size: 11px;
    color: rgba(255,255,255,0.38);
  }
  .entry-kind {
    font-family: var(--fm, 'JetBrains Mono', monospace);
    font-size: 11px;
    letter-spacing: 0.08em;
    color: rgba(255,255,255,0.25);
    text-transform: uppercase;
  }

  .catalog-empty {
    display: block;
    padding: 16px;
    text-align: center;
    font-size: 11px;
    color: rgba(255,255,255,0.28);
  }
</style>
