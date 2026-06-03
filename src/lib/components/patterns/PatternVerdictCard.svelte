<script lang="ts">
  import type { PatternVerdict, WindowAgg, ConfidenceTier } from '$lib/types/patternVerdict';
  import { tierOf, isStale } from '$lib/types/patternVerdict';

  interface Props {
    slug: string;
    verdict: PatternVerdict | null;
    nowMs?: number;
  }
  const { slug, verdict, nowMs = Date.now() }: Props = $props();

  type WindowKey = 'last_90d' | 'all';
  let windowKey = $state<WindowKey>('last_90d');

  const tier = $derived<ConfidenceTier>(tierOf(verdict));
  const stale = $derived(isStale(verdict, nowMs));
  const agg = $derived<WindowAgg | undefined>(
    windowKey === 'last_90d' ? verdict?.last_90d : verdict?.all,
  );
  const showNumbers = $derived(tier !== 'insufficient' && !!agg && (agg.n_closed ?? 0) > 0);

  function fmtPct(v: number | null | undefined, digits: number = 1): string {
    if (v == null || Number.isNaN(v)) return '—';
    return `${(v * 100).toFixed(digits)}%`;
  }
  function fmtPctSigned(v: number | null | undefined, digits: number = 2): string {
    if (v == null || Number.isNaN(v)) return '—';
    const sign = v > 0 ? '+' : '';
    return `${sign}${(v * 100).toFixed(digits)}%`;
  }
  function fmtCi(lo: number | null | undefined, hi: number | null | undefined): string {
    if (lo == null || hi == null) return '—';
    return `${(lo * 100).toFixed(1)}–${(hi * 100).toFixed(1)}%`;
  }
  function fmtCiSigned(lo: number | null | undefined, hi: number | null | undefined): string {
    if (lo == null || hi == null) return '—';
    const s = (v: number) => (v > 0 ? '+' : '') + (v * 100).toFixed(2) + '%';
    return `${s(lo)}–${s(hi)}`;
  }
</script>

<section class="verdict-card" data-tier={tier} aria-label="Pattern verdict for {slug}">
  <header class="card-head">
    <div class="title-row">
      <span class="label">Verdict</span>
      <span class="tier-pill" data-tier={tier}>{tier}</span>
      {#if stale}
        <span class="stale-pill" title="Last computed > 24h ago">stale</span>
      {/if}
    </div>
    <div class="window-toggle" role="tablist" aria-label="Window">
      <button
        type="button"
        role="tab"
        aria-selected={windowKey === 'last_90d'}
        class:active={windowKey === 'last_90d'}
        onclick={() => (windowKey = 'last_90d')}
      >90d</button>
      <button
        type="button"
        role="tab"
        aria-selected={windowKey === 'all'}
        class:active={windowKey === 'all'}
        onclick={() => (windowKey = 'all')}
      >all</button>
    </div>
  </header>

  {#if !showNumbers}
    <div class="empty">
      Not enough closed positions yet
      {#if agg}<span class="n-meta">· n={agg.n_closed ?? 0}</span>{/if}
    </div>
  {:else if agg}
    <div class="grid">
      <div class="stat">
        <span class="stat-label">Win rate</span>
        <span class="stat-val">{fmtPct(agg.win_rate, 1)}</span>
        <span class="stat-ci">95% CI {fmtCi(agg.ci95_lo, agg.ci95_hi)}</span>
      </div>
      <div class="stat">
        <span class="stat-label">Avg PnL</span>
        <span
          class="stat-val"
          class:positive={(agg.avg_pnl_pct ?? 0) > 0}
          class:negative={(agg.avg_pnl_pct ?? 0) < 0}
        >{fmtPctSigned(agg.avg_pnl_pct, 2)}</span>
        <span class="stat-ci">95% CI {fmtCiSigned(agg.avg_pnl_ci95_lo, agg.avg_pnl_ci95_hi)}</span>
      </div>
      <div class="stat">
        <span class="stat-label">Sample</span>
        <span class="stat-val n">n={agg.n_closed}</span>
        <span class="stat-ci">{agg.n_wins} wins · total {agg.n_total}</span>
      </div>
    </div>
  {/if}
</section>

<style>
  .verdict-card {
    padding: 12px 14px;
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 6px;
    background: rgba(255,255,255,0.02);
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .verdict-card[data-tier='high'] { border-color: rgba(74,222,128,0.25); }
  .verdict-card[data-tier='moderate'] { border-color: rgba(250,204,21,0.22); }
  .verdict-card[data-tier='low'] { border-color: rgba(248,113,113,0.22); }
  .card-head {
    display: flex; justify-content: space-between; align-items: center; gap: 12px;
  }
  .title-row { display: flex; align-items: center; gap: 8px; }
  .label {
    font-size: 11px; color: rgba(255,255,255,0.5);
    text-transform: uppercase; letter-spacing: 0.05em;
  }
  .tier-pill {
    font-size: var(--ui-text-xs);
    padding: 2px 7px; border-radius: 3px;
    background: rgba(255,255,255,0.08);
    color: rgba(255,255,255,0.7);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .tier-pill[data-tier='high'] { background: rgba(74,222,128,0.15); color: #4ade80; }
  .tier-pill[data-tier='moderate'] { background: rgba(250,204,21,0.14); color: #facc15; }
  .tier-pill[data-tier='low'] { background: rgba(248,113,113,0.14); color: #f87171; }
  .stale-pill {
    font-size: var(--ui-text-xs);
    padding: 2px 6px; border-radius: 3px;
    background: rgba(250,204,21,0.12);
    color: rgba(250,204,21,0.85);
  }
  .window-toggle {
    display: inline-flex; gap: 2px;
    padding: 2px; border-radius: 4px;
    background: rgba(255,255,255,0.04);
  }
  .window-toggle button {
    padding: 3px 9px;
    font-size: var(--ui-text-xs);
    color: rgba(255,255,255,0.5);
    background: transparent; border: none; border-radius: 3px;
    cursor: pointer;
  }
  .window-toggle button.active {
    background: rgba(255,255,255,0.08);
    color: rgba(255,255,255,0.9);
  }
  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 10px;
  }
  .stat { display: flex; flex-direction: column; gap: 2px; }
  .stat-label { font-size: var(--ui-text-xs); color: rgba(255,255,255,0.35); }
  .stat-val {
    font-family: var(--sc-font-mono, monospace);
    font-size: 14px;
    color: rgba(255,255,255,0.85);
  }
  .stat-val.n { font-size: 13px; color: rgba(255,255,255,0.7); }
  .stat-val.positive { color: #4ade80; }
  .stat-val.negative { color: #f87171; }
  .stat-ci {
    font-size: var(--ui-text-xs);
    color: rgba(255,255,255,0.3);
    font-family: monospace;
  }
  .empty {
    font-size: 12px; color: rgba(255,255,255,0.4);
    text-align: center; padding: 6px 0;
  }
  .n-meta { color: rgba(255,255,255,0.3); margin-left: 4px; }
  @media (max-width: 480px) {
    .grid { grid-template-columns: 1fr 1fr; }
    .stat:nth-child(3) { grid-column: 1 / -1; }
  }
</style>
