<script lang="ts">
  // W-0478 — Alert section inside InboxPanel.
  // Receives alerts list, renders cells, click → /cogochi deeplink (W-0479 will complete chart auto-setup).
  import { goto } from '$app/navigation';
  import type { AlertRow } from '$lib/types/inbox';

  const { alerts }: { alerts: AlertRow[] } = $props();

  function openChart(a: AlertRow): void {
    const params = new URLSearchParams({
      symbol: a.symbol,
      tf: a.timeframe,
      ts: String(Math.floor(new Date(a.created_at).getTime() / 1000)),
    });
    if (a.blocks_triggered?.[0]) params.set('pattern', a.blocks_triggered[0]);
    goto(`/cogochi?${params.toString()}`);
  }

  function relTime(iso: string): string {
    const diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (diff < 60) return `${Math.floor(diff)}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  }
</script>

{#if alerts.length === 0}
  <div class="empty">지금 발화 중인 시그널 없음. 스캐너가 60초마다 확인 중.</div>
{:else}
  <ul class="alert-list">
    {#each alerts as a (a.id)}
      <li>
        <button class="cell" onclick={() => openChart(a)} type="button">
          <div class="row1">
            <span class="symbol">{a.symbol}</span>
            <span class="tf">{a.timeframe}</span>
            {#if a.p_win != null}<span class="p">p={a.p_win.toFixed(2)}</span>{/if}
            <span class="time">{relTime(a.created_at)}</span>
          </div>
          {#if a.blocks_triggered?.length}
            <div class="row2">{a.blocks_triggered.slice(0, 3).join(' · ')}</div>
          {/if}
          <div class="cta">Open chart →</div>
        </button>
      </li>
    {/each}
  </ul>
{/if}

<style>
  .empty {
    padding: 20px 12px;
    color: rgba(250, 247, 235, 0.5);
    font-size: var(--ui-text-xs, 11px);
    font-family: var(--sc-font-mono, monospace);
    text-align: center;
    line-height: 1.5;
  }
  .alert-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .cell {
    width: 100%;
    text-align: left;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 4px;
    padding: 8px 10px;
    cursor: pointer;
    color: inherit;
    font-family: var(--sc-font-mono, monospace);
  }
  .cell:hover {
    background: rgba(255, 255, 255, 0.07);
    border-color: rgba(255, 255, 255, 0.14);
  }
  .row1 {
    display: flex;
    gap: 8px;
    align-items: baseline;
    font-size: var(--ui-text-xs, 11px);
  }
  .symbol { font-weight: 600; color: rgba(250, 247, 235, 0.95); }
  .tf { color: rgba(250, 247, 235, 0.6); }
  .p { color: #7ed4ad; }
  .time { margin-left: auto; color: rgba(250, 247, 235, 0.4); }
  .row2 {
    margin-top: 4px;
    font-size: var(--ui-text-xs, 11px);
    color: rgba(250, 247, 235, 0.55);
  }
  .cta {
    margin-top: 6px;
    font-size: var(--ui-text-xs, 11px);
    color: rgba(126, 212, 173, 0.85);
  }
</style>
