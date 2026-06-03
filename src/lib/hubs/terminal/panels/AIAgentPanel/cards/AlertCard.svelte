<script lang="ts">
  import type { AlertCardPayload, AlertEvent, AlertTier, AlertEventType } from '$lib/agent/directives';
  interface Props { payload: AlertCardPayload; }
  let { payload }: Props = $props();

  // Tier display config
  const TIER_EMOJI: Record<AlertEventType, Record<AlertTier, string>> = {
    trade:    { xl: '💥', lg: '🦈', md: '🐳', sm: '🐟' },
    liq:      { xl: '💀', lg: '🚨', md: '🔴', sm: '⚠️' },
    oi_spike: { xl: '⚡⚡', lg: '⚡', md: '📈', sm: '↗️' },
  };
  const TIER_COLOR: Record<AlertTier, string> = {
    xl: '#ff4444', lg: '#ff7b00', md: '#f0c040', sm: '#a0a0b0',
  };
  const DIR_LABEL: Record<string, string> = {
    buy: '매수', sell: '매도',
    long_liq: '롱청산', short_liq: '숏청산',
    oi_long: 'OI ↑', oi_short: 'OI ↓',
  };
  const DIR_COLOR: Record<string, string> = {
    buy: '#4caf50', sell: '#f44336',
    long_liq: '#f44336', short_liq: '#4caf50',
    oi_long: '#4caf50', oi_short: '#f44336',
  };
  const TYPE_LABEL: Record<AlertEventType, string> = {
    trade: '체결', liq: '청산', oi_spike: 'OI',
  };

  function fmtUsd(v: number): string {
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000)     return `$${(v / 1_000).toFixed(0)}K`;
    return `$${v.toFixed(0)}`;
  }
  function fmtTime(ts: number): string {
    const d = new Date(ts);
    return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }
  function emoji(ev: AlertEvent): string {
    return TIER_EMOJI[ev.type]?.[ev.tier] ?? '·';
  }
  function tierColor(tier: AlertTier): string {
    return TIER_COLOR[tier] ?? '#a0a0b0';
  }
  function dirColor(dir: string): string {
    return DIR_COLOR[dir] ?? '#a0a0b0';
  }

  const totalFlow = $derived(payload.summary.total_buy_usd + payload.summary.total_sell_usd);
  const buyRatio = $derived(totalFlow > 0 ? payload.summary.total_buy_usd / totalFlow : 0.5);
</script>

<div class="ac-wrap">
  <div class="ac-header">
    <span class="ac-title">🐋 고래 알람</span>
    <span class="ac-meta">{payload.lookback_min}분 · {payload.query_symbols.slice(0,3).join(' ')} {payload.query_symbols.length > 3 ? `+${payload.query_symbols.length-3}` : ''}</span>
  </div>

  <!-- Summary bar -->
  {#if totalFlow > 0}
  <div class="ac-summary">
    <div class="ac-bar-wrap">
      <div class="ac-bar-buy" style="width:{(buyRatio*100).toFixed(1)}%"></div>
    </div>
    <div class="ac-bar-labels">
      <span style="color:#4caf50">매수 {fmtUsd(payload.summary.total_buy_usd)}</span>
      <span style="color:#a0a0b0">{(buyRatio*100).toFixed(0)}%</span>
      <span style="color:#f44336">매도 {fmtUsd(payload.summary.total_sell_usd)}</span>
    </div>
  </div>
  {/if}

  {#if payload.summary.total_liq_usd > 0}
  <div class="ac-liq-row">
    <span class="ac-liq-label">청산 합계</span>
    <span class="ac-liq-val">{fmtUsd(payload.summary.total_liq_usd)}</span>
  </div>
  {/if}

  <!-- Event list -->
  <div class="ac-events">
    {#each payload.events as ev (ev.id)}
    <div class="ac-event">
      <span class="ac-emoji">{emoji(ev)}</span>
      <span class="ac-sym">{ev.symbol.replace('USDT','')}</span>
      <span class="ac-type" style="color:{tierColor(ev.tier)}">{TYPE_LABEL[ev.type]}</span>
      <span class="ac-dir" style="color:{dirColor(ev.direction)}">{DIR_LABEL[ev.direction] ?? ev.direction}</span>
      <span class="ac-size">{fmtUsd(ev.size_usd)}</span>
      {#if ev.delta_pct != null}
        <span class="ac-delta" style="color:{dirColor(ev.direction)}">{ev.delta_pct > 0 ? '+' : ''}{ev.delta_pct.toFixed(1)}%</span>
      {/if}
      <span class="ac-time">{fmtTime(ev.ts)}</span>
    </div>
    {/each}

    {#if payload.events.length === 0}
      <div class="ac-empty">최근 {payload.lookback_min}분간 {fmtUsd(100_000)} 이상 알람 없음</div>
    {/if}
  </div>

  <div class="ac-footer">Binance Futures 공개 API · 체결/청산/OI</div>
</div>

<style>
  .ac-wrap {
    background: #0e0e1a;
    border: 1px solid #2a2a3a;
    border-radius: 8px;
    padding: 10px 12px;
    font-size: 12px;
    color: #c8c8d8;
    min-width: 260px;
  }
  .ac-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }
  .ac-title { font-weight: 600; font-size: 13px; color: #e0e0f0; }
  .ac-meta  { font-size: 11px; color: #606080; }

  .ac-summary { margin-bottom: 6px; }
  .ac-bar-wrap {
    height: 6px;
    background: #f44336;
    border-radius: 3px;
    overflow: hidden;
    margin-bottom: 3px;
  }
  .ac-bar-buy {
    height: 100%;
    background: #4caf50;
    border-radius: 3px 0 0 3px;
    transition: width 0.3s;
  }
  .ac-bar-labels {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
  }

  .ac-liq-row {
    display: flex;
    justify-content: space-between;
    padding: 4px 0;
    border-top: 1px solid #1e1e2e;
    border-bottom: 1px solid #1e1e2e;
    margin-bottom: 6px;
    font-size: 11px;
  }
  .ac-liq-label { color: #808098; }
  .ac-liq-val   { color: #f0a040; font-weight: 600; }

  .ac-events { display: flex; flex-direction: column; gap: 3px; }
  .ac-event {
    display: grid;
    grid-template-columns: 20px 52px 32px 48px 56px auto 48px;
    align-items: center;
    gap: 4px;
    padding: 3px 0;
    border-bottom: 1px solid #16162a;
    font-size: 11px;
  }
  .ac-event:last-child { border-bottom: none; }
  .ac-emoji { text-align: center; font-size: 12px; }
  .ac-sym   { font-weight: 600; color: #d0d0e8; }
  .ac-type  { font-size: 11px; text-transform: uppercase; }
  .ac-dir   { font-size: 11px; }
  .ac-size  { text-align: right; font-variant-numeric: tabular-nums; color: #e0e0e8; }
  .ac-delta { font-size: 11px; text-align: right; }
  .ac-time  { font-size: 11px; color: #505068; text-align: right; }

  .ac-empty { color: #505068; text-align: center; padding: 8px 0; font-size: 11px; }
  .ac-footer {
    margin-top: 8px;
    font-size: 11px;
    color: #404058;
    text-align: right;
  }
</style>
