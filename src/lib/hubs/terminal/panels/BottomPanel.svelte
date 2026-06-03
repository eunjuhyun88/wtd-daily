<script lang="ts">
  import { timeSince } from '$lib/utils/time';
  import { quickTradeStore, openTrades, closedTrades, totalQuickPnL, closeQuickTrade, clearClosedTrades } from '$lib/stores/quickTradeStore';
  import { trackedSignalStore, activeSignals, activeSignalCount, convertToTrade, removeTracked, clearExpired } from '$lib/stores/trackedSignalStore';
  import { activePairState } from '$lib/stores/activePairStore';

  interface Activity {
    id: string;
    icon: string;
    text: string;
    time: number;
    color: string;
  }

  let activities = $state<Activity[]>([]);

  type Tab = 'positions' | 'tracked' | 'activity';
  let activeTab = $state<Tab>('positions');

  export function addActivity(icon: string, text: string, color: string = 'rgba(247,242,234,0.78)') {
    activities = [{ id: crypto.randomUUID(), icon, text, time: Date.now(), color }, ...activities].slice(0, 50);
  }

  export function activateTab(tab: Tab) {
    activeTab = tab;
  }

  function handleCloseTrade(tradeId: string) {
    const trade = $openTrades.find(t => t.id === tradeId);
    if (!trade) return;
    const token = trade.pair.split('/')[0] as keyof typeof $activePairState.prices;
    const currentPrice = $activePairState.prices[token] || $activePairState.prices.BTC;
    closeQuickTrade(tradeId, currentPrice);
    const pnl = trade.pnlPercent;
    addActivity(pnl >= 0 ? '▲' : '▼', `Closed ${trade.dir} ${trade.pair} · ${pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}%`, pnl >= 0 ? '#4db46a' : '#e05c6a');
  }

  function handleConvert(signalId: string) {
    const sig = $activeSignals.find(s => s.id === signalId);
    if (!sig) return;
    const token = sig.pair.split('/')[0] as keyof typeof $activePairState.prices;
    const price = $activePairState.prices[token] || $activePairState.prices.BTC;
    convertToTrade(signalId, price);
    addActivity('→', `Converted ${sig.dir} ${sig.pair} to trade`, '#facc15');
    activeTab = 'positions';
  }

  function pnlColor(n: number) { return n >= 0 ? '#4db46a' : '#e05c6a'; }
  function pnlPfx(n: number)   { return n >= 0 ? '+' : ''; }
  function timeLeft(ts: number) {
    const ms = ts - Date.now();
    if (ms <= 0) return 'expired';
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    return `${h}h ${m}m`;
  }
</script>

<div class="bp">
  <div class="bp-tabs">
    <button class="bp-tab" class:active={activeTab === 'positions'} onclick={() => activeTab = 'positions'}>
      POSITIONS
      {#if $openTrades.length > 0}<span class="bp-badge">{$openTrades.length}</span>{/if}
    </button>
    <button class="bp-tab" class:active={activeTab === 'tracked'} onclick={() => activeTab = 'tracked'}>
      TRACKED
      {#if $activeSignalCount > 0}<span class="bp-badge bp-badge-cyan">{$activeSignalCount}</span>{/if}
    </button>
    <button class="bp-tab" class:active={activeTab === 'activity'} onclick={() => activeTab = 'activity'}>
      ACTIVITY
      {#if activities.length > 0}<span class="bp-badge bp-badge-dim">{activities.length}</span>{/if}
    </button>
    <div class="bp-tabs-right">
      <span class="bp-pnl" style:color={pnlColor($totalQuickPnL)}>
        {pnlPfx($totalQuickPnL)}{$totalQuickPnL.toFixed(2)}%
      </span>
    </div>
  </div>

  <div class="bp-content">
    {#if activeTab === 'positions'}
      <div class="bp-body">
        {#if $openTrades.length > 0}
          {#each $openTrades as trade (trade.id)}
            <div class="bp-row">
              <span class="bp-dir" class:long={trade.dir === 'LONG'} class:short={trade.dir === 'SHORT'}>
                {trade.dir === 'LONG' ? '▲' : '▼'} {trade.dir}
              </span>
              <span class="bp-pair">{trade.pair}</span>
              <span class="bp-src">{trade.source}</span>
              <span class="bp-entry">${Math.round(trade.entry).toLocaleString()}</span>
              <span class="bp-pnl-val" style:color={pnlColor(trade.pnlPercent)}>
                {pnlPfx(trade.pnlPercent)}{trade.pnlPercent}%
              </span>
              <span class="bp-time">{timeSince(trade.openedAt, false)}</span>
              <button class="bp-action-btn bp-close-btn" onclick={() => handleCloseTrade(trade.id)}>CLOSE</button>
            </div>
          {/each}
        {:else}
          <div class="bp-empty">No open positions.</div>
        {/if}
      </div>

    {:else if activeTab === 'tracked'}
      <div class="bp-body">
        {#if $activeSignals.length > 0}
          {#each $activeSignals as sig (sig.id)}
            <div class="bp-row">
              <span class="bp-dir" class:long={sig.dir === 'LONG'} class:short={sig.dir === 'SHORT'}>
                {sig.dir === 'LONG' ? '▲' : '▼'} {sig.dir}
              </span>
              <span class="bp-pair">{sig.pair}</span>
              <span class="bp-src">{sig.source}</span>
              <span class="bp-conf">{sig.confidence}%</span>
              <span class="bp-pnl-val" style:color={pnlColor(sig.pnlPercent)}>
                {pnlPfx(sig.pnlPercent)}{sig.pnlPercent}%
              </span>
              <span class="bp-time bp-expire">⏱ {timeLeft(sig.expiresAt)}</span>
              <button class="bp-action-btn bp-trade-btn" onclick={() => handleConvert(sig.id)}>TRADE</button>
              <button class="bp-action-btn bp-rm-btn" onclick={() => removeTracked(sig.id)}>✕</button>
            </div>
          {/each}
        {:else}
          <div class="bp-empty">No tracked signals.</div>
        {/if}
        {#if $trackedSignalStore.signals.filter(s => s.status === 'expired').length > 0}
          <button class="bp-clear" onclick={clearExpired}>CLEAR EXPIRED</button>
        {/if}
      </div>

    {:else if activeTab === 'activity'}
      <div class="bp-body">
        {#if $closedTrades.length > 0}
          <div class="bp-section-lbl">TRADE HISTORY</div>
          {#each $closedTrades.slice(0, 8) as trade (trade.id)}
            <div class="bp-row bp-row-closed">
              <span class="bp-dir" class:long={trade.dir === 'LONG'} class:short={trade.dir === 'SHORT'}>
                {trade.dir === 'LONG' ? '▲' : '▼'}
              </span>
              <span class="bp-pair">{trade.pair}</span>
              <span class="bp-src">{trade.source}</span>
              <span class="bp-pnl-val" style:color={pnlColor(trade.closePnl || 0)}>
                {pnlPfx(trade.closePnl || 0)}{(trade.closePnl || 0).toFixed(2)}%
              </span>
            </div>
          {/each}
          <button class="bp-clear" onclick={clearClosedTrades}>CLEAR HISTORY</button>
        {/if}

        {#if activities.length > 0}
          <div class="bp-section-lbl">ACTIVITY LOG</div>
          {#each activities as act (act.id)}
            <div class="bp-row bp-act-row">
              <span class="bp-act-icon">{act.icon}</span>
              <span class="bp-act-text" style:color={act.color}>{act.text}</span>
              <span class="bp-time">{timeSince(act.time, false)}</span>
            </div>
          {/each}
        {/if}

        {#if $closedTrades.length === 0 && activities.length === 0}
          <div class="bp-empty">No activity yet.</div>
        {/if}
      </div>
    {/if}
  </div>
</div>

<style>
  .bp {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    overflow: hidden;
    background: var(--term-surface-0, #0a0e14);
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: var(--term-text-1, rgba(247,242,234,0.78));
    border-top: 2px solid #facc15;
  }

  /* Tabs */
  .bp-tabs {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    background: var(--term-surface-0, #0a0e14);
    border-bottom: 1px solid var(--term-border, rgba(255,255,255,0.07));
  }

  .bp-tab {
    padding: 8px 12px;
    font-family: inherit;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: var(--term-text-2, rgba(247,242,234,0.35));
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    cursor: pointer;
    transition: all 0.12s;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .bp-tab:hover { color: var(--term-text-1, rgba(247,242,234,0.65)); }

  .bp-tab.active {
    color: var(--term-text-0, rgba(247,242,234,0.92));
    border-bottom-color: rgba(247,242,234,0.6);
  }

  .bp-badge {
    font-size: 11px;
    background: #facc15;
    color: #000;
    padding: 1px 4px;
    border-radius: 8px;
    font-weight: 700;
  }
  .bp-badge-cyan { background: #60a5fa; color: #000; }
  .bp-badge-dim  { background: rgba(255,255,255,0.15); color: rgba(247,242,234,0.7); }

  .bp-tabs-right {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 8px;
    padding-right: 10px;
  }

  .bp-pnl {
    font-size: 11px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }

  /* Content */
  .bp-content {
    flex: 1;
    overflow: hidden;
    min-height: 0;
  }

  .bp-body {
    height: 100%;
    overflow-y: auto;
    padding: 4px 8px;
    scrollbar-width: thin;
    scrollbar-color: var(--term-border, rgba(255,255,255,0.08)) transparent;
  }

  /* Rows */
  .bp-row {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px;
    border-bottom: 1px solid rgba(255,255,255,0.04);
    font-variant-numeric: tabular-nums;
  }
  .bp-row:hover { background: rgba(255,255,255,0.02); }
  .bp-row-closed { opacity: 0.4; }

  .bp-dir {
    font-size: 11px;
    font-weight: 700;
    padding: 2px 5px;
    border-radius: 3px;
    border: 1px solid;
    letter-spacing: 0.04em;
    white-space: nowrap;
  }
  .bp-dir.long  { color: #4db46a; border-color: rgba(77,180,106,0.3); background: rgba(77,180,106,0.08); }
  .bp-dir.short { color: #e05c6a; border-color: rgba(224,92,106,0.3); background: rgba(224,92,106,0.08); }

  .bp-pair { font-size: 11px; font-weight: 700; color: var(--term-text-0, rgba(247,242,234,0.85)); }

  .bp-src {
    font-size: 11px;
    color: var(--term-text-2, rgba(247,242,234,0.25));
    background: rgba(255,255,255,0.04);
    padding: 1px 4px;
    border-radius: 3px;
  }

  .bp-conf {
    font-size: 11px;
    color: #60a5fa;
    font-weight: 700;
  }

  .bp-entry { font-size: 11px; color: var(--term-text-2, rgba(247,242,234,0.4)); }

  .bp-pnl-val {
    font-size: 11px;
    font-weight: 700;
    min-width: 48px;
    text-align: right;
  }

  .bp-time   { font-size: 11px; color: var(--term-text-2, rgba(247,242,234,0.25)); }
  .bp-expire { color: #f97316; }

  .bp-action-btn {
    font-family: inherit;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.04em;
    padding: 2px 6px;
    border-radius: 3px;
    cursor: pointer;
    transition: all 0.12s;
    border: 1px solid;
  }

  .bp-close-btn {
    background: rgba(224,92,106,0.1);
    color: #e05c6a;
    border-color: rgba(224,92,106,0.3);
  }
  .bp-close-btn:hover { background: rgba(224,92,106,0.25); }

  .bp-trade-btn {
    background: rgba(77,180,106,0.1);
    color: #4db46a;
    border-color: rgba(77,180,106,0.3);
  }
  .bp-trade-btn:hover { background: rgba(77,180,106,0.25); }

  .bp-rm-btn {
    background: rgba(255,255,255,0.04);
    color: var(--term-text-2, rgba(247,242,234,0.3));
    border-color: var(--term-border, rgba(255,255,255,0.1));
    padding: 2px 5px;
  }
  .bp-rm-btn:hover { color: #e05c6a; border-color: #e05c6a; }

  .bp-empty {
    padding: 24px;
    text-align: center;
    font-size: 11px;
    color: var(--term-text-2, rgba(247,242,234,0.25));
    letter-spacing: 0.04em;
  }

  .bp-section-lbl {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.12em;
    color: var(--term-text-2, rgba(247,242,234,0.25));
    padding: 6px 4px 3px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    margin-bottom: 2px;
  }
  .bp-section-lbl:not(:first-child) {
    margin-top: 6px;
    border-top: 1px solid rgba(255,255,255,0.06);
    padding-top: 8px;
  }

  .bp-clear {
    width: 100%;
    padding: 4px;
    font-family: inherit;
    font-size: 11px;
    color: var(--term-text-2, rgba(247,242,234,0.25));
    background: none;
    border: none;
    cursor: pointer;
    text-align: center;
    letter-spacing: 0.06em;
    font-weight: 600;
  }
  .bp-clear:hover { color: #e05c6a; }

  .bp-act-row { gap: 8px; }
  .bp-act-icon { font-size: 11px; }
  .bp-act-text { font-size: 11px; flex: 1; }
</style>
