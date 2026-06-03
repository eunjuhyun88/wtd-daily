<script lang="ts">
  /**
   * BucketRow — one row in the bucket attribution list (W-0414 PR8B).
   *
   * Renders bucket_key, n, win-rate, LCB95, stop_rate, and per-mode badges
   * (standard / conservative / aggressive) following the §A wireframe.
   */
  import type { BucketListItem, ModeStatusOut as ModeStatus } from '$lib/types/research';

  interface Props {
    bucket: BucketListItem;
  }
  const { bucket }: Props = $props();

  const state = $derived(bucket.state);
  const wins = $derived(state.wins);
  const losses = $derived(state.losses);
  const wr = $derived(wins + losses > 0 ? wins / (wins + losses) : null);

  function fmtPct(v: number | null): string {
    if (v === null || !Number.isFinite(v)) return '—';
    return `${(v * 100).toFixed(1)}%`;
  }
  function fmtLcb(v: number | null): string {
    if (v === null || !Number.isFinite(v)) return '—';
    return v.toFixed(3);
  }

  function statusGlyph(s: string): string {
    switch (s) {
      case 'accept':       return '✓';
      case 'watch':        return '!';
      case 'block':        return '×';
      case 'force_block':  return '⨯';
      case 'cold_start':   return '◯';
      default:             return '?';
    }
  }
  function statusLabel(s: string): string {
    return s.replace('_', ' ').toUpperCase();
  }

  const modes = $derived(bucket.modes ?? {});
  const std = $derived<ModeStatus | undefined>(modes.standard);
  const cons = $derived<ModeStatus | undefined>(modes.conservative);
  const aggr = $derived<ModeStatus | undefined>(modes.aggressive);
</script>

<tr class="bucket-row" class:conflict={bucket.conflict} data-testid="bucket-row">
  <td class="key" title={bucket.bucket_key}>{bucket.bucket_key}</td>
  <td class="num">{state.n}</td>
  <td class="num">{fmtPct(wr)}</td>
  <td class="num">{fmtLcb(state.posterior_lcb95)}</td>
  <td class="num">{fmtPct(state.stop_rate)}</td>

  {#each [['std', std], ['cons', cons], ['aggr', aggr]] as const as [slot, ms]}
    <td class="mode-cell">
      {#if ms}
        <span
          class="status-badge status-{ms.status}"
          data-mode={slot}
          data-status={ms.status}
          title={`${slot}: ${ms.status} — ${ms.reasoning}`}
          aria-label={`${slot} ${statusLabel(ms.status)}`}
        >
          <span class="glyph" aria-hidden="true">{statusGlyph(ms.status)}</span>
          <span class="label">{statusLabel(ms.status)}</span>
        </span>
      {:else}
        <span class="status-badge status-missing" aria-label="no data">—</span>
      {/if}
    </td>
  {/each}
</tr>

<style>
  .bucket-row {
    border-bottom: 1px solid rgba(249, 216, 194, 0.06);
    font-family: var(--ui-font-mono);
    font-size: var(--ui-text-sm);
    color: rgba(250, 247, 235, 0.85);
  }
  .bucket-row:hover { background: rgba(255, 255, 255, 0.025); }
  .bucket-row.conflict { background: rgba(239, 68, 68, 0.06); }

  .key {
    padding: 6px 10px;
    font-weight: 500;
    white-space: nowrap;
    max-width: 240px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .num {
    padding: 6px 10px;
    text-align: right;
    font-variant-numeric: var(--ui-tabular);
    color: rgba(250, 247, 235, 0.78);
  }
  .mode-cell {
    padding: 6px 8px;
    text-align: center;
  }

  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: var(--ui-text-xs);
    font-weight: 600;
    letter-spacing: 0.04em;
    line-height: 1;
    border: 1px solid transparent;
  }
  .status-badge .glyph { font-family: var(--ui-font-mono); }

  .status-accept {
    color: var(--sc-green-300);
    background: rgba(34, 197, 94, 0.12);
    border-color: rgba(34, 197, 94, 0.35);
  }
  .status-watch {
    color: var(--sc-yellow-300);
    background: rgba(234, 179, 8, 0.12);
    border-color: rgba(234, 179, 8, 0.35);
  }
  .status-block {
    color: var(--sc-grey-9);
    background: rgba(102, 102, 102, 0.18);
    border-color: rgba(102, 102, 102, 0.4);
  }
  .status-force_block {
    color: var(--sc-red-300);
    background: rgba(239, 68, 68, 0.14);
    border-color: rgba(239, 68, 68, 0.45);
  }
  .status-cold_start {
    color: var(--sc-blue-300);
    background: rgba(59, 130, 246, 0.12);
    border-color: rgba(59, 130, 246, 0.35);
  }
  .status-missing {
    color: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.08);
  }

  /* Compact mobile: hide verbose label, keep glyph */
  @media (max-width: 768px) {
    .status-badge .label { display: none; }
    .key { max-width: 140px; font-size: var(--ui-text-xs); }
    .num { padding: 6px 6px; font-size: var(--ui-text-xs); }
    .mode-cell { padding: 6px 4px; }
  }
</style>
