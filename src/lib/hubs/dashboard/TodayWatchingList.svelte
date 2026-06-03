<script lang="ts">
  interface WatchingCapture {
    capture_id: string;
    symbol: string;
    pattern_slug: string;
    status: string;
    captured_at_ms: number;
    pnl_pct: number | null;
  }

  interface Props {
    captures?: WatchingCapture[];
    loading?: boolean;
  }

  const { captures = [], loading = false }: Props = $props();
</script>

<div class="today-watching-list">
  <div class="twl-header">
    <span class="twl-title">Watching</span>
    <a href="/patterns?tab=search" class="twl-more">전체 →</a>
  </div>
  {#if loading}
    <p class="twl-empty">Loading…</p>
  {:else if captures.length === 0}
    <p class="twl-empty">No active watches</p>
  {:else}
    {#each captures.slice(0, 6) as cap}
      <a
        class="twl-row"
        href="/cogochi?capture={cap.capture_id}&from=dash_watch"
      >
        <span class="twl-sym">{cap.symbol}</span>
        <span class="twl-slug">{cap.pattern_slug || '—'}</span>
        <span
          class="twl-pnl"
          class:pos={cap.pnl_pct != null && cap.pnl_pct >= 0}
          class:neg={cap.pnl_pct != null && cap.pnl_pct < 0}
        >
          {cap.pnl_pct != null
            ? (cap.pnl_pct >= 0 ? '+' : '') + cap.pnl_pct.toFixed(1) + '%'
            : 'watching'}
        </span>
      </a>
    {/each}
  {/if}
</div>

<style>
  .today-watching-list {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0;
    font-family: 'JetBrains Mono', monospace;
    font-size: var(--ui-text-xs);
  }
  .twl-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 0 6px;
  }
  .twl-title {
    font-size: var(--ui-text-xs);
    font-weight: 700;
    letter-spacing: 0.1em;
    color: var(--g6);
    text-transform: uppercase;
  }
  .twl-more {
    font-size: var(--ui-text-xs);
    color: var(--g5);
    text-decoration: none;
  }
  .twl-more:hover { color: var(--g8); }
  .twl-empty {
    color: var(--g5);
    font-size: var(--ui-text-xs);
    margin: 0;
    padding: 8px 0;
  }
  .twl-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 3px 0;
    border-bottom: 1px solid var(--g2);
    text-decoration: none;
    cursor: pointer;
    transition: background 0.1s;
  }
  .twl-row:hover { background: rgba(255,255,255,0.02); }
  .twl-sym {
    font-weight: 700;
    color: var(--g8);
    min-width: 60px;
  }
  .twl-slug {
    flex: 1;
    color: var(--g5);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .twl-pnl {
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    min-width: 50px;
    text-align: right;
    color: var(--g6);
  }
  .twl-pnl.pos { color: var(--pos, #22AB94); }
  .twl-pnl.neg { color: var(--neg, #F23645); }
</style>
