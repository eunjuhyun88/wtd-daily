<script lang="ts">
  import { openPositions, hydratePositions, positionsLoading } from '$lib/stores/positionStore';
  import type { UnifiedPosition } from '$lib/api/positionsApi';
  import type { MarketMicrostructurePayload } from '$lib/api/terminalBackend';
  import { onMount } from 'svelte';

  type MicroOrderbook = MarketMicrostructurePayload['orderbook'];
  type TradePrint = MarketMicrostructurePayload['tradeTape']['trades'][number];

  interface Props {
    orderbook?: MicroOrderbook | null;
    trades?: TradePrint[];
    symbol?: string;
  }

  const { orderbook = null, trades = [], symbol = '' }: Props = $props();

  type DrawerTab = 'positions' | 'book' | 'log';
  let activeTab = $state<DrawerTab>('positions');
  let collapsed = $state(false);

  const positions = $derived($openPositions);
  const loading = $derived($positionsLoading);

  onMount(() => { hydratePositions(); });

  const askRows = $derived((orderbook?.asks ?? []).slice(0, 8).reverse());
  const bidRows = $derived((orderbook?.bids ?? []).slice(0, 8));
  const logRows = $derived((trades ?? []).slice(0, 14));

  function fmtPrice(n: number): string {
    if (n >= 10000) return n.toLocaleString('en-US', { maximumFractionDigits: 0 });
    if (n >= 100) return n.toFixed(1);
    return n.toFixed(3);
  }

  function fmtPnl(pct: number): string {
    return (pct >= 0 ? '+' : '') + pct.toFixed(2) + '%';
  }

  function dirLabel(p: UnifiedPosition): string {
    return p.direction?.toUpperCase?.() ?? '—';
  }
</script>

<div class="execute-drawer" class:collapsed>
  <div class="ed-header" role="tablist" aria-label="Execute mode panels">
    <div class="ed-tabs">
      {#each ([
        { id: 'positions', label: 'POSITIONS', count: positions.length },
        { id: 'book',      label: 'BOOK',      count: null },
        { id: 'log',       label: 'LOG',        count: logRows.length },
      ] as const) as tab}
        <button
          class="ed-tab"
          class:active={activeTab === tab.id}
          onclick={() => { activeTab = tab.id; collapsed = false; }}
          role="tab"
          aria-selected={activeTab === tab.id}
        >
          {tab.label}
          {#if tab.count !== null}
            <span class="ed-badge">{tab.count}</span>
          {/if}
        </button>
      {/each}
    </div>
    <div class="ed-controls">
      {#if symbol}
        <span class="ed-sym">{symbol}</span>
      {/if}
      <button
        class="ed-toggle"
        onclick={() => collapsed = !collapsed}
        aria-label={collapsed ? 'Expand drawer' : 'Collapse drawer'}
      >{collapsed ? '▲' : '▼'}</button>
    </div>
  </div>

  {#if !collapsed}
    <div class="ed-body" role="tabpanel">

      {#if activeTab === 'positions'}
        {#if loading}
          <div class="ed-empty">Loading positions…</div>
        {:else if positions.length === 0}
          <div class="ed-empty">No open positions</div>
        {:else}
          <div class="ed-positions">
            {#each positions as pos (pos.id)}
              <div class="ed-pos-row">
                <span class="ed-pos-asset">{pos.asset}</span>
                <span class="ed-pos-dir" class:long={pos.direction?.toLowerCase() === 'long'} class:short={pos.direction?.toLowerCase() === 'short'}>
                  {dirLabel(pos)}
                </span>
                <span class="ed-pos-entry">{fmtPrice(pos.entryPrice)}</span>
                <span class="ed-pos-cur">{fmtPrice(pos.currentPrice)}</span>
                <span class="ed-pos-pnl" class:pos={pos.pnlPercent >= 0} class:neg={pos.pnlPercent < 0}>
                  {fmtPnl(pos.pnlPercent)}
                </span>
                <span class="ed-pos-type">{pos.type.replace('_', ' ')}</span>
              </div>
            {/each}
          </div>
        {/if}

      {:else if activeTab === 'book'}
        {#if !orderbook}
          <div class="ed-empty">No orderbook data</div>
        {:else}
          <div class="ed-book">
            <div class="ed-book-side asks">
              {#each askRows as row}
                <div class="ed-book-row ask">
                  <span class="bk-price ask">{fmtPrice(row.price)}</span>
                  <span class="bk-size">{row.qty.toFixed(3)}</span>
                  <div class="bk-bar ask" style:width="{Math.min(100, (row.qty / (askRows[0]?.qty ?? 1)) * 100)}%"></div>
                </div>
              {/each}
            </div>
            <div class="ed-book-mid">
              <span class="bk-spread">SPREAD</span>
            </div>
            <div class="ed-book-side bids">
              {#each bidRows as row}
                <div class="ed-book-row bid">
                  <span class="bk-price bid">{fmtPrice(row.price)}</span>
                  <span class="bk-size">{row.qty.toFixed(3)}</span>
                  <div class="bk-bar bid" style:width="{Math.min(100, (row.qty / (bidRows[0]?.qty ?? 1)) * 100)}%"></div>
                </div>
              {/each}
            </div>
          </div>
        {/if}

      {:else}
        {#if logRows.length === 0}
          <div class="ed-empty">No recent trades</div>
        {:else}
          <div class="ed-log">
            {#each logRows as t}
              <div class="ed-log-row" class:buy={t.side !== 'SELL'} class:sell={t.side === 'SELL'}>
                <span class="log-side">{t.side !== 'SELL' ? 'B' : 'S'}</span>
                <span class="log-price">{fmtPrice(t.price)}</span>
                <span class="log-qty">{t.qty.toFixed(3)}</span>
              </div>
            {/each}
          </div>
        {/if}
      {/if}

    </div>
  {/if}
</div>

<style>
  .execute-drawer {
    position: relative;
    z-index: 10;
    background: rgba(6, 6, 8, 0.97);
    border-top: 1px solid rgba(var(--brand-rgb, 219, 154, 159), 0.18);
    display: flex;
    flex-direction: column;
    height: 200px;
    flex-shrink: 0;
    transition: height 0.2s ease;
  }

  .execute-drawer.collapsed {
    height: 28px;
  }

  .ed-header {
    display: flex;
    align-items: center;
    height: 28px;
    padding: 0 12px;
    gap: 8px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    flex-shrink: 0;
  }

  .ed-tabs {
    display: flex;
    gap: 0;
    flex: 1;
  }

  .ed-tab {
    font-family: 'JetBrains Mono', monospace;
    font-size: var(--ui-text-xs, 11px);
    font-weight: 600;
    letter-spacing: 0.08em;
    color: rgba(250, 247, 235, 0.35);
    background: transparent;
    border: none;
    padding: 0 10px;
    height: 28px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 5px;
    transition: color 0.12s;
  }

  .ed-tab:hover { color: rgba(250, 247, 235, 0.62); }
  .ed-tab.active {
    color: rgba(var(--brand-rgb, 219, 154, 159), 0.9);
    border-bottom: 1px solid rgba(var(--brand-rgb, 219, 154, 159), 0.4);
  }

  .ed-badge {
    font-size: var(--ui-text-xs);
    padding: 1px 4px;
    background: rgba(255, 255, 255, 0.06);
    border-radius: 3px;
    color: rgba(250, 247, 235, 0.5);
  }

  .ed-controls {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .ed-sym {
    font-family: 'JetBrains Mono', monospace;
    font-size: var(--ui-text-xs, 11px);
    color: rgba(250, 247, 235, 0.3);
  }

  .ed-toggle {
    font-size: var(--ui-text-xs);
    color: rgba(250, 247, 235, 0.3);
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0 4px;
    transition: color 0.12s;
  }
  .ed-toggle:hover { color: rgba(250, 247, 235, 0.7); }

  .ed-body {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .ed-empty {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'JetBrains Mono', monospace;
    font-size: var(--ui-text-xs, 11px);
    color: rgba(250, 247, 235, 0.22);
  }

  /* ── Positions tab ── */
  .ed-positions {
    overflow-y: auto;
    flex: 1;
  }

  .ed-pos-row {
    display: grid;
    grid-template-columns: 80px 40px 80px 80px 70px 1fr;
    align-items: center;
    padding: 5px 12px;
    font-family: 'JetBrains Mono', monospace;
    font-size: var(--ui-text-xs, 11px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.03);
    gap: 4px;
  }

  .ed-pos-asset {
    color: rgba(250, 247, 235, 0.8);
    font-weight: 600;
  }

  .ed-pos-dir {
    font-weight: 700;
    font-size: var(--ui-text-xs);
    letter-spacing: 0.06em;
  }
  .ed-pos-dir.long  { color: #5bbf8a; }
  .ed-pos-dir.short { color: #e0706e; }

  .ed-pos-entry, .ed-pos-cur {
    color: rgba(250, 247, 235, 0.5);
    text-align: right;
  }

  .ed-pos-pnl {
    font-weight: 600;
    text-align: right;
  }
  .ed-pos-pnl.pos { color: #5bbf8a; }
  .ed-pos-pnl.neg { color: #e0706e; }

  .ed-pos-type {
    color: rgba(250, 247, 235, 0.25);
    font-size: var(--ui-text-xs);
    letter-spacing: 0.05em;
  }

  /* ── Book tab ── */
  .ed-book {
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: hidden;
  }

  .ed-book-side {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }

  .ed-book-mid {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 18px;
    border-top: 0.5px solid rgba(255,255,255,0.06);
    border-bottom: 0.5px solid rgba(255,255,255,0.06);
  }

  .bk-spread {
    font-family: 'JetBrains Mono', monospace;
    font-size: var(--ui-text-xs);
    color: rgba(250, 247, 235, 0.2);
    letter-spacing: 0.1em;
  }

  .ed-book-row {
    position: relative;
    display: grid;
    grid-template-columns: 80px 80px 1fr;
    align-items: center;
    padding: 3px 12px;
    font-family: 'JetBrains Mono', monospace;
    font-size: var(--ui-text-xs, 11px);
    overflow: hidden;
  }

  .bk-price { font-weight: 600; }
  .bk-price.ask { color: #e0706e; }
  .bk-price.bid { color: #5bbf8a; }
  .bk-size { color: rgba(250, 247, 235, 0.45); }

  .bk-bar {
    position: absolute;
    right: 0;
    top: 0;
    height: 100%;
    opacity: 0.08;
    pointer-events: none;
  }
  .bk-bar.ask { background: #e0706e; }
  .bk-bar.bid { background: #5bbf8a; }

  /* ── Log tab ── */
  .ed-log {
    overflow-y: auto;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .ed-log-row {
    display: grid;
    grid-template-columns: 14px 80px 1fr;
    align-items: center;
    padding: 3px 12px;
    font-family: 'JetBrains Mono', monospace;
    font-size: var(--ui-text-xs, 11px);
    gap: 6px;
  }

  .log-side {
    font-weight: 700;
    font-size: var(--ui-text-xs);
  }
  .ed-log-row.buy  .log-side { color: #5bbf8a; }
  .ed-log-row.sell .log-side { color: #e0706e; }

  .log-price { color: rgba(250, 247, 235, 0.65); }
  .log-qty   { color: rgba(250, 247, 235, 0.35); }
</style>
