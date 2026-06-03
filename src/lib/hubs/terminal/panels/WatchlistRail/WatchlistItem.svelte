<script lang="ts">
  import type { MiniTickerUpdate } from '$lib/api/binance';

  interface Props {
    sym: string;
    tick: MiniTickerUpdate | undefined;
    spark: number[];
    active: boolean;
    focused?: boolean;
    folded: boolean;
    /** When true, render Binance-style 2-line rows (logo | name+Δ+spark | price+FR).
     *  Default is the original card layout (multi-line, sparkline right). */
    compact?: boolean;
    fr?: number | null;
    alphaScore?: number | null;
    favorited?: boolean;
    onSelect: (sym: string) => void;
    onRemove: (sym: string) => void;
    onNewTab?: (sym: string) => void;
    onToggleFav?: (sym: string) => void;
    persona?: string;
  }

  let { sym, tick, spark, active, focused = false, folded, compact = false, fr = null, alphaScore = null, favorited = false, persona = 'discretionary', onSelect, onRemove, onNewTab, onToggleFav }: Props = $props();

  function handleClick(e: MouseEvent) {
    if ((e.metaKey || e.ctrlKey) && onNewTab) {
      e.preventDefault();
      onNewTab(sym);
    } else {
      onSelect(sym);
    }
  }

  const frClass = $derived(fr === null ? '' : fr > 0 ? 'fr-long' : 'fr-short');

  // W-0541 PR5: persona determines which secondary metadata to show
  const showQuantMeta = $derived(persona === 'quant' || persona === 'hybrid');
  const showSpark = $derived(persona !== 'quant');

  // Coin logo — reset on sym change so stale failure state doesn't bleed across rows
  let imgFailed = $state(false);
  $effect(() => { sym; imgFailed = false; });

  const logoUrl = $derived(
    `https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/32/color/${shortName(sym).toLowerCase()}.png`
  );

  const KNOWN_COLORS: Record<string, string> = {
    BTC: '#F7931A', ETH: '#627EEA', SOL: '#9945FF', BNB: '#F3BA2F',
    XRP: '#346AA9', ADA: '#0033AD', AVAX: '#E84142', DOGE: '#BA9F33',
    DOT: '#E6007A', LINK: '#2A5ADA', MATIC: '#8247E5', UNI: '#FF007A',
    LTC: '#BFBBBB', BCH: '#8DC351', ATOM: '#2E3148', FIL: '#0090FF',
    TRX: '#EF0027', NEAR: '#00C08B', OP: '#FF0420', ARB: '#28A0F0',
    SUI: '#4CA3FF', APT: '#31C9E5', INJ: '#00B2FF', SEI: '#9D4EDD',
    TON: '#0088CC', FTM: '#1969FF', ALGO: '#00B4D8',
  };

  function tokenColor(s: string): string {
    const base = s.replace(/USDT$/, '');
    if (KNOWN_COLORS[base]) return KNOWN_COLORS[base];
    let h = 0;
    for (let i = 0; i < base.length; i++) h = ((h << 5) - h + base.charCodeAt(i)) & 0xffffffff;
    return `hsl(${Math.abs(h) % 360},68%,52%)`;
  }

  function tokenLabel(s: string): string {
    return s.replace(/USDT$/, '').slice(0, 2);
  }

  // 8-segment discrete alpha bar: ████████░░
  function alphaBar(score: number): string {
    const filled = Math.round(score * 8);
    return '█'.repeat(filled) + '░'.repeat(8 - filled);
  }

  function shortName(s: string) { return s.replace(/USDT$/, ''); }

  function fmtPrice(p: number): string {
    if (p >= 10000) return p.toLocaleString('en-US', { maximumFractionDigits: 0 });
    if (p >= 1000)  return p.toLocaleString('en-US', { maximumFractionDigits: 2 });
    if (p >= 1)     return p.toFixed(3);
    return p.toPrecision(4);
  }

  function fmtChange(c: number): string {
    return (c >= 0 ? '+' : '') + c.toFixed(2) + '%';
  }

  function sparkPolyline(prices: number[], W = 38, H = 12): string {
    const min = Math.min(...prices), max = Math.max(...prices);
    const range = max - min || 1;
    return prices
      .map((p, i) => `${((i / (prices.length - 1)) * W).toFixed(1)},${(H - ((p - min) / range) * H).toFixed(1)}`)
      .join(' ');
  }
</script>

<li class="symbol-item">
  <div
    class="symbol-row"
    class:active
    class:focused
    class:symbol-row--exchange={compact && !folded}
    role="button"
    tabindex="0"
    onclick={handleClick}
    onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect(sym); }}
    title="{sym} · ⌘click = new tab"
  >
    {#if compact && !folded}
      <!-- ── Exchange-style 2-line row ── 3-col grid: logo | name+Δ+spark | price+FR -->
      <span class="cell-logo">
        {#if !imgFailed}
          <img
            class="coin-img"
            src={logoUrl}
            alt={shortName(sym)}
            width="24"
            height="24"
            onerror={() => { imgFailed = true; }}
          />
        {:else}
          <span class="coin-fallback" style="background:{tokenColor(sym)}">{tokenLabel(sym)}</span>
        {/if}
      </span>
      <span class="cell-left">
        <span class="cell-name">
          {shortName(sym)}
          {#if onToggleFav}
            <button
              type="button"
              class="fav-btn fav-btn--inline"
              class:fav-btn--on={favorited}
              onclick={(e) => { e.stopPropagation(); onToggleFav?.(sym); }}
              title={favorited ? 'Remove from favourites' : 'Add to favourites'}
              aria-label={favorited ? 'Unfavourite' : 'Favourite'}
            >★</button>
          {/if}
        </span>
        <span class="cell-meta">
          {#if tick}
            <span class="cell-chg" class:up={tick.change24h >= 0} class:dn={tick.change24h < 0}>{fmtChange(tick.change24h)}</span>
          {:else}
            <span class="cell-chg cell-loading">…</span>
          {/if}
          {#if spark.length >= 3}
            <svg class="row-spark" viewBox="0 0 48 24" width="48" height="24" aria-hidden="true">
              <polyline
                points={sparkPolyline(spark, 48, 24)}
                fill="none"
                stroke={tick && tick.change24h >= 0 ? '#22AB94' : '#F23645'}
                stroke-width="1.3"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          {/if}
        </span>
      </span>
      <span class="cell-right">
        {#if tick}
          <span class="cell-price">{fmtPrice(tick.price)}</span>
        {:else}
          <span class="cell-price cell-loading">…</span>
        {/if}
        <span class="cell-fr {frClass}">
          {#if fr !== null}{fr > 0 ? '+' : ''}{(fr * 100).toFixed(3)}%{:else}—{/if}
        </span>
      </span>
    {:else}
      <!-- ── Cards layout (default) ── -->
      {#if onToggleFav}
        <button
          type="button"
          class="fav-btn"
          class:fav-btn--on={favorited}
          onclick={(e) => { e.stopPropagation(); onToggleFav?.(sym); }}
          title={favorited ? 'Remove from favourites' : 'Add to favourites'}
          aria-label={favorited ? 'Unfavourite' : 'Favourite'}
        >★</button>
      {/if}
      <span class="sym-name">{shortName(sym)}</span>
      {#if !folded}
        <span class="sym-right">
          {#if tick}
            <span class="sym-price">{fmtPrice(tick.price)}</span>
            <span class="sym-bottom">
              <span class="sym-change" class:up={tick.change24h >= 0} class:dn={tick.change24h < 0}>
                {fmtChange(tick.change24h)}
              </span>
              {#if showSpark && spark.length >= 3}
                <svg class="sparkline" viewBox="0 0 30 14" width="30" height="14">
                  <polyline
                    points={sparkPolyline(spark, 30, 14)}
                    fill="none"
                    stroke={tick.change24h >= 0 ? '#22AB94' : '#F23645'}
                    stroke-width="1.2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              {/if}
            </span>
            {#if showQuantMeta && (alphaScore !== null || fr !== null)}
              <span class="sym-quant">
                {#if alphaScore !== null}
                  <span class="alpha-bar" title="Alpha score {(alphaScore * 100).toFixed(0)}%">{alphaBar(alphaScore)}</span>
                {/if}
                {#if fr !== null}
                  <span class="sym-fr {frClass}" title="Funding rate">{fr > 0 ? '+' : ''}{(fr * 100).toFixed(3)}%</span>
                {/if}
              </span>
            {/if}
          {:else}
            <span class="sym-loading">…</span>
          {/if}
        </span>
        <button
          type="button"
          class="del-btn"
          onclick={(e) => { e.stopPropagation(); onRemove(sym); }}
          title="Remove"
          aria-label="Remove {sym}"
        >×</button>
      {/if}
    {/if}
  </div>
</li>

<style>
  .symbol-item { position: relative; }

  .symbol-row {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: var(--term-list-row-h, 26px);
    padding: 2px 8px;
    background: transparent;
    border: none;
    border-bottom: 1px solid color-mix(in srgb, var(--term-border, var(--g3)) 85%, transparent);
    color: var(--term-text-1, var(--g8));
    font-family: var(--fm);
    font-size: 11px;
    cursor: pointer;
    text-align: left;
    transition: background 0.1s, color 0.1s, border-color 0.1s;
  }

  :global([data-density='compact']) .symbol-row {
    padding: 0 8px;
    min-height: 23px;
  }

  .symbol-row:hover {
    background: var(--term-surface-2, var(--g2));
    color: var(--term-text-0, var(--g9));
  }
  .symbol-row:hover .del-btn { opacity: 1; }

  .symbol-row.active {
    background: color-mix(in srgb, var(--brand) 8%, var(--term-surface-2, var(--g2)));
    color: var(--term-text-0, var(--g9));
    border-left: 2px solid var(--brand);
    padding-left: 6px;
  }

  .symbol-row.focused:not(.active) {
    background: rgba(255,255,255,0.04);
    outline: 1px solid var(--term-border, var(--g4));
    outline-offset: -1px;
  }

  .del-btn {
    background: none;
    border: none;
    color: var(--term-text-2, var(--g5));
    cursor: pointer;
    font-size: 12px;
    line-height: 1;
    padding: 0 0 0 4px;
    opacity: 0;
    transition: opacity 0.1s, color 0.1s;
    flex-shrink: 0;
  }
  .del-btn:hover { color: #F23645; }

  .fav-btn {
    background: none;
    border: none;
    color: var(--term-text-2, var(--g4));
    cursor: pointer;
    font-size: var(--ui-text-xs);
    line-height: 1;
    padding: 0 1px 0 0;
    flex-shrink: 0;
    opacity: 0;
    transition: opacity 0.1s, color 0.1s;
  }
  .symbol-row:hover .fav-btn { opacity: 1; }
  .fav-btn--on { opacity: 1 !important; color: var(--amb, #d6a347) !important; }

  /* ── Cards layout ── */
  .sym-name {
    font-weight: 600;
    letter-spacing: 0.015em;
    font-size: 11px;
  }

  .sym-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 2px;
  }

  .sym-price {
    font-size: var(--ui-text-xs);
    color: var(--term-text-0, var(--g9));
    letter-spacing: 0.01em;
    font-variant-numeric: tabular-nums;
  }

  .sym-bottom {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .sym-change {
    font-size: var(--ui-text-xs);
    letter-spacing: 0.04em;
    font-variant-numeric: tabular-nums;
  }
  .sym-change.up { color: #22AB94; }
  .sym-change.dn { color: #F23645; }

  .sparkline { display: block; flex-shrink: 0; }

  .sym-quant {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-top: 1px;
  }

  .alpha-bar {
    font-size: var(--ui-text-xs);
    letter-spacing: -0.5px;
    color: var(--brand);
    line-height: 1;
    font-variant-numeric: tabular-nums;
  }

  .sym-fr {
    font-size: var(--ui-text-xs);
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.02em;
  }
  .fr-long  { color: var(--amb, #d6a347); }
  .fr-short { color: #38bdf8; }

  .sym-loading {
    font-size: var(--ui-text-xs);
    color: var(--term-text-2, var(--g5));
    animation: blink 1.2s infinite;
  }
  @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

  /* ── Exchange-style 2-line rows ──────────────────────────────────────────
     3-col grid: logo(26px) | name+Δ+spark(1fr) | price+FR(auto)
     MUST stay in lockstep with WatchlistRail .sort-header grid. */
  .symbol-row--exchange {
    display: grid;
    grid-template-columns: 32px 1fr auto;
    column-gap: 6px;
    align-items: center;
    padding: 4px 8px;
    min-height: 46px;
  }

  .cell-logo {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .coin-img {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: block;
    object-fit: cover;
  }

  .coin-fallback {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--fb, 'Space Grotesk', sans-serif);
    font-size: 11px;
    font-weight: 700;
    color: #fff;
    letter-spacing: 0;
    flex-shrink: 0;
  }

  .cell-left {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
    overflow: hidden;
  }

  .cell-name {
    display: flex;
    align-items: center;
    gap: 3px;
    font-family: var(--fb, 'Space Grotesk', sans-serif);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.01em;
    color: var(--term-text-0, var(--g9));
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.2;
  }

  .cell-meta {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .cell-chg {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.02em;
    border-radius: 3px;
    padding: 1px 4px;
    line-height: 1.5;
    flex-shrink: 0;
  }
  .cell-chg.up { color: #22AB94; background: rgba(34,171,148,0.12); }
  .cell-chg.dn { color: #F23645; background: rgba(242,54,69,0.12); }

  .row-spark { flex-shrink: 0; opacity: 0.75; display: block; }

  .cell-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 2px;
    flex-shrink: 0;
  }

  .cell-price {
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    font-variant-numeric: tabular-nums;
    font-weight: 500;
    letter-spacing: -0.01em;
    color: var(--term-text-0, var(--g9));
    white-space: nowrap;
    line-height: 1.2;
  }

  .cell-fr {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.01em;
    white-space: nowrap;
    line-height: 1.2;
  }

  .cell-loading { color: var(--g5); }

  /* Inline fav — always-visible in exchange rows (no hover cue at this height) */
  .fav-btn--inline {
    opacity: 0.35;
    font-size: 11px;
    padding: 0;
    transition: opacity 0.1s, color 0.1s;
  }
  .fav-btn--inline:hover { opacity: 1; }
  .fav-btn--inline.fav-btn--on { opacity: 1; }
</style>
