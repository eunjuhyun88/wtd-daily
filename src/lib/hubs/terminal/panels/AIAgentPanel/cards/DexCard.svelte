<script lang="ts">
  import type { DexCardPayload } from '$lib/agent/directives';
  interface Props { payload: DexCardPayload; onquickpick?: (prompt: string) => void; }
  let { payload, onquickpick }: Props = $props();

  const CHAIN_LABEL: Record<string, string> = {
    bsc: 'BSC', ethereum: 'ETH', solana: 'SOL', base: 'Base',
    arbitrum: 'ARB', polygon: 'POL', avalanche: 'AVAX', optimism: 'OP',
  };
  const chainLabel = $derived(CHAIN_LABEL[payload.chain] ?? payload.chain?.toUpperCase() ?? '');
  const honeypotColor = $derived(payload.is_honeypot ? '#f44336' : '#4caf50');
  const honeypotText  = $derived(payload.is_honeypot ? '허니팟 ⚠' : '허니팟 없음');

  function fmtPrice(p: number): string {
    if (!p) return '—';
    if (p < 0.000001) return p.toExponential(3);
    if (p < 0.001)    return p.toFixed(8);
    if (p < 1)        return p.toFixed(5);
    return p.toFixed(3);
  }
  function fmtUsd(v: number | null | undefined): string {
    if (!v) return '—';
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000)     return `$${(v / 1_000).toFixed(0)}K`;
    return `$${v.toFixed(0)}`;
  }
  function fmtPct(v: number | null | undefined): string {
    if (v === null || v === undefined) return '—';
    return `${(v * 100).toFixed(1)}%`;
  }
  function buyColor(r: number | null | undefined): string {
    if (r === null || r === undefined) return '#6a7a8a';
    return r >= 0.55 ? '#4caf50' : r <= 0.45 ? '#f44336' : '#f0a500';
  }

  // derive buy/sell USD from volume * buy_ratio
  function splitVol(tf: 'm5' | 'h1' | 'h6' | 'h24') {
    const vol   = payload.volume?.[tf] ?? (tf === 'h24' ? payload.volume_h24 : undefined);
    const slot  = payload.txns?.[tf];
    const ratio = slot?.buy_ratio ?? (tf === 'h1' ? (payload.buy_ratio_h1 ?? null) : null);
    if (!vol || ratio === null) return null;
    return { buy: vol * ratio, sell: vol * (1 - ratio), ratio, vol };
  }

  const TFS = [
    { key: 'h24' as const, label: '24h' },
    { key: 'h6'  as const, label: '6h'  },
    { key: 'h1'  as const, label: '1h'  },
    { key: 'm5'  as const, label: '5m'  },
  ];

  const rows = $derived(TFS.map(t => ({ ...t, split: splitVol(t.key) })).filter(r => r.split));

  const h24txn = $derived(payload.txns?.h24);
</script>

<div class="dex-card">
  <!-- header -->
  <div class="dc-header">
    <div class="dc-name">
      <span class="dc-symbol">{payload.symbol}</span>
      <span class="dc-full">{payload.name}</span>
    </div>
    <div class="dc-badges">
      <span class="dc-chain">{chainLabel}</span>
      {#if payload.dex}<span class="dc-dex">{payload.dex}</span>{/if}
    </div>
  </div>

  <!-- price + liquidity -->
  <div class="dc-price-row">
    <span class="dc-price">${fmtPrice(payload.price_usd)}</span>
    <span class="dc-meta-val">유동성 {fmtUsd(payload.liquidity_usd)}</span>
    {#if payload.holder_count}<span class="dc-meta-val">홀더 {payload.holder_count.toLocaleString()}</span>{/if}
  </div>

  <!-- txn flow table -->
  {#if rows.length > 0}
    <div class="dc-section-label">수급 (온체인)</div>
    <div class="dc-txn-table">
      <div class="dc-txn-head">
        <span></span><span>매수</span><span>매도</span><span>비율</span>
      </div>
      {#each rows as row}
        {@const s = row.split!}
        <div class="dc-txn-row">
          <span class="dc-tf">{row.label}</span>
          <span class="dc-buy">{fmtUsd(s.buy)}</span>
          <span class="dc-sell">{fmtUsd(s.sell)}</span>
          <span class="dc-ratio" style="color:{buyColor(s.ratio)}">{fmtPct(s.ratio)}</span>
        </div>
      {/each}
    </div>
  {/if}

  <!-- txn count -->
  {#if h24txn}
    <div class="dc-txn-count">
      24h {(h24txn.buys + h24txn.sells).toLocaleString()}건
      <span class="dc-buy">매수 {h24txn.buys.toLocaleString()}</span>
      /
      <span class="dc-sell">매도 {h24txn.sells.toLocaleString()}</span>
    </div>
  {/if}

  <!-- security -->
  <div class="dc-security">
    <span style="color:{honeypotColor}">{honeypotText}</span>
    <span>세금 {((payload.buy_tax ?? 0) * 100).toFixed(0)}%/{((payload.sell_tax ?? 0) * 100).toFixed(0)}%</span>
    {#if payload.top10_holder_percent !== null && payload.top10_holder_percent !== undefined}
      <span>top10 {fmtPct(payload.top10_holder_percent)}</span>
    {/if}
  </div>

  <!-- CA -->
  {#if payload.address}
    <div class="dc-ca">
      <span class="dc-ca-label">CA</span>
      <span class="dc-ca-val">{payload.address.slice(0, 8)}…{payload.address.slice(-6)}</span>
    </div>
  {/if}

  <!-- follow-up options -->
  {#if payload.follow_ups?.length && onquickpick}
    <div class="dc-followups">
      {#each payload.follow_ups as fu}
        <button class="dc-fu-btn" onclick={() => onquickpick!(fu.prompt)}>
          <span class="dc-fu-n">{fu.n}</span>
          <span class="dc-fu-label">{fu.label}</span>
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
.dex-card {
  display: flex; flex-direction: column; gap: 6px;
  background: #0e0e1a; border: 1px solid #2a2a3a; border-radius: 8px;
  padding: 10px 12px; width: 100%;
}
.dc-header { display: flex; justify-content: space-between; align-items: flex-start; }
.dc-name { display: flex; flex-direction: column; gap: 1px; }
.dc-symbol { font-size: 13px; font-weight: 700; color: #c8d8e8; font-family: monospace; }
.dc-full { font-size: var(--ui-text-xs); color: #5a6a7a; }
.dc-badges { display: flex; gap: 4px; align-items: center; }
.dc-chain {
  font-size: var(--ui-text-xs); color: #7a9ab8; background: #1a2a3a;
  border-radius: 3px; padding: 1px 5px;
}
.dc-dex { font-size: var(--ui-text-xs); color: #4a5a6a; }

.dc-price-row { display: flex; gap: 10px; align-items: baseline; flex-wrap: wrap; }
.dc-price { font-size: 14px; font-weight: 600; color: #e0e8f0; font-family: monospace; }
.dc-meta-val { font-size: var(--ui-text-xs); color: #6a7a8a; }

.dc-section-label {
  font-size: var(--ui-text-xs); color: #4a5a6a; text-transform: uppercase;
  letter-spacing: 0.04em; border-top: 1px solid #1a1a2e; padding-top: 5px;
}
.dc-txn-table { display: grid; grid-template-columns: 2rem 1fr 1fr 2.5rem; gap: 2px 4px; }
.dc-txn-head {
  display: contents;
}
.dc-txn-head > span {
  font-size: var(--ui-text-xs); color: #3a4a5a; padding-bottom: 2px;
}
.dc-txn-row { display: contents; }
.dc-txn-row > span { font-size: var(--ui-text-xs); line-height: 1.6; }
.dc-tf { color: #5a6a7a; }
.dc-buy  { color: #4caf50; }
.dc-sell { color: #f44336; }
.dc-ratio { font-weight: 600; text-align: right; }

.dc-txn-count {
  font-size: var(--ui-text-xs); color: #5a6a7a;
  display: flex; gap: 4px; align-items: center;
}
.dc-security {
  display: flex; gap: 8px; flex-wrap: wrap;
  border-top: 1px solid #1a1a2e; padding-top: 5px;
  font-size: var(--ui-text-xs);
}
.dc-ca { display: flex; gap: 5px; align-items: center; }
.dc-ca-label { font-size: var(--ui-text-xs); color: #4a5a6a; }
.dc-ca-val { font-size: var(--ui-text-xs); color: #5a7a9a; font-family: monospace; }

.dc-followups {
  display: flex; flex-direction: column; gap: 4px;
  border-top: 1px solid #1a1a2e; padding-top: 6px; margin-top: 2px;
}
.dc-fu-btn {
  display: flex; align-items: flex-start; gap: 6px;
  background: #12121e; border: 1px solid #2a2a3a; border-radius: 5px;
  padding: 5px 8px; cursor: pointer; text-align: left; width: 100%;
  transition: background 0.12s, border-color 0.12s;
}
.dc-fu-btn:hover { background: #1a1a2e; border-color: #3a4a6a; }
.dc-fu-n {
  font-size: var(--ui-text-xs); color: #4a7ab8; font-weight: 700;
  min-width: 12px; flex-shrink: 0; font-family: monospace;
}
.dc-fu-label { font-size: var(--ui-text-xs); color: #8a9ab0; line-height: 1.4; }
</style>
