<script lang="ts">
  interface Props {
    dispSym: string;
    livePrice: number;
    change24h: number;
    high24h: number;
    low24h: number;
    volume24h: number;
    onSymbolTap?: () => void;
  }
  const { dispSym, livePrice, change24h, high24h, low24h, volume24h, onSymbolTap }: Props = $props();

  function formatPrice(v: number) {
    if (!v) return '—';
    return v >= 1000
      ? v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : v < 0.01
        ? v.toFixed(6)
        : v < 1
          ? v.toFixed(4)
          : v.toFixed(2);
  }
  function formatChange(c: number) {
    if (c == null) return '—';
    const sign = c > 0 ? '+' : '';
    return `${sign}${c.toFixed(2)}%`;
  }
  function formatVol(v: number) {
    if (!v) return '—';
    if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(2)}B`;
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
    return v.toFixed(0);
  }

  const priceClass = $derived(change24h > 0 ? 'pos' : change24h < 0 ? 'neg' : 'flat');
</script>

<div class="price-bar">
  <!-- Row 1: symbol + price + Δ% -->
  <button class="price-bar-sym" onclick={onSymbolTap} title="Change symbol" aria-label="Symbol picker">
    <span class="pb-sym">{dispSym}</span>
    {#if livePrice}
      <span class="pb-price">{formatPrice(livePrice)}</span>
      <span class="pb-change {priceClass}">{formatChange(change24h)}</span>
    {/if}
  </button>

  <!-- Row 2: 24h H / L / Vol -->
  {#if livePrice && (high24h || low24h || volume24h)}
    <div class="pb-stats" aria-label="24h price stats">
      {#if high24h}
        <span class="pb-stat"><span class="pb-stat-lbl">H</span><span class="pb-stat-val">{formatPrice(high24h)}</span></span>
      {/if}
      {#if low24h}
        <span class="pb-stat"><span class="pb-stat-lbl">L</span><span class="pb-stat-val">{formatPrice(low24h)}</span></span>
      {/if}
      {#if volume24h}
        <span class="pb-stat"><span class="pb-stat-lbl">Vol</span><span class="pb-stat-val">{formatVol(volume24h)}</span></span>
      {/if}
    </div>
  {/if}
</div>

<style>
  .price-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  .price-bar-sym {
    display: flex;
    align-items: baseline;
    gap: 5px;
    padding: 3px 8px;
    background: var(--term-surface-2, rgba(255, 255, 255, 0.05));
    border: 1px solid var(--term-border-strong, rgba(255, 255, 255, 0.15));
    border-radius: var(--term-radius-sm, 6px);
    cursor: pointer;
    transition: background 0.08s, border-color 0.08s;
    white-space: nowrap;
  }
  .price-bar-sym:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.22);
  }

  .pb-sym {
    font-family: var(--fb, 'Space Grotesk', sans-serif);
    font-weight: 700;
    font-size: 12px;
    letter-spacing: 0.03em;
    color: rgba(255, 255, 255, 0.95);
  }
  .pb-price {
    font-family: var(--fm, 'JetBrains Mono', monospace);
    font-size: 14px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.92);
    letter-spacing: -0.02em;
  }
  .pb-change {
    font-family: var(--fm, 'JetBrains Mono', monospace);
    font-size: 11px;
    font-weight: 500;
  }
  .pb-change.pos { color: var(--candle-up, #adca7c); }
  .pb-change.neg { color: var(--candle-down, #cf7f8f); }
  .pb-change.flat { color: rgba(255, 255, 255, 0.42); }

  .pb-stats {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
  }
  .pb-stat {
    display: flex;
    align-items: baseline;
    gap: 3px;
  }
  .pb-stat-lbl {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.35);
    letter-spacing: 0.04em;
  }
  .pb-stat-val {
    font-family: var(--fm, 'JetBrains Mono', monospace);
    font-size: 11px;
    color: rgba(255, 255, 255, 0.62);
  }
</style>
