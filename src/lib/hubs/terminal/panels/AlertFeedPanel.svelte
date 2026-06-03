<script lang="ts">
  /**
   * AlertFeedPanel — auto-refreshing whale alert feed.
   * Polls /api/terminal/agent/whale-alerts every 30s.
   * Shows liq / large-trade / OI-spike events with tier emoji + size.
   */
  import { onMount, onDestroy } from 'svelte';
  import type { AlertEvent, AlertTier, AlertEventType } from '$lib/agent/directives';

  interface AlertFeedState {
    events: AlertEvent[];
    summary: {
      total_liq_usd: number;
      total_buy_usd: number;
      total_sell_usd: number;
      dominant_direction: 'buy' | 'sell' | 'neutral';
    } | null;
    count: number;
    fetchedAt: number;
  }

  const REFRESH_MS = 30_000;
  const TIER_GLYPH: Record<AlertEventType, Record<AlertTier, string>> = {
    trade:    { xl: '◆◆', lg: '◆', md: '◇', sm: '·' },
    liq:      { xl: '▲▲', lg: '▲', md: '△', sm: '▵' },
    oi_spike: { xl: '↑↑', lg: '↑', md: '↗', sm: '→' },
  };
  const TIER_COLOR: Record<AlertTier, string> = {
    xl: '#F23645', lg: '#d6a347', md: 'rgba(247,242,234,0.54)', sm: 'rgba(247,242,234,0.32)',
  };
  const DIR_COLOR: Record<string, string> = {
    buy: '#22AB94', sell: '#F23645',
    long_liq: '#F23645', short_liq: '#22AB94',
    oi_long: '#22AB94', oi_short: '#F23645',
  };
  const DIR_KO: Record<string, string> = {
    buy: '매수', sell: '매도',
    long_liq: '롱청산', short_liq: '숏청산',
    oi_long: 'OI↑', oi_short: 'OI↓',
  };
  const TYPE_KO: Record<AlertEventType, string> = {
    trade: '체결', liq: '청산', oi_spike: 'OI',
  };

  let feed = $state<AlertFeedState>({
    events: [], summary: null, count: 0, fetchedAt: 0,
  });
  let loading = $state(false);
  let error = $state<string | null>(null);
  let intervalId: ReturnType<typeof setInterval> | null = null;
  let tickIntervalId: ReturnType<typeof setInterval> | null = null;
  let now = $state(Date.now());
  let newCount = $state(0);

  function fmtUsd(v: number): string {
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000)     return `$${(v / 1_000).toFixed(0)}K`;
    return `$${v.toFixed(0)}`;
  }
  function fmtTime(ts: number): string {
    return new Date(ts).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }
  function relTime(ts: number): string {
    const s = Math.floor((now - ts) / 1000);
    if (s < 60) return `${s}s`;
    if (s < 3600) return `${Math.floor(s / 60)}m`;
    return `${Math.floor(s / 3600)}h`;
  }
  function tierColor(tier: AlertTier): string {
    return TIER_COLOR[tier] ?? '#707090';
  }
  function dirColor(dir: string): string {
    return DIR_COLOR[dir] ?? '#707090';
  }
  function glyph(ev: AlertEvent): string {
    return TIER_GLYPH[ev.type]?.[ev.tier] ?? '·';
  }
  function isNew(ts: number): boolean {
    return now - ts < 60_000;
  }

  async function fetchAlerts() {
    if (loading) return;
    loading = true;
    error = null;
    try {
      const res = await fetch('/api/terminal/agent/whale-alerts?lookback_min=5&min_usd=50000');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as AlertFeedState & { alerts: AlertEvent[] };
      const prevIds = new Set(feed.events.map((e: AlertEvent) => e.id));
      const incoming = (data.alerts ?? []) as AlertEvent[];
      newCount = incoming.filter((e: AlertEvent) => !prevIds.has(e.id)).length;
      feed = {
        events: incoming,
        summary: data.summary ?? null,
        count: data.count ?? incoming.length,
        fetchedAt: Date.now(),
      };
    } catch (e: unknown) {
      error = e instanceof Error ? e.message : '알람 조회 실패';
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    fetchAlerts();
    intervalId = setInterval(fetchAlerts, REFRESH_MS);
    tickIntervalId = setInterval(() => { now = Date.now(); }, 5_000);
  });
  onDestroy(() => {
    if (intervalId) clearInterval(intervalId);
    if (tickIntervalId) clearInterval(tickIntervalId);
  });

  const secsAgo = $derived(feed.fetchedAt ? Math.floor((now - feed.fetchedAt) / 1000) : null);
  const totalFlow = $derived(
    feed.summary ? feed.summary.total_buy_usd + feed.summary.total_sell_usd : 0
  );
  const buyRatio = $derived(totalFlow > 0 && feed.summary ? feed.summary.total_buy_usd / totalFlow : 0.5);
</script>

<div class="af-wrap">
  <div class="af-header">
    <span class="af-title">WHALE ALERTS</span>
    {#if newCount > 0}
      <span class="af-badge">{newCount} new</span>
    {/if}
    <span class="af-refresh-status">
      {#if loading}
        <span class="af-spinner">↻</span>
      {:else if secsAgo !== null}
        {secsAgo}s ago
      {/if}
    </span>
  </div>

  <!-- Flow bar -->
  {#if totalFlow > 0 && feed.summary}
  <div class="af-flow-bar">
    <div class="af-bar-track">
      <div class="af-bar-buy" style="width:{(buyRatio*100).toFixed(1)}%"></div>
    </div>
    <div class="af-bar-labels">
      <span style="color:#22AB94">↑ {fmtUsd(feed.summary.total_buy_usd)}</span>
      <span class="af-liq-total">청산 {fmtUsd(feed.summary.total_liq_usd)}</span>
      <span style="color:#F23645">↓ {fmtUsd(feed.summary.total_sell_usd)}</span>
    </div>
  </div>
  {/if}

  <!-- Event list -->
  <div class="af-list">
    {#if error}
      <div class="af-error">{error}</div>
    {:else if feed.events.length === 0 && !loading}
      <div class="af-empty">최근 5분간 $50K 이상 알람 없음</div>
    {:else}
      {#each feed.events as ev: AlertEvent (ev.id)}
        <div class="af-row" class:af-row--new={isNew(ev.ts)}>
          <span class="af-glyph">{glyph(ev)}</span>
          <span class="af-sym">{ev.symbol.replace('USDT', '')}</span>
          <span class="af-type" style="color:{tierColor(ev.tier)}">{TYPE_KO[ev.type]}</span>
          <span class="af-dir" style="color:{dirColor(ev.direction)}">{DIR_KO[ev.direction] ?? ev.direction}</span>
          <span class="af-size">{fmtUsd(ev.size_usd)}</span>
          {#if ev.delta_pct != null}
            <span class="af-delta" style="color:{dirColor(ev.direction)}">{ev.delta_pct > 0 ? '+' : ''}{ev.delta_pct.toFixed(1)}%</span>
          {:else}
            <span></span>
          {/if}
          <span class="af-time" title={fmtTime(ev.ts)}>{relTime(ev.ts)}</span>
        </div>
      {/each}
    {/if}
  </div>

  <div class="af-footer">
    Binance Futures · 30s 자동갱신 · {feed.count}건
  </div>
</div>

<style>
  .af-wrap {
    background: var(--term-surface-0, #0a0a12);
    display: flex;
    flex-direction: column;
    height: 100%;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: var(--term-text-1, #8a8aaa);
    overflow: hidden;
  }
  .af-header {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    border-bottom: 1px solid var(--term-border, #1a1a28);
    flex-shrink: 0;
  }
  .af-title {
    font-weight: 700;
    font-size: 11px;
    letter-spacing: 0.08em;
    color: var(--term-text-0, #e0e0f0);
    flex: 1;
  }
  .af-badge {
    background: #F23645;
    color: #fff;
    font-size: 11px;
    padding: 1px 5px;
    border-radius: 10px;
    font-weight: 700;
    letter-spacing: 0.04em;
  }
  .af-refresh-status { font-size: 11px; color: var(--term-text-2, #404060); }
  .af-spinner { animation: spin 1s linear infinite; display: inline-block; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .af-flow-bar {
    padding: 5px 10px;
    border-bottom: 1px solid var(--term-border, #1a1a28);
    flex-shrink: 0;
  }
  .af-bar-track {
    height: 3px;
    background: #F23645;
    border-radius: 2px;
    overflow: hidden;
    margin-bottom: 4px;
  }
  .af-bar-buy {
    height: 100%;
    background: #22AB94;
    border-radius: 2px 0 0 2px;
  }
  .af-bar-labels {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    letter-spacing: 0.03em;
  }
  .af-liq-total { color: #d6a347; }

  .af-list {
    flex: 1;
    overflow-y: auto;
    padding: 2px 0;
  }
  .af-row {
    display: grid;
    grid-template-columns: 16px 44px 28px 50px 50px 36px 30px;
    align-items: center;
    gap: 3px;
    padding: 3px 10px;
    border-bottom: 1px solid var(--term-border, #1a1a28);
    transition: background 0.1s;
  }
  .af-row:last-child { border-bottom: none; }
  .af-row:hover { background: var(--term-surface-1, #111120); }
  .af-row--new { border-left: 2px solid var(--brand, #5b5bd6); }
  .af-glyph { text-align: center; font-size: 11px; }
  .af-sym  { font-weight: 700; color: var(--term-text-0, #e0e0f0); font-size: 11px; }
  .af-type { font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase; }
  .af-dir  { font-size: 11px; letter-spacing: 0.03em; }
  .af-size { text-align: right; font-variant-numeric: tabular-nums; color: var(--term-text-0, #e0e0f0); font-size: 11px; }
  .af-delta { font-size: 11px; text-align: right; }
  .af-time  { font-size: 11px; color: var(--term-text-2, #404060); text-align: right; }

  .af-error { padding: 12px 10px; color: #F23645; font-size: 11px; }
  .af-empty { padding: 12px 10px; color: var(--term-text-2, #404060); text-align: center; font-size: 11px; }

  .af-footer {
    padding: 4px 10px;
    font-size: 11px;
    letter-spacing: 0.04em;
    color: var(--term-text-2, #404060);
    border-top: 1px solid var(--term-border, #1a1a28);
    flex-shrink: 0;
  }

  .af-list::-webkit-scrollbar { width: 3px; }
  .af-list::-webkit-scrollbar-track { background: transparent; }
  .af-list::-webkit-scrollbar-thumb { background: var(--term-border, #1a1a28); border-radius: 2px; }
</style>
