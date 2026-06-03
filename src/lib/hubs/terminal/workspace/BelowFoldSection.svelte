<script lang="ts">
  import BottomPanel from '../panels/BottomPanel.svelte';
  import SignalRadarPanel from '../panels/methodology/SignalRadarPanel.svelte';
  import FlowDashboardPanel from '../panels/methodology/FlowDashboardPanel.svelte';
  import AlphaTerminalScoreboardPanel from '../panels/methodology/AlphaTerminalScoreboardPanel.svelte';

  import { useMicrostructureSocket } from '$lib/trade/useMicrostructureSocket.svelte';

  let { symbol = 'BTCUSDT', onClose }: { symbol?: string; onClose?: () => void } = $props();

  type Tab = 'positions' | 'feed' | 'book' | 'radar' | 'flow' | 'scoreboard';
  let activeTab = $state<Tab>('positions');

  const TABS: { id: Tab; label: string }[] = [
    { id: 'positions',  label: 'POSITIONS' },
    { id: 'feed',       label: 'FEED' },
    { id: 'book',       label: 'BOOK' },
    { id: 'radar',      label: 'RADAR' },
    { id: 'flow',       label: 'FLOW' },
    { id: 'scoreboard', label: 'SCOREBOARD' },
  ];

  // Real-time microstructure for FEED + BOOK tabs
  const ms = useMicrostructureSocket(
    () => symbol,
    () => null,
  );

  function fmtPrice(p: number) {
    return p >= 1000 ? p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : p < 0.01 ? p.toFixed(6)
      : p < 1 ? p.toFixed(4)
      : p.toFixed(2);
  }
  function fmtQty(q: number) {
    return q >= 1000 ? `${(q / 1000).toFixed(2)}K` : q.toFixed(3);
  }
  function fmtTime(ts: number) {
    return new Date(ts).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }
</script>

<section id="below-fold" class="below-fold">
  <div class="bf-tab-strip">
    <button class="bf-back-btn" onclick={onClose} title="Close panel">▲</button>
    {#each TABS as t (t.id)}
      <button
        class="bf-tab"
        class:active={activeTab === t.id}
        onclick={() => (activeTab = t.id)}
      >
        {t.label}
      </button>
    {/each}
  </div>

  <div class="bf-content">
    {#if activeTab === 'positions'}
      <BottomPanel />
    {:else if activeTab === 'feed'}
      <!-- Real-time trade tape from Binance WebSocket -->
      <div class="bf-feed">
        <div class="bf-feed-header">
          <span>Price</span><span>Qty</span><span>Time</span>
          <span class="bf-ws-badge" class:live={ms.microWsState === 'live'} class:err={ms.microWsState === 'error'}>
            {ms.microWsState === 'live' ? 'LIVE' : ms.microWsState === 'connecting' ? '…' : ms.microWsState}
          </span>
        </div>
        {#each ms.liveTrades.slice(0, 60) as t (t.id)}
          <div class="bf-feed-row" class:buy={t.side === 'BUY'} class:sell={t.side === 'SELL'}>
            <span>{fmtPrice(t.price)}</span>
            <span>{fmtQty(t.qty)}</span>
            <span class="bf-feed-time">{fmtTime(t.time)}</span>
          </div>
        {/each}
        {#if ms.liveTrades.length === 0}
          <div class="bf-placeholder">연결 중… ({ms.microWsState})</div>
        {/if}
      </div>
    {:else if activeTab === 'book'}
      <!-- Real-time L2 order book -->
      <div class="bf-book">
        <div class="bf-book-col bf-book-asks">
          <div class="bf-book-hdr">
            <span>Price</span><span>Qty</span><span>Total</span>
          </div>
          {#each [...(ms.liveOrderbook?.asks ?? [])].reverse() as lvl, i (i)}
            <div class="bf-book-row ask">
              <span>{fmtPrice(lvl.price)}</span>
              <span>{fmtQty(lvl.qty)}</span>
              <span class="bf-book-notional">{lvl.notional >= 1e6 ? (lvl.notional / 1e6).toFixed(2) + 'M' : (lvl.notional / 1e3).toFixed(1) + 'K'}</span>
              <div class="bf-book-bar ask" style="width:{(lvl.weight * 100).toFixed(1)}%"></div>
            </div>
          {/each}
          {#if ms.liveOrderbook}
            <div class="bf-book-spread">
              spread {ms.liveOrderbook.spreadBps != null ? ms.liveOrderbook.spreadBps.toFixed(1) + ' bps' : '—'}
            </div>
          {/if}
          {#each ms.liveOrderbook?.bids ?? [] as lvl, i (i)}
            <div class="bf-book-row bid">
              <span>{fmtPrice(lvl.price)}</span>
              <span>{fmtQty(lvl.qty)}</span>
              <span class="bf-book-notional">{lvl.notional >= 1e6 ? (lvl.notional / 1e6).toFixed(2) + 'M' : (lvl.notional / 1e3).toFixed(1) + 'K'}</span>
              <div class="bf-book-bar bid" style="width:{(lvl.weight * 100).toFixed(1)}%"></div>
            </div>
          {/each}
        </div>
      </div>
    {:else if activeTab === 'radar'}
      <SignalRadarPanel />
    {:else if activeTab === 'flow'}
      <FlowDashboardPanel />
    {:else if activeTab === 'scoreboard'}
      <AlphaTerminalScoreboardPanel sym={symbol} />
    {/if}
  </div>
</section>

<style>
  .below-fold {
    background: var(--sc-bg-0, #0a0e14);
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .bf-tab-strip {
    display: flex;
    border-bottom: 1px solid rgba(255, 255, 255, 0.07);
    flex-shrink: 0;
    padding: 0 8px;
  }

  .bf-back-btn {
    padding: 0 12px;
    font-size: 11px;
    background: none;
    border: none;
    border-right: 1px solid rgba(255, 255, 255, 0.07);
    color: rgba(247, 242, 234, 0.35);
    cursor: pointer;
    flex-shrink: 0;
    transition: color 0.1s;
  }
  .bf-back-btn:hover { color: rgba(247, 242, 234, 0.75); }

  .bf-tab {
    padding: 10px 14px;
    font-size: 11px;
    font-family: var(--sc-font-mono, monospace);
    font-weight: 600;
    letter-spacing: 0.04em;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    color: rgba(247, 242, 234, 0.4);
    cursor: pointer;
    transition: color 0.1s, border-color 0.1s;
  }

  .bf-tab:hover { color: rgba(247, 242, 234, 0.75); }

  .bf-tab.active {
    color: rgba(247, 242, 234, 0.92);
    border-bottom-color: rgba(247, 242, 234, 0.6);
  }

  .bf-content {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .bf-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    min-height: 80px;
    color: rgba(247, 242, 234, 0.25);
    font-size: 11px;
    font-family: var(--sc-font-mono, monospace);
  }

  /* ── FEED tab ── */
  .bf-feed {
    height: 100%;
    overflow-y: auto;
    font-family: var(--sc-font-mono, monospace);
    font-size: 11px;
  }
  .bf-feed-header {
    display: grid;
    grid-template-columns: 1fr 0.8fr 0.8fr auto;
    gap: 8px;
    padding: 4px 10px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    color: rgba(247,242,234,0.35);
    font-size: 11px;
    letter-spacing: 0.04em;
    position: sticky;
    top: 0;
    background: var(--sc-bg-0, #0a0e14);
  }
  .bf-ws-badge {
    font-size: 11px;
    padding: 1px 5px;
    border-radius: 3px;
    background: rgba(255,255,255,0.06);
    color: rgba(247,242,234,0.35);
  }
  .bf-ws-badge.live { background: rgba(100,200,120,0.15); color: rgba(100,200,120,0.9); }
  .bf-ws-badge.err  { background: rgba(220,80,80,0.15); color: rgba(220,80,80,0.9); }

  .bf-feed-row {
    display: grid;
    grid-template-columns: 1fr 0.8fr 0.8fr;
    gap: 8px;
    padding: 2px 10px;
    font-variant-numeric: tabular-nums;
    line-height: 1.4;
  }
  .bf-feed-row.buy  span:first-child { color: #4db46a; }
  .bf-feed-row.sell span:first-child { color: #e05c6a; }
  .bf-feed-time { color: rgba(247,242,234,0.3); }

  /* ── BOOK tab ── */
  .bf-book {
    height: 100%;
    overflow-y: auto;
    font-family: var(--sc-font-mono, monospace);
    font-size: 11px;
  }
  .bf-book-col { width: 100%; }
  .bf-book-hdr {
    display: grid;
    grid-template-columns: 1fr 0.8fr 0.8fr;
    gap: 8px;
    padding: 4px 10px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    color: rgba(247,242,234,0.35);
    font-size: 11px;
    letter-spacing: 0.04em;
    position: sticky;
    top: 0;
    background: var(--sc-bg-0, #0a0e14);
  }
  .bf-book-row {
    display: grid;
    grid-template-columns: 1fr 0.8fr 0.8fr;
    gap: 8px;
    padding: 2px 10px;
    position: relative;
    font-variant-numeric: tabular-nums;
    line-height: 1.4;
    overflow: hidden;
  }
  .bf-book-row.ask span:first-child { color: #e05c6a; }
  .bf-book-row.bid span:first-child { color: #4db46a; }
  .bf-book-notional { color: rgba(247,242,234,0.4); }
  .bf-book-bar {
    position: absolute;
    top: 0; bottom: 0;
    right: 0;
    opacity: 0.08;
    pointer-events: none;
  }
  .bf-book-bar.ask { background: #e05c6a; }
  .bf-book-bar.bid { background: #4db46a; }
  .bf-book-spread {
    text-align: center;
    font-size: 11px;
    color: rgba(247,242,234,0.3);
    padding: 3px 0;
    border-top: 1px solid rgba(255,255,255,0.06);
    border-bottom: 1px solid rgba(255,255,255,0.06);
    background: rgba(255,255,255,0.02);
  }
</style>
