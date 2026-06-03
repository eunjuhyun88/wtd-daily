<script lang="ts">
  type Tile = {
    id: string;
    label: string;
    value: string;
    delta?: string;
    tone: 'pos' | 'neg' | 'neu' | 'hot' | 'cool';
    priority: 'critical' | 'desktop-only';
  };

  let {
    btc,
    feargreed,
    confluence,
    kimchi,
    macro,
    generatedAt
  }: {
    btc: { price: number | null; changePct: number | null } | null;
    feargreed: { value: number; classification: string } | null;
    confluence: { score?: number; regime?: string } | null;
    kimchi: { premium_pct?: number } | null;
    macro: {
      dxy?: { price?: number; changePct?: number } | null;
      spx?: { price?: number; changePct?: number } | null;
      us10y?: { price?: number; changePct?: number } | null;
    } | null;
    generatedAt: number;
  } = $props();

  function fmtPrice(n: number | null | undefined, digits = 0): string {
    if (n == null || !Number.isFinite(n)) return '—';
    return n.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
  }
  function fmtPct(n: number | null | undefined, digits = 2): string {
    if (n == null || !Number.isFinite(n)) return '—';
    const sign = n > 0 ? '+' : '';
    return sign + n.toFixed(digits) + '%';
  }
  function tone(n: number | null | undefined): 'pos' | 'neg' | 'neu' {
    if (n == null || !Number.isFinite(n)) return 'neu';
    if (n > 0) return 'pos';
    if (n < 0) return 'neg';
    return 'neu';
  }
  function fgTone(v: number | null | undefined): 'hot' | 'cool' | 'neu' {
    if (v == null) return 'neu';
    if (v >= 60) return 'hot';
    if (v <= 40) return 'cool';
    return 'neu';
  }

  const tiles = $derived<Tile[]>([
    {
      id: 'btc',
      label: 'BTC',
      value: btc?.price != null ? '$' + fmtPrice(btc.price) : '—',
      delta: btc?.changePct != null ? fmtPct(btc.changePct) : undefined,
      tone: tone(btc?.changePct),
      priority: 'critical'
    },
    {
      id: 'fg',
      label: 'F&G',
      value: feargreed?.value != null ? String(feargreed.value) : '—',
      delta: feargreed?.classification,
      tone: fgTone(feargreed?.value),
      priority: 'critical'
    },
    {
      id: 'conf',
      label: 'Conf',
      value: confluence?.score != null ? confluence.score.toFixed(0) : '—',
      delta: confluence?.regime,
      tone: 'neu',
      priority: 'critical'
    },
    {
      id: 'kimchi',
      label: 'Kimchi',
      value: kimchi?.premium_pct != null ? fmtPct(kimchi.premium_pct, 2) : '—',
      tone: tone(kimchi?.premium_pct),
      priority: 'critical'
    },
    {
      id: 'us10y',
      label: 'US10Y',
      value: macro?.us10y?.price != null ? macro.us10y.price.toFixed(2) + '%' : '—',
      delta: macro?.us10y?.changePct != null ? fmtPct(macro.us10y.changePct) : undefined,
      tone: tone(macro?.us10y?.changePct),
      priority: 'critical'
    },
    {
      id: 'dxy',
      label: 'DXY',
      value: macro?.dxy?.price != null ? macro.dxy.price.toFixed(2) : '—',
      delta: macro?.dxy?.changePct != null ? fmtPct(macro.dxy.changePct) : undefined,
      tone: tone(macro?.dxy?.changePct),
      priority: 'desktop-only'
    },
    {
      id: 'spx',
      label: 'SPX',
      value: macro?.spx?.price != null ? fmtPrice(macro.spx.price, 0) : '—',
      delta: macro?.spx?.changePct != null ? fmtPct(macro.spx.changePct) : undefined,
      tone: tone(macro?.spx?.changePct),
      priority: 'desktop-only'
    },
    {
      id: 'spxchg',
      label: 'SPX 1m',
      value: macro?.spx?.price != null ? fmtPrice(macro.spx.price, 0) : '—',
      delta: macro?.spx?.changePct != null ? fmtPct(macro.spx.changePct) : undefined,
      tone: tone(macro?.spx?.changePct),
      priority: 'desktop-only'
    },
    {
      id: 'ts',
      label: 'Updated',
      value: relativeTs(generatedAt),
      tone: 'neu',
      priority: 'desktop-only'
    }
  ]);

  function relativeTs(ms: number): string {
    if (!ms) return '—';
    const diffSec = Math.max(0, Math.floor((Date.now() - ms) / 1000));
    if (diffSec < 60) return diffSec + 's';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return diffMin + 'm';
    return Math.floor(diffMin / 60) + 'h';
  }
</script>

<aside class="pulse-strip" role="region" aria-label="Pulse strip — market snapshot">
  <ol>
    {#each tiles as tile (tile.id)}
      <li class="tile tile--{tile.tone}" data-priority={tile.priority}>
        <span class="tile-label">{tile.label}</span>
        <span class="tile-value">{tile.value}</span>
        {#if tile.delta}
          <span class="tile-delta">{tile.delta}</span>
        {/if}
      </li>
    {/each}
  </ol>
</aside>

<style>
  .pulse-strip {
    position: sticky;
    top: 40px;
    z-index: 37;
    height: 64px;
    background: var(--g1, #0f0d0c);
    border-bottom: 1px solid var(--g3, #1c1918);
    backdrop-filter: blur(8px);
    contain: layout paint style;
    will-change: transform;
  }
  ol {
    display: grid;
    grid-template-columns: repeat(9, minmax(0, 1fr));
    height: 100%;
    margin: 0;
    padding: 0 clamp(12px, 3vw, 24px);
    list-style: none;
    align-items: center;
    gap: 1px;
  }
  .tile {
    display: grid;
    grid-template-rows: auto auto;
    align-items: center;
    height: 56px;
    padding: 0 8px;
    border-right: 1px solid var(--g3, #1c1918);
    font-family: 'JetBrains Mono', monospace;
    overflow: hidden;
  }
  .tile:last-child { border-right: none; }
  .tile-label {
    font-size: 11px;
    color: var(--g6, #5a5650);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    line-height: 1.2;
  }
  .tile-value {
    font-size: 14px;
    color: var(--g9, #eceae8);
    font-weight: 600;
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .tile-delta {
    font-size: 11px;
    line-height: 1.2;
    white-space: nowrap;
  }
  .tile--pos .tile-delta { color: #39c46e; }
  .tile--neg .tile-delta { color: #e64f4f; }
  .tile--neu .tile-delta { color: var(--g6, #5a5650); }
  .tile--hot .tile-delta { color: #f59e0b; }
  .tile--cool .tile-delta { color: #3b82f6; }

  @media (max-width: 768px) {
    ol {
      grid-template-columns: repeat(5, minmax(0, 1fr));
    }
    .tile[data-priority='desktop-only'] {
      display: none;
    }
    .tile-value { font-size: 13px; }
  }
</style>
