<script lang="ts">
  export interface Hit {
    symbol: string;
    score: number;
    last_close: number | null;
    last_bar_iso: string;
    context_label?: string;
  }

  interface Props {
    hits: Hit[];
    loading: boolean;
    evaluated: number;
    latency_ms: number;
    selectedSymbol: string;
    onSelectSymbol: (sym: string) => void;
    title?: string;
    notice?: string;
  }

  let {
    hits,
    loading,
    evaluated,
    latency_ms,
    selectedSymbol,
    onSelectSymbol,
    title = '결과',
    notice = '',
  }: Props = $props();

  function fmtPrice(p: number): string {
    if (p >= 1000) return p.toLocaleString('en-US', { maximumFractionDigits: 0 });
    if (p >= 1) return p.toFixed(2);
    return p.toPrecision(4);
  }
</script>

<div class="hit-list">
  <div class="list-header">
    <span class="section-label">{title}</span>
    {#if !loading && evaluated > 0}
      <span class="stats">{hits.length}/{evaluated} · {latency_ms}ms</span>
    {/if}
  </div>

  {#if notice}
    <div class="list-notice">{notice}</div>
  {/if}

  {#if loading && hits.length === 0}
    <div class="skeleton-list">
      {#each { length: 5 } as _}
        <div class="skeleton-row">
          <div class="skeleton-sym"></div>
          <div class="skeleton-score"></div>
        </div>
      {/each}
    </div>
  {:else if hits.length === 0 && evaluated > 0}
    <div class="empty-state">조건 충족 심볼 없음</div>
  {:else if hits.length === 0}
    <div class="empty-state">스캔 실행 대기 중</div>
  {:else}
    <div class="filter-bar">
      <span class="filter-label">Score 높은 순</span>
    </div>
    <div class="rows">
      {#each hits as hit}
        <button
          class="hit-row"
          class:active={hit.symbol === selectedSymbol}
          onclick={() => onSelectSymbol(hit.symbol)}
        >
          <span class="sym-wrap">
            <span class="sym">{hit.symbol.replace('USDT', '')}</span>
            {#if hit.context_label}
              <span class="context">{hit.context_label}</span>
            {/if}
          </span>
          <span class="score">{(hit.score * 100).toFixed(0)}%</span>
          <span class="price">{hit.last_close != null ? fmtPrice(hit.last_close) : '—'}</span>
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .hit-list {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  .list-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 16px 8px;
    flex-shrink: 0;
  }

  .section-label {
    font-size: var(--ui-text-xs);
    color: var(--sc-text-3);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .stats {
    font-size: var(--ui-text-xs);
    color: var(--sc-text-3);
    font-family: 'JetBrains Mono', monospace;
  }

  .filter-bar {
    padding: 6px 16px;
    border-bottom: 1px solid var(--lis-border-soft);
    flex-shrink: 0;
  }

  .list-notice {
    margin: 0 16px 8px;
    padding: 8px 10px;
    border: 1px solid var(--lis-border-soft);
    border-radius: 6px;
    color: var(--sc-text-2);
    font-size: 12px;
    background: var(--lis-surface-1);
  }

  .filter-label {
    font-size: var(--ui-text-xs);
    color: var(--sc-text-3);
  }

  .rows {
    overflow-y: auto;
    flex: 1;
  }

  .hit-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    width: 100%;
    background: none;
    border: none;
    border-bottom: 1px solid var(--lis-border-soft);
    cursor: pointer;
    text-align: left;
    transition: background 0.1s;
    color: inherit;
  }

  .hit-row:hover {
    background: var(--sc-accent-bg-subtle);
  }

  .hit-row.active {
    border-left: 3px solid var(--sc-accent);
    background: var(--sc-accent-bg);
  }

  .sym {
    font-size: 13px;
    font-weight: 600;
    color: var(--sc-text-0);
  }

  .sym-wrap {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .context {
    font-size: 11px;
    color: var(--sc-text-3);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .score {
    font-size: var(--ui-text-xs);
    color: var(--sc-text-2);
    font-family: 'JetBrains Mono', monospace;
    min-width: 36px;
    text-align: right;
  }

  .price {
    font-size: var(--ui-text-xs);
    color: var(--sc-text-2);
    font-family: 'JetBrains Mono', monospace;
    min-width: 60px;
    text-align: right;
  }

  .skeleton-list {
    padding: 8px 0;
  }

  .skeleton-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    border-bottom: 1px solid var(--lis-border-soft);
  }

  .skeleton-sym {
    height: 14px;
    flex: 1;
    background: var(--lis-surface-1);
    border-radius: 4px;
    animation: pulse 1.2s ease-in-out infinite;
  }

  .skeleton-score {
    height: 14px;
    width: 40px;
    background: var(--lis-surface-1);
    border-radius: 4px;
    animation: pulse 1.2s ease-in-out infinite;
  }

  .empty-state {
    padding: 24px 16px;
    text-align: center;
    color: var(--sc-text-3);
    font-size: 13px;
  }

  @keyframes pulse {
    0%, 100% { opacity: 0.4; }
    50% { opacity: 0.8; }
  }
</style>
