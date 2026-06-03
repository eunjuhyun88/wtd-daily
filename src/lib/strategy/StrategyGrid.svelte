<script lang="ts">
  import type { PatternBacktestStats, PatternObjectRow } from '$lib/api/strategyBackend';
  import PatternStrategyCard from './PatternStrategyCard.svelte';

  interface Props {
    patterns: PatternObjectRow[];
    statsMap: Map<string, PatternBacktestStats>;
    loadingSet: Set<string>;
    sort?: 'sharpe' | 'apr' | 'win_rate' | 'n_signals';
    onCardClick?: (slug: string) => void;
    onCompare?: (slug: string) => void;
    compareSelected?: string[];
    promotedSlugs?: Set<string>;
    freeLimit?: number;
  }

  let {
    patterns,
    statsMap,
    loadingSet,
    sort = 'sharpe',
    onCardClick,
    onCompare,
    compareSelected = [],
    promotedSlugs = new Set(),
    freeLimit = 10,
  }: Props = $props();

  function sortVal(slug: string): number {
    const s = statsMap.get(slug);
    if (!s) return -Infinity;
    if (sort === 'sharpe') return s.sharpe ?? -Infinity;
    if (sort === 'apr') return s.apr ?? -Infinity;
    if (sort === 'win_rate') return s.win_rate ?? -Infinity;
    return s.n_signals;
  }

  const sorted = $derived(
    [...patterns].sort((a, b) => sortVal(b.slug) - sortVal(a.slug)),
  );

  const sorts: { key: typeof sort; label: string }[] = [
    { key: 'sharpe', label: 'Sharpe' },
    { key: 'apr', label: 'APR' },
    { key: 'win_rate', label: 'Win Rate' },
    { key: 'n_signals', label: 'Signals' },
  ];
</script>

<div class="strategy-grid-wrap">
  <div class="grid-controls">
    <span class="grid-count">{patterns.length} patterns</span>
    <div class="sort-tabs">
      {#each sorts as s}
        <button
          class="sort-tab"
          class:active={sort === s.key}
          onclick={() => (sort = s.key)}
          type="button"
        >{s.label}</button>
      {/each}
    </div>
  </div>

  <div class="strategy-grid">
    {#each sorted as p, i}
      <div class="card-wrap" class:compare-sel={compareSelected.includes(p.slug)}>
        {#if promotedSlugs.has(p.slug)}
          <span class="layer-c-badge" title="Layer C 라이브">C</span>
        {/if}
        <PatternStrategyCard
          pattern={p}
          stats={statsMap.get(p.slug) ?? null}
          loading={loadingSet.has(p.slug)}
          locked={i >= freeLimit}
          onclick={() => onCardClick?.(p.slug)}
        />
        {#if onCompare}
          <button
            class="cmp-btn"
            class:cmp-active={compareSelected.includes(p.slug)}
            onclick={(e) => { e.stopPropagation(); onCompare?.(p.slug); }}
            type="button"
            title="비교에 추가"
          >{compareSelected.includes(p.slug) ? '✓ 선택됨' : '비교+'}</button>
        {/if}
      </div>
    {/each}
  </div>
</div>

<style>
  .strategy-grid-wrap { display: flex; flex-direction: column; gap: 12px; }
  .grid-controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }
  .grid-count { font-size: 11px; color: var(--g5, #666); }
  .sort-tabs { display: flex; gap: 2px; }
  .sort-tab {
    padding: 3px 8px;
    font-size: var(--ui-text-xs);
    color: var(--g6, #888);
    background: var(--g1, #111);
    border: 1px solid var(--g3, #2a2a2a);
    border-radius: 4px;
    cursor: pointer;
    transition: color 0.12s, background 0.12s;
  }
  .sort-tab:hover { color: var(--g8, #ccc); background: var(--g2, #181818); }
  .sort-tab.active { color: var(--g9, #f0f0f0); background: var(--g2, #181818); border-color: var(--g5, #555); }
  .strategy-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 8px;
  }
  .card-wrap {
    position: relative;
    display: flex;
    flex-direction: column;
  }
  .card-wrap.compare-sel { outline: 2px solid #3b82f6; border-radius: 6px; }
  .layer-c-badge {
    position: absolute;
    top: 4px;
    right: 4px;
    z-index: 2;
    background: #7c3aed;
    color: #ede9fe;
    font-size: 11px;
    font-weight: 700;
    font-family: var(--sc-font-mono, monospace);
    letter-spacing: 0.04em;
    padding: 1px 4px;
    border-radius: 3px;
    line-height: 1.4;
    pointer-events: none;
  }
  .cmp-btn {
    margin-top: 3px;
    padding: 2px 8px;
    font-size: var(--ui-text-xs, 11px);
    background: rgba(59,130,246,0.08);
    border: 1px solid rgba(59,130,246,0.25);
    border-radius: 4px;
    color: #93c5fd;
    cursor: pointer;
    width: 100%;
    text-align: center;
  }
  .cmp-btn:hover { background: rgba(59,130,246,0.18); }
  .cmp-btn.cmp-active { background: rgba(59,130,246,0.22); border-color: #3b82f6; color: #bfdbfe; }
</style>
