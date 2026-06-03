<script lang="ts">
  type Coin = {
    symbol: string;
    label: string;
    price: number | null;
    changePct: number | null;
    prices: number[];
    volume?: number | null;
  };

  let {
    topCoins,
    onCoinEnter,
    onCoinLeave,
    fmtPrice,
    fmtPct,
    compactUsd,
    pctColor,
    sparkColor,
    sparkPath,
    sparkArea
  }: {
    topCoins: Coin[];
    onCoinEnter: (symbol: string) => void;
    onCoinLeave: () => void;
    fmtPrice: (value: number | null | undefined) => string;
    fmtPct: (value: number | null | undefined) => string;
    compactUsd: (value: number | null | undefined) => string;
    pctColor: (value: number | null | undefined) => string;
    sparkColor: (prices: number[]) => string;
    sparkPath: (prices: number[], w?: number, h?: number) => string;
    sparkArea: (prices: number[], w?: number, h?: number) => string;
  } = $props();
</script>

<section class="card card-coins" aria-label="Top 10 cryptocurrencies">
  <div class="card-h">
    <span class="card-title">Top 10 Crypto</span>
    <span class="card-meta">
      <span class="src-chip">Binance</span>
      <span class="card-sub">24h sparkline</span>
    </span>
  </div>
  {#if topCoins.length > 0}
    <div class="coin-grid">
      {#each topCoins as c (c.symbol)}
        <a
          class="coin"
          href="/cogochi?symbol={c.symbol}"
          data-testid="daily-coin-card"
          onmouseenter={() => onCoinEnter(c.symbol)}
          onmouseleave={onCoinLeave}
        >
          <div class="coin-head">
            <span class="coin-label">{c.label}</span>
            <span class="coin-price">${fmtPrice(c.price)}</span>
          </div>
          <div class="coin-spark">
            <svg viewBox="0 0 80 24" preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <linearGradient id="grad-{c.symbol}" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color={sparkColor(c.prices)} stop-opacity="0.18" />
                  <stop offset="100%" stop-color={sparkColor(c.prices)} stop-opacity="0" />
                </linearGradient>
              </defs>
              <path d={sparkArea(c.prices)} fill="url(#grad-{c.symbol})" stroke="none" />
              <path d={sparkPath(c.prices)} stroke={sparkColor(c.prices)} stroke-width="1.5" fill="none" />
            </svg>
          </div>
          <div class="coin-meta">
            <span class="coin-change" style:color={pctColor(c.changePct)}>{fmtPct(c.changePct)}</span>
            <span class="coin-vol">{compactUsd(c.volume)}</span>
          </div>
        </a>
      {/each}
    </div>
  {:else}
    <div class="empty">Sparkline data is being prepared.</div>
  {/if}
</section>

<style>
  .card {
    background: #14110f;
    border: 1px solid rgba(249, 216, 194, 0.10);
    border-radius: 10px;
    padding: 18px;
    display: flex;
    flex-direction: column;
    transition: border-color 0.18s;
  }
  .card:hover { border-color: rgba(249, 216, 194, 0.18); }
  .card-coins { margin-bottom: 18px; }
  .card-h {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 14px;
  }
  .card-title {
    font-family: var(--sc-font-display, 'GT Sectra Display', 'Times New Roman', serif);
    font-size: 16px;
    font-weight: 600;
    color: #faf7eb;
    letter-spacing: 0.01em;
  }
  .card-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }
  .src-chip {
    font-size: 9.5px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #f9d8c2;
    border: 1px solid rgba(249, 216, 194, 0.22);
    padding: 2px 8px;
    border-radius: 999px;
    background: rgba(249, 216, 194, 0.04);
  }
  .card-sub {
    font-size: 11px;
    font-weight: 400;
    color: rgba(250, 247, 235, 0.42);
  }
  .coin-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 10px;
  }
  .coin {
    display: block;
    text-decoration: none;
    color: inherit;
    padding: 12px;
    background: #14110f;
    border: 1px solid rgba(249, 216, 194, 0.10);
    border-radius: 8px;
    min-width: 0;
    transition: border-color 0.18s, background 0.18s;
  }
  .coin:hover { border-color: rgba(249, 216, 194, 0.18); background: #1c1815; }
  .coin:focus-visible { outline: 2px solid #f9d8c2; outline-offset: 2px; }
  .coin-head { display: flex; justify-content: space-between; align-items: baseline; gap: 6px; }
  .coin-label {
    font-size: 12px;
    font-weight: 700;
    color: #faf7eb;
    letter-spacing: 0.04em;
  }
  .coin-price {
    font-size: 12px;
    color: rgba(250, 247, 235, 0.92);
    font-variant-numeric: tabular-nums;
    font-family: 'JetBrains Mono', ui-monospace, monospace;
  }
  .coin-spark { height: 26px; margin: 8px 0; }
  .coin-spark svg { width: 100%; height: 100%; display: block; }
  .coin-meta { display: flex; justify-content: space-between; font-size: 11px; }
  .coin-change {
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    font-family: 'JetBrains Mono', ui-monospace, monospace;
  }
  .coin-vol {
    color: rgba(250, 247, 235, 0.42);
    font-variant-numeric: tabular-nums;
    font-family: 'JetBrains Mono', ui-monospace, monospace;
  }
  .empty { color: rgba(250, 247, 235, 0.42); font-size: 13px; }

  @media (max-width: 1024px) {
    .coin-grid { grid-template-columns: repeat(2, 1fr); }
  }

  @media (max-width: 640px) {
    .coin-grid { grid-template-columns: 1fr; }
  }
</style>
