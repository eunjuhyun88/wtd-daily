<script lang="ts">
  interface Props {
    currentSymbol: string;
    onSelect: (sym: string) => void;
    onClose: () => void;
  }

  const { currentSymbol, onSelect, onClose }: Props = $props();

  interface SymbolEntry { symbol: string; base: string; }
  const POPULAR_SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT', 'DOGEUSDT'];

  let query = $state('');
  let results = $state<SymbolEntry[]>([]);
  let loading = $state(false);
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let inputEl: HTMLInputElement | undefined = $state();

  $effect(() => { inputEl?.focus(); });

  // Debounced fetch on query change
  $effect(() => {
    const q = query;
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => fetchSymbols(q), 250);
  });

  async function fetchSymbols(q: string) {
    loading = true;
    try {
      const url = q.trim()
        ? `/api/market/symbols?q=${encodeURIComponent(q.trim())}&limit=100`
        : `/api/market/symbols?limit=100`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json() as { symbols: SymbolEntry[] };
        results = data.symbols;
      }
    } catch {
      // leave results as-is on network error
    } finally {
      loading = false;
    }
  }

  // Initial load on mount
  $effect(() => { fetchSymbols(''); });

  function pick(sym: string) {
    onSelect(sym);
    onClose();
  }

  function pickPopular(sym: string) {
    query = '';
    pick(sym);
  }

  function onBackdropClick(e: MouseEvent) {
    if ((e.target as HTMLElement).classList.contains('sps-backdrop')) onClose();
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="sps-backdrop" onclick={onBackdropClick}>
  <div class="sps-sheet">
    <div class="sps-handle-bar"><div class="sps-handle"></div></div>
    <div class="sps-search">
      <span class="sps-icon">⌕</span>
      <input
        bind:this={inputEl}
        bind:value={query}
        class="sps-input"
        placeholder="Search symbol (e.g. BTC, SOL, INJ)"
        autocomplete="off"
        autocorrect="off"
        autocapitalize="characters"
        spellcheck={false}
      />
      {#if loading}
        <span class="sps-spinner"></span>
      {:else if query}
        <button class="sps-clear" onclick={() => (query = '')}>×</button>
      {/if}
    </div>
    <div class="sps-section">
      <div class="sps-section-head">
        <span>Popular</span>
      </div>
      <div class="sps-popular">
        {#each POPULAR_SYMBOLS as sym (sym)}
          <button
            class="sps-chip"
            class:active={sym === currentSymbol}
            onclick={() => pickPopular(sym)}
          >{sym.replace('USDT', '')}</button>
        {/each}
      </div>
    </div>
    <div class="sps-section">
      <div class="sps-section-head">
        <span>{query ? 'Search Results' : 'All Perps'}</span>
        <span class="sps-count">{results.length}</span>
      </div>
    </div>
    <div class="sps-list">
      {#each results as entry (entry.symbol)}
        <button
          class="sps-row"
          class:active={entry.symbol === currentSymbol}
          onclick={() => pick(entry.symbol)}
        >
          <span class="sps-base">{entry.base}</span>
          <span class="sps-quote">/ USDT</span>
          {#if entry.symbol === currentSymbol}
            <span class="sps-check">✓</span>
          {/if}
        </button>
      {/each}
      {#if !loading && results.length === 0}
        <div class="sps-empty">No results</div>
      {/if}
    </div>
  </div>
</div>

<style>
  .sps-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.55);
    z-index: 300;
    display: flex;
    align-items: flex-end;
  }

  .sps-sheet {
    width: 100%;
    max-height: 82vh;
    background: var(--term-surface-1, var(--g1));
    border-top: 1px solid var(--term-border, var(--g4));
    border-radius: var(--term-radius-md, 10px) var(--term-radius-md, 10px) 0 0;
    display: flex;
    flex-direction: column;
    padding-bottom: env(safe-area-inset-bottom, 0px);
    animation: sheetUp 0.18s ease;
  }

  @keyframes sheetUp {
    from { transform: translateY(100%); }
    to   { transform: translateY(0); }
  }

  .sps-handle-bar {
    display: flex;
    justify-content: center;
    padding: 7px 0 3px;
    flex-shrink: 0;
  }

  .sps-handle {
    width: 36px;
    height: 4px;
    background: var(--term-border-strong, var(--g4));
    border-radius: 2px;
  }

  .sps-search {
    display: flex;
    align-items: center;
    gap: 6px;
    margin: 4px 10px 5px;
    padding: 0 9px;
    background: var(--term-surface-2, var(--g2));
    border: 1px solid var(--term-border, var(--g4));
    border-radius: var(--term-radius-sm, 6px);
    height: var(--term-rail-input-h, 28px);
    flex-shrink: 0;
  }

  .sps-icon {
    color: var(--g5);
    font-size: 14px;
    flex-shrink: 0;
  }

  .sps-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    color: var(--g9);
  }

  .sps-input::placeholder { color: var(--g5); }

  .sps-clear {
    color: var(--g5);
    font-size: 16px;
    background: transparent;
    border: none;
    line-height: 1;
    padding: 0 2px;
    cursor: pointer;
  }

  .sps-spinner {
    width: 12px;
    height: 12px;
    border: 1.5px solid var(--g4);
    border-top-color: var(--brand);
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
    flex-shrink: 0;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  .sps-list {
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    flex: 1;
    padding: 0 8px 8px;
  }

  .sps-section {
    flex-shrink: 0;
    padding: 0 10px;
  }

  .sps-section-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 18px;
    color: var(--term-text-2, var(--g5));
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .sps-count {
    color: var(--term-text-2, var(--g5));
    letter-spacing: 0.04em;
  }

  .sps-popular {
    display: flex;
    gap: 5px;
    overflow-x: auto;
    padding: 3px 0 7px;
    scrollbar-width: none;
  }

  .sps-popular::-webkit-scrollbar { display: none; }

  .sps-chip {
    height: 22px;
    flex: 0 0 auto;
    padding: 0 9px;
    border-radius: var(--term-radius-sm, 5px);
    border: 1px solid var(--term-border, var(--g4));
    background: var(--term-surface-2, var(--g2));
    color: var(--term-text-1, var(--g8));
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
  }

  .sps-chip.active {
    border-color: color-mix(in srgb, var(--brand) 45%, transparent);
    background: color-mix(in srgb, var(--brand) 10%, transparent);
    color: var(--term-text-0, var(--g9));
  }

  .sps-row {
    display: flex;
    align-items: center;
    gap: 5px;
    width: 100%;
    min-height: 30px;
    padding: 5px 8px;
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--term-radius-sm, 6px);
    cursor: pointer;
    text-align: left;
    transition: background 0.1s;
  }

  .sps-row:active,
  .sps-row.active {
    background: var(--term-surface-2, var(--g2));
    border-color: var(--term-border, var(--g4));
  }

  .sps-base {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    font-weight: 600;
    color: var(--g9);
    min-width: 48px;
  }

  .sps-quote {
    font-family: 'JetBrains Mono', monospace;
    font-size: var(--ui-text-xs);
    color: var(--g5);
  }

  .sps-check {
    margin-left: auto;
    color: var(--brand);
    font-size: 12px;
  }

  .sps-empty {
    padding: 20px 12px;
    font-size: 11px;
    color: var(--g5);
    text-align: center;
  }
</style>
