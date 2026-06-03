<script lang="ts">
  /**
   * WatchlistRail — TV-style left rail
   * - Top: user-configurable symbol list (add/delete, max 20, localStorage)
   * - Fold/unfold toggle (‹/›)
   * - Real-time price feed: Binance miniTicker WebSocket ~1s
   * - Bottom: "내 패턴" section sourced from /api/patterns/terminal
   */
  import { onMount } from 'svelte';
  import { subscribeMiniTicker, type MiniTickerUpdate } from '$lib/api/binance';
  import WatchlistHeader from './WatchlistHeader.svelte';
  import WatchlistItem from './WatchlistItem.svelte';
  import { traderProfile } from '$lib/stores/traderProfile';

  const STORAGE_KEY     = 'cogochi:watchlist:v1';
  const FAVS_KEY        = 'cogochi:watchlist:favs:v1';
  const PREFS_KEY       = 'cogochi:watchlist:prefs:v1';
  const DEFAULT_SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT', 'AVAXUSDT', 'DOGEUSDT'];
  const MAX_SYMBOLS     = 20;

  type WatchFilter = 'all' | 'favs';
  type ViewMode    = 'cards' | 'table';
  type SortBy      = 'symbol' | 'price' | 'change' | 'fr';
  type SortDir     = 'asc' | 'desc';

  /** Persisted UI prefs — view mode and sort. Stored together so we don't
   *  fan out one localStorage key per knob. */
  interface RailPrefs {
    viewMode?: ViewMode;
    sortBy?: SortBy;
    sortDir?: SortDir;
  }
  function loadPrefs(): RailPrefs {
    if (typeof localStorage === 'undefined') return {};
    try {
      const raw = localStorage.getItem(PREFS_KEY);
      if (raw) return JSON.parse(raw) as RailPrefs;
    } catch {}
    return {};
  }
  function savePrefs(p: RailPrefs) {
    try { localStorage.setItem(PREFS_KEY, JSON.stringify(p)); } catch {}
  }

  interface SymbolEntry { symbol: string; base: string; }
  interface Props {
    activeSymbol?: string;
    onSelectSymbol?: (symbol: string) => void;
    onNewTab?: (symbol: string) => void;
    /** Optional — when wired, surfaces a ⤢ chip in the filter strip that
     *  pops the rail out as a floating panel. Caller owns the floatingPanels
     *  store interaction so the rail stays presentational. */
    onFloat?: () => void;
  }

  let { activeSymbol = 'BTCUSDT', onSelectSymbol, onNewTab, onFloat }: Props = $props();

  function loadFavs(): Set<string> {
    if (typeof localStorage === 'undefined') return new Set();
    try {
      const raw = localStorage.getItem(FAVS_KEY);
      if (raw) return new Set(JSON.parse(raw) as string[]);
    } catch {}
    return new Set();
  }
  function saveFavs(f: Set<string>) {
    try { localStorage.setItem(FAVS_KEY, JSON.stringify([...f])); } catch {}
  }

  let favs: Set<string> = $state(loadFavs());
  let watchFilter = $state<WatchFilter>('all');

  // View prefs (compact mode + sort) — persisted
  const _initialPrefs = loadPrefs();
  let viewMode = $state<ViewMode>(_initialPrefs.viewMode ?? 'table');
  let sortBy   = $state<SortBy>(_initialPrefs.sortBy ?? 'change');
  let sortDir  = $state<SortDir>(_initialPrefs.sortDir ?? 'desc');

  $effect(() => {
    savePrefs({ viewMode, sortBy, sortDir });
  });

  function toggleViewMode() {
    viewMode = viewMode === 'cards' ? 'table' : 'cards';
  }
  function setSort(by: SortBy) {
    if (sortBy === by) {
      sortDir = sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      sortBy = by;
      // Sensible defaults: symbol asc (alphabetical), numeric desc (largest first)
      sortDir = by === 'symbol' ? 'asc' : 'desc';
    }
  }

  function toggleFav(sym: string) {
    const next = new Set(favs);
    if (next.has(sym)) next.delete(sym); else next.add(sym);
    favs = next;
    saveFavs(next);
  }

  function loadSymbols(): string[] {
    if (typeof localStorage === 'undefined') return [...DEFAULT_SYMBOLS];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
        if (Array.isArray(parsed) && parsed.length > 0) return parsed as string[];
      }
    } catch {}
    return [...DEFAULT_SYMBOLS];
  }

  function saveSymbols(syms: string[]) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(syms)); } catch {}
  }

  let symbols   = $state<string[]>(loadSymbols());
  let ticks     = $state<Record<string, MiniTickerUpdate>>({});
  let sparkData = $state<Record<string, number[]>>({});
  let frMap     = $state<Record<string, number>>({});

  /** Visible-after-filter list. Pulled out so the sort step downstream
   *  doesn't duplicate the favs filter logic. */
  const visibleSymbols = $derived(
    watchFilter === 'favs' ? symbols.filter((s) => favs.has(s)) : symbols,
  );

  /** Sorted display order. Cards mode preserves the user-configured order
   *  (sortBy='symbol' + sortDir='asc' is the original behavior). Table
   *  mode is the primary surface where sort matters — clicking a header
   *  sets sortBy/sortDir and the rows reorder live. Sort by 'symbol' uses
   *  string compare (case-insensitive); numeric sorts treat undefined as
   *  -Infinity for desc and +Infinity for asc so no-data rows sink.
   *
   *  PERF: this $derived re-runs whenever ANY of ticks / frMap / visibleSymbols
   *  changes. We can't avoid that for sortBy='price' | 'change' | 'fr'
   *  (the sort key literally depends on those), but the symbol sort doesn't
   *  need ticks at all — we hoist that branch above the dependency reads so
   *  Svelte's tracker never wires it to the per-frame ticks update. Net
   *  effect: with sortBy='symbol' (the default in cards mode), the rail's
   *  displaySymbols stays cached as long as the user doesn't add/remove
   *  symbols or flip the favs filter, even while 20 symbols stream prices. */
  const displaySymbols = $derived.by<string[]>(() => {
    if (sortBy === 'symbol') {
      const list = [...visibleSymbols];
      const dir = sortDir === 'asc' ? 1 : -1;
      list.sort((a, b) => a.localeCompare(b) * dir);
      return list;
    }
    const list = [...visibleSymbols];
    const dir = sortDir === 'asc' ? 1 : -1;
    const fallback = sortDir === 'asc' ? Infinity : -Infinity;
    let keyOf: (sym: string) => number;
    switch (sortBy) {
      case 'price':  keyOf = (s) => ticks[s]?.price ?? fallback; break;
      case 'change': keyOf = (s) => ticks[s]?.change24h ?? fallback; break;
      case 'fr':     keyOf = (s) => frMap[s] ?? fallback; break;
      default:       keyOf = () => 0;
    }
    list.sort((a, b) => (keyOf(a) - keyOf(b)) * dir);
    return list;
  });
  let folded    = $state(
    typeof localStorage !== 'undefined' && localStorage.getItem('cogochi.watchlist.folded') === 'true'
  );
  let addOpen    = $state(false);
  let addInput   = $state('');
  let addError   = $state('');
  let focusedIdx = $state(-1);
  let marketQuery = $state('');
  let marketResults = $state<SymbolEntry[]>([]);
  let marketLoading = $state(false);
  let universeCollapsed = $state(true);
  let marketDebounce: ReturnType<typeof setTimeout> | null = null;

  // Persist fold state
  $effect(() => {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem('cogochi.watchlist.folded', String(folded));
    } catch {}
  });

  // Re-subscribe whenever symbols list changes.
  //
  // PERF (2026-05-11 sweep): Binance miniTicker emits one frame per symbol per
  // ~1s, and subscribeMiniTicker forwards each frame as its own batch of size
  // 1. The previous handler did `ticks = { ...ticks, ...updates }` *and* a
  // full sparkData spread on every single message — for a 20-symbol watchlist
  // that's ~20 full-object allocations/sec, every one of which invalidates
  // *all* WatchlistItem instances (object identity changed) plus the
  // displaySymbols sort derived. The cumulative reactive churn was the
  // dominant background load on the Terminal page and was visible as
  // jankiness when switching hubs from the AppNavRail (the main thread was
  // busy thrashing the watchlist when the user clicked away).
  //
  // Now we coalesce into a per-frame buffer and flush once per
  // requestAnimationFrame (~60Hz max, free-running with the compositor).
  // For the user this is indistinguishable from the old behaviour — Binance
  // messages arrive ~once per symbol per second anyway, so the buffer almost
  // always holds 1–3 entries when the rAF fires — but the React-style
  // bulk re-render now happens at most 60 times/sec instead of 200+, and
  // each flush mutates ticks/sparkData *exactly once* even when 20 symbols
  // ticked in the same frame.
  $effect(() => {
    if (typeof window === 'undefined' || symbols.length === 0) return;
    const syms = [...symbols];
    let buffer: Record<string, MiniTickerUpdate> = {};
    let rafId: number | null = null;

    const flush = () => {
      rafId = null;
      const pending = buffer;
      buffer = {};
      const keys = Object.keys(pending);
      if (keys.length === 0) return;
      // Single object replacement — Svelte 5 reactivity only fires for
      // ticks/sparkData, not per symbol. WatchlistItem still re-evaluates
      // tick prop equality, but the work is one batched pass per frame
      // rather than per WS frame.
      const nextTicks = { ...ticks };
      const nextSpark: Record<string, number[]> = { ...sparkData };
      for (const sym of keys) {
        const t = pending[sym];
        nextTicks[sym] = t;
        const prev = nextSpark[sym];
        // 7-point sparkline (slice(-6) + push). Allocate a new array only
        // for the entries that actually changed this frame, not for all 20.
        nextSpark[sym] = prev ? [...prev.slice(-6), t.price] : [t.price];
      }
      ticks = nextTicks;
      sparkData = nextSpark;
    };

    const unsub = subscribeMiniTicker(
      syms,
      () => {},
      (updates) => {
        for (const sym in updates) buffer[sym] = updates[sym];
        if (rafId === null) rafId = requestAnimationFrame(flush);
      },
    );

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      unsub();
    };
  });

  onMount(() => {
    // Keyboard nav events dispatched by TerminalHub
    const onNav = (e: Event) => {
      const dir = (e as CustomEvent<{ dir: 'up' | 'down' }>).detail.dir;
      if (symbols.length === 0) return;
      if (focusedIdx === -1) {
        focusedIdx = dir === 'down' ? 0 : symbols.length - 1;
      } else {
        focusedIdx = dir === 'down'
          ? Math.min(focusedIdx + 1, symbols.length - 1)
          : Math.max(focusedIdx - 1, 0);
      }
    };
    const onSelect = () => {
      if (focusedIdx >= 0 && focusedIdx < symbols.length) {
        onSelectSymbol?.(symbols[focusedIdx]);
        focusedIdx = -1;
      }
    };
    const onAdd = (e: Event) => {
      const sym = (e as CustomEvent<{ symbol: string }>).detail.symbol?.toUpperCase();
      if (!sym || symbols.includes(sym) || symbols.length >= MAX_SYMBOLS) return;
      if (!/^[A-Z]{2,10}USDT$/.test(sym)) return;
      symbols = [...symbols, sym];
      saveSymbols(symbols);
    };
    window.addEventListener('watchlist:nav', onNav);
    window.addEventListener('watchlist:select', onSelect);
    window.addEventListener('watchlist:add', onAdd);

    return () => {
      window.removeEventListener('watchlist:nav', onNav);
      window.removeEventListener('watchlist:select', onSelect);
      window.removeEventListener('watchlist:add', onAdd);
    };
  });

  // Batch-fetch latest funding rate for the entire watchlist in a single
  // request (60s poll). Replaces the previous N-fan-out which sent up to
  // 20 parallel /api/market/funding requests on every tick.
  $effect(() => {
    if (typeof window === 'undefined' || symbols.length === 0) return;
    const syms = [...symbols];

    async function loadFR() {
      try {
        const r = await fetch(
          `/api/market/funding?symbols=${encodeURIComponent(syms.join(','))}&limit=1`,
        );
        if (!r.ok) return;
        const d = (await r.json()) as {
          results?: Record<string, { bars?: { delta: number }[] }>;
        };
        const next: Record<string, number> = { ...frMap };
        for (const sym of syms) {
          const bars = d.results?.[sym]?.bars ?? [];
          if (bars.length > 0) next[sym] = bars[bars.length - 1].delta;
        }
        frMap = next;
      } catch { /* silent */ }
    }

    void loadFR();
    const t = setInterval(loadFR, 60_000);
    return () => clearInterval(t);
  });

  function pick(symbol: string) { onSelectSymbol?.(symbol); }

  function removeSymbol(sym: string) {
    symbols = symbols.filter(s => s !== sym);
    saveSymbols(symbols);
  }

  function addSymbol() {
    const sym = addInput.trim().toUpperCase();
    addError = '';
    if (!sym) return;
    if (symbols.includes(sym)) { addError = 'Already added'; return; }
    if (symbols.length >= MAX_SYMBOLS) { addError = `Max ${MAX_SYMBOLS}`; return; }
    if (!/^[A-Z]{2,10}USDT$/.test(sym)) { addError = 'USDT pairs only (e.g. BTCUSDT)'; return; }
    symbols = [...symbols, sym];
    saveSymbols(symbols);
    addInput = '';
    addOpen = false;
  }

  async function fetchMarketSymbols(q: string) {
    marketLoading = true;
    try {
      const trimmed = q.trim();
      const url = trimmed
        ? `/api/market/symbols?q=${encodeURIComponent(trimmed)}&limit=100`
        : `/api/market/symbols?limit=100`;
      const res = await fetch(url);
      if (!res.ok) return;
      const data = await res.json() as { symbols?: SymbolEntry[] };
      marketResults = data.symbols ?? [];
    } catch {
      // keep previous state on transient fetch failures
    } finally {
      marketLoading = false;
    }
  }

  $effect(() => {
    const q = marketQuery;
    universeCollapsed = q.trim().length === 0;
    if (marketDebounce) clearTimeout(marketDebounce);
    marketDebounce = setTimeout(() => { void fetchMarketSymbols(q); }, q.trim() ? 180 : 0);
    return () => {
      if (marketDebounce) clearTimeout(marketDebounce);
    };
  });

  function addOrSelectMarket(sym: string) {
    if (!symbols.includes(sym) && symbols.length < MAX_SYMBOLS && /^[A-Z]{2,10}USDT$/.test(sym)) {
      symbols = [...symbols, sym];
      saveSymbols(symbols);
    }
    onSelectSymbol?.(sym);
  }

  function onAddKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') addSymbol();
    if (e.key === 'Escape') { addOpen = false; addInput = ''; addError = ''; }
  }
</script>

<div class="rail" class:rail--folded={folded}>

  <!-- WATCHLIST header + add-symbol input -->
  <WatchlistHeader
    symbolCount={symbols.length}
    maxSymbols={MAX_SYMBOLS}
    {folded}
    {addOpen}
    bind:addInput
    {addError}
    onToggleFold={() => (folded = !folded)}
    onToggleAdd={() => { addOpen = !addOpen; addError = ''; }}
    onAddConfirm={addSymbol}
    onAddCancel={() => { addOpen = false; addInput = ''; addError = ''; }}
    {onAddKeydown}
  />

  <!-- Filter chips (all / favs) + view-mode toggle -->
  {#if !folded}
    <div class="filter-strip">
      <button
        class="chip"
        class:chip--active={watchFilter === 'all'}
        onclick={() => (watchFilter = 'all')}
      >All</button>
      <button
        class="chip"
        class:chip--active={watchFilter === 'favs'}
        onclick={() => (watchFilter = 'favs')}
      >SAVED{favs.size > 0 ? ` (${favs.size})` : ''}</button>
      <button
        class="chip view-toggle"
        class:chip--active={viewMode === 'table'}
        onclick={toggleViewMode}
        title={viewMode === 'table' ? 'Switch to card view' : 'Compact table — sortable by price / Δ / FR'}
        aria-label="Toggle compact table view"
        data-testid="watchlist-view-toggle"
      >{viewMode === 'table' ? 'LIST' : 'GRID'}</button>
      {#if onFloat}
        <button
          class="chip chip--icon"
          onclick={() => onFloat?.()}
          title="Pop out as floating panel — drag to reposition, click ⤡ to dock back"
          aria-label="Pop out watchlist as floating panel"
          data-testid="watchlist-float-toggle"
        >⤢</button>
      {/if}
    </div>

    {#if viewMode === 'table'}
      <!-- Sortable header — 3-col grid matches .symbol-row--exchange in WatchlistItem -->
      <div class="sort-header" role="row">
        <span class="sort-spacer" aria-hidden="true"></span>
        <div class="sort-col sort-col--left">
          <button class="sort-btn" class:sort-btn--active={sortBy === 'symbol'} onclick={() => setSort('symbol')}>
            NAME{#if sortBy === 'symbol'}<span class="sort-dir">{sortDir === 'asc' ? ' ↑' : ' ↓'}</span>{/if}
          </button>
          <button class="sort-btn sort-btn--sub" class:sort-btn--active={sortBy === 'change'} onclick={() => setSort('change')}>
            24H%{#if sortBy === 'change'}<span class="sort-dir">{sortDir === 'asc' ? ' ↑' : ' ↓'}</span>{/if}
          </button>
        </div>
        <div class="sort-col sort-col--right">
          <button class="sort-btn" class:sort-btn--active={sortBy === 'price'} onclick={() => setSort('price')}>
            PRICE{#if sortBy === 'price'}<span class="sort-dir">{sortDir === 'asc' ? ' ↑' : ' ↓'}</span>{/if}
          </button>
          <button class="sort-btn sort-btn--sub" class:sort-btn--active={sortBy === 'fr'} onclick={() => setSort('fr')}>
            FR{#if sortBy === 'fr'}<span class="sort-dir">{sortDir === 'asc' ? ' ↑' : ' ↓'}</span>{/if}
          </button>
        </div>
      </div>
    {/if}
  {/if}

  <!-- Symbol list — same component handles both view modes; the `compact`
       prop switches the row layout to a single dense line so 20 symbols
       fit without scroll. -->
  <ul class="symbol-list" class:symbol-list--table={viewMode === 'table' && !folded}>
    {#each displaySymbols as sym, i (sym)}
      <WatchlistItem
        {sym}
        tick={ticks[sym]}
        spark={sparkData[sym] ?? []}
        active={sym === activeSymbol}
        focused={i === focusedIdx}
        {folded}
        compact={viewMode === 'table' && !folded}
        fr={frMap[sym] ?? null}
        favorited={favs.has(sym)}
        onSelect={(s) => { focusedIdx = -1; pick(s); }}
        onRemove={removeSymbol}
        onToggleFav={toggleFav}
        {onNewTab}
        persona={$traderProfile.trader_style}
      />
    {/each}
  </ul>

  {#if !folded && displaySymbols.length === 0}
    {#if watchFilter === 'favs'}
      <div class="watch-empty">
        <div class="watch-empty-title">즐겨찾기가 비어있습니다</div>
        <div class="watch-empty-hint">심볼 행의 ★ 버튼을 눌러 추가해 보세요.</div>
      </div>
    {:else if symbols.length === 0}
      <div class="watch-empty">
        <div class="watch-empty-title">관심 목록이 비어있습니다</div>
        <div class="watch-empty-hint">아래 Market Universe에서 심볼을 찾아 추가하세요.</div>
      </div>
    {/if}
  {/if}

  {#if !folded}
    <div class="section-header">
      <button
        class="section-toggle"
        type="button"
        onclick={() => (universeCollapsed = !universeCollapsed)}
        title={universeCollapsed ? 'Expand market universe' : 'Collapse market universe'}
        aria-expanded={!universeCollapsed}
      >
        <span class="section-label">Market Universe</span>
        <span class="section-subcopy">search all perps</span>
      </button>
      <span class="section-actions">
        {#if marketLoading}
          <span class="section-count">…</span>
        {:else}
          <span class="section-count">scan {marketResults.length}</span>
        {/if}
        <button
          class="fold-btn"
          onclick={() => (universeCollapsed = !universeCollapsed)}
          title={universeCollapsed ? 'Expand market universe' : 'Collapse market universe'}
          aria-label={universeCollapsed ? 'Expand market universe' : 'Collapse market universe'}
        >{universeCollapsed ? '▶' : '▼'}</button>
      </span>
    </div>
    {#if !universeCollapsed}
      <div class="market-search">
        <span class="market-search-icon">⌕</span>
        <input
          bind:value={marketQuery}
          class="market-search-input"
          placeholder="Search all perps"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="characters"
          spellcheck={false}
        />
        {#if marketQuery}
          <button class="market-search-clear" onclick={() => (marketQuery = '')} aria-label="Clear symbol search">×</button>
        {/if}
      </div>
      <div class="market-list" aria-label="Market universe">
        {#each marketResults as entry (entry.symbol)}
          <button
            type="button"
            class="market-row"
            class:active={entry.symbol === activeSymbol}
            onclick={() => addOrSelectMarket(entry.symbol)}
            title={symbols.includes(entry.symbol) ? 'Select symbol' : 'Add to watchlist and select'}
          >
            <span class="market-base">{entry.base}</span>
            <span class="market-quote">/ USDT</span>
            {#if symbols.includes(entry.symbol)}
              <span class="market-tag">WATCH</span>
            {/if}
          </button>
        {/each}
        {#if !marketLoading && marketResults.length === 0}
          <div class="empty empty--hint">검색 결과가 없습니다</div>
        {/if}
      </div>
    {/if}
  {/if}

</div>

<style>
  .rail {
    width: 100%;
    height: 100%;
    background: var(--term-surface-1, var(--g1));
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    font-family: 'JetBrains Mono', monospace;
    color: var(--g8);
    transition: width 0.2s ease;
  }

  .rail--folded {
    width: 36px;
    min-width: 36px;
    overflow: hidden;
  }

  .rail--folded :global(.symbol-row) {
    justify-content: center;
    padding: 4px 2px;
  }

  .rail--folded :global(.sym-name) { font-size: var(--ui-text-xs); }

  .fold-btn {
    background: none;
    border: none;
    color: var(--g5);
    cursor: pointer;
    font-size: 11px;
    padding: 0 2px;
    line-height: 1;
    flex-shrink: 0;
    transition: color 0.1s;
  }
  .fold-btn:hover { color: var(--g8); }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 20px;
    padding: 2px 8px;
    font-size: var(--ui-text-xs);
    color: var(--g5);
    letter-spacing: 0.16em;
    text-transform: uppercase;
    border-bottom: 1px solid var(--term-border, var(--g4));
    background: var(--term-surface-0, var(--g0));
    position: sticky;
    top: 0;
    z-index: 1;
    flex-shrink: 0;
  }

  .section-label { font-weight: 600; }
  .section-subcopy {
    font-size: 11px;
    color: rgba(247,242,234,0.32);
    letter-spacing: 0.08em;
    text-transform: none;
  }
  .section-count { font-size: var(--ui-text-xs); color: var(--g6); }

  .section-actions {
    display: flex;
    align-items: center;
    gap: 3px;
  }

  .section-toggle {
    display: inline-flex;
    align-items: baseline;
    gap: 6px;
    min-width: 0;
    padding: 0;
    border: none;
    background: transparent;
    color: inherit;
    font: inherit;
    cursor: pointer;
    text-transform: inherit;
    letter-spacing: inherit;
  }

  .symbol-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .market-search {
    display: flex;
    align-items: center;
    gap: 5px;
    margin: 4px 8px 6px;
    padding: 0 9px;
    height: var(--term-rail-input-h, 28px);
    border: 1px solid var(--term-border, var(--g3));
    border-radius: var(--term-radius-sm, 6px);
    background: var(--term-surface-2, rgba(255,255,255,0.02));
    flex-shrink: 0;
  }

  .market-search-icon {
    color: var(--g5);
    font-size: 11px;
    flex-shrink: 0;
  }

  .market-search-input {
    flex: 1;
    min-width: 0;
    background: transparent;
    border: none;
    outline: none;
    color: var(--g8);
    font-family: inherit;
    font-size: 11px;
    letter-spacing: 0.04em;
  }

  .market-search-input::placeholder {
    color: var(--g5);
  }

  .market-search-clear {
    background: transparent;
    border: none;
    color: var(--g5);
    font-size: 14px;
    line-height: 1;
    padding: 0 2px;
    cursor: pointer;
  }

  .market-list {
    max-height: min(24vh, 188px);
    overflow-y: auto;
    border-top: 1px solid var(--term-border, rgba(255,255,255,0.03));
    border-bottom: 1px solid var(--term-border, rgba(255,255,255,0.03));
  }

  .market-row {
    display: flex;
    align-items: center;
    gap: 4px;
    width: 100%;
    min-height: 26px;
    padding: 4px 8px;
    background: transparent;
    border: none;
    border-bottom: 1px solid color-mix(in srgb, var(--term-border, var(--g3)) 85%, transparent);
    color: var(--g7);
    font-family: inherit;
    font-size: 11px;
    cursor: pointer;
    text-align: left;
    transition: background 0.1s, color 0.1s;
  }

  .market-row:hover,
  .market-row.active {
    background: var(--term-surface-2, var(--g2));
    color: var(--g9);
  }

  .market-base {
    font-weight: 700;
    color: rgba(247,242,234,0.88);
    min-width: 40px;
  }

  .market-quote {
    color: var(--g5);
    letter-spacing: 0.04em;
  }

  .market-tag {
    margin-left: auto;
    padding: 1px 4px;
    border-radius: 999px;
    background: rgba(249,216,194,0.12);
    color: rgba(249,216,194,0.85);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
  }

  /* Two-line guided empty state: shown when the watchlist is empty or
     the user toggled "★ Favs" with zero favorites. Replaces the
     pre-existing pixel-thin "None" filler that left new users staring
     at a blank rail. */
  .watch-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 20px 10px;
    text-align: center;
  }
  .watch-empty-title {
    font-size: 11px;
    font-weight: 700;
    color: rgba(247,242,234,0.6);
  }
  .watch-empty-hint {
    font-size: 11px;
    line-height: 1.45;
    color: rgba(247,242,234,0.32);
    max-width: 22ch;
  }
  .empty {
    padding: 6px 10px;
    font-size: var(--ui-text-xs);
    color: var(--g5);
    letter-spacing: 0.08em;
  }
  .empty--hint { color: rgba(247,242,234,0.4); }

  .filter-strip {
    display: flex;
    gap: 3px;
    padding: 4px 8px;
    border-bottom: 1px solid var(--term-border, var(--g3));
    background: var(--term-surface-0, var(--g0));
    flex-shrink: 0;
  }

  .chip {
    background: none;
    min-height: var(--term-rail-chip-h, 22px);
    border: 1px solid var(--term-border, var(--g3));
    border-radius: var(--term-radius-sm, 6px);
    color: var(--term-text-2, var(--g6));
    cursor: pointer;
    font-family: inherit;
    font-size: var(--ui-text-xs);
    letter-spacing: 0.04em;
    padding: 2px 7px;
    transition: border-color 0.1s, color 0.1s, background 0.1s;
  }
  .chip:hover { border-color: var(--term-border-strong, var(--g5)); color: var(--term-text-0, var(--g8)); }
  .chip--active { border-color: var(--brand); color: var(--brand); background: rgba(var(--brand-rgb, 82,130,255), 0.08); }

  /* Icon chips — kept tighter than the text chips so they read as glyphs
     rather than labels. `.view-toggle` lands on the right edge so the
     filter chips sit flush-left; `.chip--icon` (e.g. ⤢ float) shares the
     icon sizing but stays inline so it doesn't bump view-toggle out of
     its right anchor. */
  .chip--icon {
    padding: 1px 5px;
    font-size: 12px;
    line-height: 1;
  }
  .view-toggle {
    margin-left: auto;
    padding: 1px 5px;
    font-size: 11px;
    line-height: 1.4;
  }

  /* Sortable column header — 3-col grid matches .symbol-row--exchange in WatchlistItem.
     32px spacer | 1fr left col | auto right col */
  .sort-header {
    display: grid;
    grid-template-columns: 32px 1fr auto;
    column-gap: 6px;
    padding: 3px 8px;
    background: var(--term-surface-0, var(--g0));
    border-bottom: 1px solid var(--term-border, var(--g3));
    flex-shrink: 0;
    position: sticky;
    top: 0;
    z-index: 1;
  }
  .sort-spacer { flex-shrink: 0; }
  .sort-col {
    display: flex;
    align-items: baseline;
    gap: 6px;
  }
  .sort-col--right { justify-content: flex-end; }
  .sort-btn {
    background: none;
    border: none;
    padding: 0;
    color: var(--term-text-2, var(--g5));
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.12em;
    cursor: pointer;
    transition: color 0.1s;
    white-space: nowrap;
  }
  .sort-btn:hover { color: var(--term-text-1, var(--g7)); }
  .sort-btn--active { color: var(--term-text-0, var(--g8)); }
  .sort-btn--sub { opacity: 0.65; letter-spacing: 0.08em; }
  .sort-dir { color: var(--brand); }

  /* Table-mode container: exchange rows handle their own padding. */
  .symbol-list--table :global(.symbol-row--exchange) {
    padding-top: 5px;
    padding-bottom: 5px;
  }
</style>
