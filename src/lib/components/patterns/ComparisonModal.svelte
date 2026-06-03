<script lang="ts">
  import { setSelectedSlug } from '$lib/stores/patternsHub';
  import { goto } from '$app/navigation';

  type PatternCompare = {
    slug: string;
    win_rate?: number | null;
    sharpe?: number | null;
    n_signals?: number | null;
    avg_return_72h?: number | null;
    equity_curve?: Array<{ ts?: string; cumulative_pnl_bps?: number } | number>;
    error?: string;
  };

  let { data, onClose }: { data: PatternCompare[]; onClose: () => void } = $props();

  const [a, b] = $derived.by(() => [data[0] ?? null, data[1] ?? null]);

  function fmtPct(v: number | null | undefined): string {
    if (v == null) return '—';
    return (v >= 0 ? '+' : '') + (v * 100).toFixed(1) + '%';
  }
  function fmtNum(v: number | null | undefined, d = 2): string {
    if (v == null) return '—';
    return v.toFixed(d);
  }

  function buildSvgPoints(curve: PatternCompare['equity_curve'], W: number, H: number): string {
    if (!curve || curve.length < 2) return '';
    const vals = curve.map(p => typeof p === 'number' ? p : (p.cumulative_pnl_bps ?? 0));
    const min = Math.min(...vals), max = Math.max(...vals);
    const rx = vals.length - 1 || 1, ry = max - min || 1;
    return vals.map((v, i) =>
      `${((i / rx) * (W - 4) + 2).toFixed(1)},${(H - ((v - min) / ry) * (H - 4) - 2).toFixed(1)}`
    ).join(' ');
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') onClose();
  }

  function navigate(slug: string) {
    onClose();
    setSelectedSlug(slug);
    goto(`/patterns/${encodeURIComponent(slug)}`);
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- Backdrop -->
<div class="backdrop" role="button" tabindex="-1" onclick={onClose} onkeydown={() => {}}></div>

<div class="modal" role="dialog" aria-modal="true" aria-label="패턴 비교">
  <div class="modal-header">
    <span class="modal-title">패턴 비교</span>
    <button class="close-btn" onclick={onClose} type="button" aria-label="닫기">×</button>
  </div>

  <div class="compare-cols">
    {#each [a, b] as pat, i}
      {#if pat}
        <div class="col">
          <div class="col-header">
            <span class="col-slug">{pat.slug}</span>
          </div>
          {#if pat.error}
            <div class="col-error">{pat.error}</div>
          {:else}
            <div class="metrics-group">
              <div class="group-label">PROFIT</div>
              <div class="metric-row">
                <span class="metric-label">Avg Return 72h</span>
                <span class="metric-val" class:pos={((pat.avg_return_72h ?? 0)) > 0} class:neg={((pat.avg_return_72h ?? 0)) < 0}>{fmtPct(pat.avg_return_72h)}</span>
              </div>
              <div class="metric-row">
                <span class="metric-label">Win Rate</span>
                <span class="metric-val">{pat.win_rate != null ? (pat.win_rate * 100).toFixed(1) + '%' : '—'}</span>
              </div>
              <div class="metric-row">
                <span class="metric-label">Trades</span>
                <span class="metric-val">{pat.n_signals ?? '—'}</span>
              </div>
            </div>
            <div class="metrics-group">
              <div class="group-label">RISK</div>
              <div class="metric-row">
                <span class="metric-label">Sharpe</span>
                <span class="metric-val">{fmtNum(pat.sharpe)}</span>
              </div>
            </div>
          {/if}
          <button class="nav-btn" onclick={() => navigate(pat.slug)} type="button">
            {pat.slug} 로 이동 →
          </button>
        </div>
        {#if i === 0}<div class="col-divider"></div>{/if}
      {/if}
    {/each}
  </div>

  <!-- Equity curve overlay -->
  {#if (a?.equity_curve?.length ?? 0) >= 2 || (b?.equity_curve?.length ?? 0) >= 2}
    <div class="equity-section">
      <div class="equity-legend">
        {#if a}<span class="leg leg-a">── {a.slug}</span>{/if}
        {#if b}<span class="leg leg-b">-- {b.slug}</span>{/if}
      </div>
      <svg class="equity-svg" viewBox="0 0 600 80" preserveAspectRatio="none">
        {#if a?.equity_curve && a.equity_curve.length >= 2}
          <polyline
            points={buildSvgPoints(a.equity_curve, 600, 80)}
            fill="none" stroke="#22c55e" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round"
          />
        {/if}
        {#if b?.equity_curve && b.equity_curve.length >= 2}
          <polyline
            points={buildSvgPoints(b.equity_curve, 600, 80)}
            fill="none" stroke="#3b82f6" stroke-width="2"
            stroke-dasharray="4 2"
            stroke-linecap="round" stroke-linejoin="round"
          />
        {/if}
      </svg>
    </div>
  {/if}
</div>

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.7);
    z-index: 999;
  }
  .modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1000;
    width: 640px;
    max-width: 96vw;
    background: #0f172a;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    gap: 0;
    overflow: hidden;
  }
  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 18px;
    border-bottom: 1px solid rgba(255,255,255,0.07);
  }
  .modal-title {
    font-size: var(--ui-text-xs, 11px);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: rgba(255,255,255,0.6);
    font-family: var(--sc-font-mono, monospace);
  }
  .close-btn {
    background: none;
    border: none;
    color: rgba(255,255,255,0.4);
    font-size: 18px;
    cursor: pointer;
    line-height: 1;
    padding: 0 4px;
  }
  .close-btn:hover { color: rgba(255,255,255,0.8); }
  .compare-cols {
    display: flex;
    padding: 16px;
    gap: 0;
  }
  .col {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .col-divider {
    width: 1px;
    background: rgba(255,255,255,0.07);
    margin: 0 16px;
  }
  .col-header { margin-bottom: 4px; }
  .col-slug {
    font-size: var(--ui-text-xs, 11px);
    font-weight: 700;
    font-family: var(--sc-font-mono, monospace);
    color: #93c5fd;
    word-break: break-all;
  }
  .col-error {
    font-size: var(--ui-text-xs, 11px);
    color: #f87171;
  }
  .metrics-group { display: flex; flex-direction: column; gap: 4px; }
  .group-label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: rgba(255,255,255,0.3);
    font-family: var(--sc-font-mono, monospace);
    border-bottom: 1px solid rgba(255,255,255,0.05);
    padding-bottom: 2px;
    margin-bottom: 2px;
  }
  .metric-row {
    display: flex;
    justify-content: space-between;
    font-size: var(--ui-text-xs, 11px);
    font-family: var(--sc-font-mono, monospace);
  }
  .metric-label { color: rgba(255,255,255,0.45); }
  .metric-val { color: rgba(255,255,255,0.85); font-variant-numeric: tabular-nums; }
  .pos { color: #4ade80; }
  .neg { color: #f87171; }
  .nav-btn {
    margin-top: auto;
    padding: 4px 10px;
    font-size: var(--ui-text-xs, 11px);
    font-family: var(--sc-font-mono, monospace);
    background: rgba(59,130,246,0.1);
    border: 1px solid rgba(59,130,246,0.25);
    border-radius: 4px;
    color: #93c5fd;
    cursor: pointer;
    text-align: left;
  }
  .nav-btn:hover { background: rgba(59,130,246,0.2); }
  .equity-section {
    padding: 10px 16px 16px;
    border-top: 1px solid rgba(255,255,255,0.06);
  }
  .equity-legend {
    display: flex;
    gap: 16px;
    margin-bottom: 6px;
    font-size: 11px;
    font-family: var(--sc-font-mono, monospace);
  }
  .leg-a { color: #22c55e; }
  .leg-b { color: #3b82f6; }
  .equity-svg { width: 100%; height: 80px; display: block; }
</style>
