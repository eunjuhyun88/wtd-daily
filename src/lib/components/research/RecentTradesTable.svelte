<script lang="ts">
  /**
   * RecentTradesTable — last N closed trades for a bucket (W-0414 PR8C).
   * Columns: trade_id (8 chars) / exit_reason / pnl_pct / closed_at.
   */
  import type { RecentTradeOut } from '$lib/types/research';

  interface Props {
    trades: RecentTradeOut[];
  }
  const { trades }: Props = $props();

  function shortId(id: string): string {
    return id.length > 8 ? id.slice(0, 8) : id;
  }
  function fmtPnl(v: number): string {
    if (!Number.isFinite(v)) return '—';
    const sign = v > 0 ? '+' : '';
    return `${sign}${(v * 100).toFixed(2)}%`;
  }
  function pnlClass(v: number): string {
    if (!Number.isFinite(v)) return 'pnl-zero';
    if (v > 0) return 'pnl-pos';
    if (v < 0) return 'pnl-neg';
    return 'pnl-zero';
  }
  function fmtClosedAt(iso: string): string {
    // Trim ISO to YYYY-MM-DD HH:mm for compactness; fall back if invalid.
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
  }
</script>

{#if trades.length === 0}
  <div class="empty" data-testid="recent-trades-empty">
    <p>No closed trades yet for this bucket.</p>
  </div>
{:else}
  <div class="rt-wrap">
    <table class="rt-table" data-testid="recent-trades-table">
      <thead>
        <tr>
          <th>Trade</th>
          <th>Exit</th>
          <th class="num">PnL</th>
          <th>Closed</th>
        </tr>
      </thead>
      <tbody>
        {#each trades as t (t.trade_id)}
          <tr data-testid="recent-trade-row">
            <td class="mono">{shortId(t.trade_id)}</td>
            <td class="reason">{t.exit_reason}</td>
            <td class="num pnl {pnlClass(t.pnl_pct)}">{fmtPnl(t.pnl_pct)}</td>
            <td class="mono closed-at">{fmtClosedAt(t.closed_at)}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{/if}

<style>
  .rt-wrap {
    overflow-x: auto;
  }
  .rt-table {
    width: 100%;
    border-collapse: collapse;
    font-family: var(--ui-font-mono);
    font-size: var(--ui-text-sm);
  }
  .rt-table thead th {
    text-align: left;
    padding: 6px 10px;
    color: rgba(250, 247, 235, 0.5);
    font-size: var(--ui-text-xs);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    border-bottom: 1px solid rgba(249, 216, 194, 0.1);
  }
  .rt-table thead th.num { text-align: right; }
  .rt-table tbody td {
    padding: 6px 10px;
    color: rgba(250, 247, 235, 0.82);
    border-bottom: 1px solid rgba(249, 216, 194, 0.04);
  }
  .rt-table tbody td.num {
    text-align: right;
    font-variant-numeric: var(--ui-tabular);
  }
  .mono { font-family: var(--ui-font-mono); }
  .reason {
    text-transform: lowercase;
    color: rgba(250, 247, 235, 0.7);
  }
  .pnl-pos { color: var(--sc-green-300); }
  .pnl-neg { color: var(--sc-red-300); }
  .pnl-zero { color: rgba(250, 247, 235, 0.55); }

  .empty {
    padding: 18px 12px;
    text-align: center;
    font-family: var(--ui-font-mono);
    font-size: var(--ui-text-sm);
    color: rgba(250, 247, 235, 0.45);
    border: 1px dashed rgba(249, 216, 194, 0.1);
    border-radius: 4px;
  }
  .empty p { margin: 0; }

  @media (max-width: 768px) {
    .rt-table thead th { padding: 6px 6px; }
    .rt-table tbody td { padding: 6px 6px; font-size: var(--ui-text-xs); }
    .closed-at { font-size: var(--ui-text-xs); }
  }
</style>
