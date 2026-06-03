<script lang="ts">
  import type { FlowCardPayload, FlowLayerH1 } from '$lib/agent/directives';
  interface Props { payload: FlowCardPayload; }
  let { payload }: Props = $props();

  const CHAIN_LABEL: Record<string, string> = {
    ethereum: 'ETH', bsc: 'BSC', solana: 'SOL', base: 'Base',
    arbitrum: 'ARB', polygon: 'POL', avalanche: 'AVAX', optimism: 'OP',
  };

  function fmtUsd(v: number | null | undefined): string {
    if (!v) return '—';
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000)     return `$${(v / 1_000).toFixed(0)}K`;
    return `$${v.toFixed(0)}`;
  }
  function fmtPct(r: number): string {
    return `${(r * 100).toFixed(1)}%`;
  }
  function buyColor(r: number): string {
    return r >= 0.55 ? '#4caf50' : r <= 0.45 ? '#f44336' : '#f0a500';
  }
  function barWidth(r: number): string {
    return `${Math.round(r * 100)}%`;
  }

  function flowRow(h1: FlowLayerH1) {
    const total = h1.buy_usd + h1.sell_usd;
    return { ...h1, total };
  }

  const dexChains = $derived(payload.dex?.chains ?? []);
  const perpExchanges = $derived(payload.perp?.exchanges ?? []);
  const total = $derived(flowRow(payload.total));
</script>

<div class="fc">
  <!-- header -->
  <div class="fc-header">
    <span class="fc-symbol">{payload.symbol}</span>
    <span class="fc-title">통합 수급</span>
  </div>

  <!-- total summary -->
  <div class="fc-total">
    <div class="fc-bar-wrap">
      <div class="fc-bar-buy" style="width:{barWidth(payload.total.buy_ratio)}"></div>
      <div class="fc-bar-sell" style="width:{barWidth(1 - payload.total.buy_ratio)}"></div>
    </div>
    <div class="fc-total-nums">
      <span class="fc-buy-val">{fmtUsd(total.buy_usd)}</span>
      <span class="fc-ratio" style="color:{buyColor(payload.total.buy_ratio)}">{fmtPct(payload.total.buy_ratio)} 매수</span>
      <span class="fc-sell-val">{fmtUsd(total.sell_usd)}</span>
    </div>
  </div>

  <!-- DEX layer -->
  {#if dexChains.length > 0}
    <div class="fc-section">
      <div class="fc-section-header">
        <span class="fc-section-label">DEX 온체인</span>
        {#if payload.dex?.totals?.h1}
          <span class="fc-section-sum" style="color:{buyColor(payload.dex.totals.h1.buy_ratio)}">
            {fmtPct(payload.dex.totals.h1.buy_ratio)}
          </span>
          <span class="fc-section-vol">{fmtUsd(payload.dex.totals.h1.buy_usd + payload.dex.totals.h1.sell_usd)}</span>
        {/if}
      </div>
      {#each dexChains as ch}
        {@const r = flowRow(ch.h1)}
        <div class="fc-row">
          <span class="fc-row-label">{CHAIN_LABEL[ch.chain] ?? ch.chain.toUpperCase()}</span>
          <div class="fc-mini-bar">
            <div class="fc-mini-buy" style="width:{barWidth(ch.h1.buy_ratio)}"></div>
          </div>
          <span class="fc-row-pct" style="color:{buyColor(ch.h1.buy_ratio)}">{fmtPct(ch.h1.buy_ratio)}</span>
          <span class="fc-row-vol">{fmtUsd(r.total)}</span>
        </div>
      {/each}
    </div>
  {/if}

  <!-- Perp layer -->
  {#if perpExchanges.length > 0}
    <div class="fc-section">
      <div class="fc-section-header">
        <span class="fc-section-label">선물 Perp</span>
      </div>
      {#each perpExchanges as ex}
        {#if ex.available !== false}
          {@const r = flowRow(ex.h1)}
          <div class="fc-row">
            <span class="fc-row-label">{ex.exchange}</span>
            <div class="fc-mini-bar">
              <div class="fc-mini-buy" style="width:{barWidth(ex.h1.buy_ratio)}"></div>
            </div>
            <span class="fc-row-pct" style="color:{buyColor(ex.h1.buy_ratio)}">{fmtPct(ex.h1.buy_ratio)}</span>
            <span class="fc-row-vol">{fmtUsd(r.total)}</span>
          </div>
        {/if}
      {/each}
    </div>
  {/if}

  <div class="fc-footer">1h 기준 · DEX 거래 건수 비율 · Perp 테이커</div>
</div>

<style>
.fc {
  display: flex; flex-direction: column; gap: 7px;
  background: #0e0e1a; border: 1px solid #2a2a3a; border-radius: 8px;
  padding: 10px 12px; width: 100%;
}
.fc-header {
  display: flex; align-items: center; gap: 6px;
}
.fc-symbol { font-size: 13px; font-weight: 700; color: #c8d8e8; font-family: monospace; }
.fc-title  { font-size: var(--ui-text-xs); color: #5a6a7a; }

.fc-total { display: flex; flex-direction: column; gap: 4px; }
.fc-bar-wrap {
  display: flex; height: 5px; border-radius: 3px; overflow: hidden; background: #1a1a2e;
}
.fc-bar-buy  { background: #4caf50; height: 100%; }
.fc-bar-sell { background: #f44336; height: 100%; }
.fc-total-nums {
  display: flex; gap: 8px; align-items: center; font-size: var(--ui-text-xs);
}
.fc-buy-val  { color: #4caf50; }
.fc-sell-val { color: #f44336; }
.fc-ratio    { font-weight: 700; }

.fc-section { display: flex; flex-direction: column; gap: 3px; }
.fc-section-header {
  display: flex; align-items: center; gap: 6px;
  border-top: 1px solid #1a1a2e; padding-top: 5px;
}
.fc-section-label { font-size: var(--ui-text-xs); color: #4a5a6a; text-transform: uppercase; letter-spacing: 0.04em; flex: 1; }
.fc-section-sum   { font-size: var(--ui-text-xs); font-weight: 600; }
.fc-section-vol   { font-size: var(--ui-text-xs); color: #5a6a7a; }

.fc-row {
  display: grid; grid-template-columns: 2.5rem 1fr 3rem 3.5rem; gap: 4px; align-items: center;
}
.fc-row-label { font-size: var(--ui-text-xs); color: #5a7a9a; }
.fc-mini-bar  { height: 4px; background: #1a1a2e; border-radius: 2px; overflow: hidden; }
.fc-mini-buy  { background: #4caf50; height: 100%; transition: width 0.3s; }
.fc-row-pct   { font-size: var(--ui-text-xs); font-weight: 600; text-align: right; }
.fc-row-vol   { font-size: var(--ui-text-xs); color: #5a6a7a; text-align: right; }

.fc-footer {
  font-size: var(--ui-text-xs); color: #3a4a5a;
  border-top: 1px solid #1a1a2e; padding-top: 4px;
}
</style>
