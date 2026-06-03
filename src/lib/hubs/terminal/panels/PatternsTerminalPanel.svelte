<script lang="ts">
  import { goto } from '$app/navigation';
  import { onDestroy } from 'svelte';
  import { flattenPatternStates, type PatternStateView } from '$lib/contracts/patterns';
  import { selectedPatternSlug } from '../deeplink.store';

  interface Props {
    symbol: string;     // 현재 차트 심볼 (e.g. 'BTCUSDT')
    timeframe: string;  // 현재 차트 TF (e.g. '4h') — string, 변환 없음
  }
  let { symbol, timeframe }: Props = $props();

  // 상태
  let loading = $state(true);
  let error = $state<string | null>(null);
  let matches = $state<PatternStateView[]>([]);

  // fetch
  let abortCtrl: AbortController | null = null;

  async function fetchMatches() {
    abortCtrl?.abort();
    abortCtrl = new AbortController();
    loading = true;
    error = null;
    try {
      const res = await fetch('/api/patterns/states', {
        signal: abortCtrl.signal,
      });
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      // /api/patterns/states is a lossless proxy for engine /patterns/states
      // engine response shape: { patterns: { [patternSlug]: { [symbol]: state } } }
      const all = flattenPatternStates(data);
      matches = all
        .filter((s) => !symbol || s.symbol === symbol)
        .slice(0, 8);
    } catch (e: unknown) {
      if (e instanceof Error && e.name !== 'AbortError') error = 'Engine offline';
    } finally {
      loading = false;
    }
  }

  // symbol/timeframe 변경 시 refetch (200ms debounce)
  let debounceTimer: ReturnType<typeof setTimeout>;
  $effect(() => {
    // track both props
    const _sym = symbol;
    const _tf = timeframe;
    void _sym; void _tf;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(fetchMatches, 200);
    return () => clearTimeout(debounceTimer);
  });

  onDestroy(() => abortCtrl?.abort());

  function openPattern(slug: string) {
    goto(`/patterns/${slug}?from=terminal&sym=${encodeURIComponent(symbol)}&tf=${encodeURIComponent(timeframe)}`);
  }

  function fmtProgress(pct: number) {
    return `${Math.round(pct * 100)}%`;
  }
</script>

<div class="patterns-panel">
  <div class="ctx-header">
    <span class="ctx-sym">{symbol}</span>
    <span class="ctx-tf">· {timeframe}</span>
  </div>

  <div class="section-title">Live Matches</div>

  {#if loading}
    <div class="skeleton-list">
      {#each [1,2,3] as _}
        <div class="skeleton-card"></div>
      {/each}
    </div>
  {:else if error}
    <div class="empty-state">
      <span>{error}</span>
      <button class="retry-btn" onclick={fetchMatches}>Retry</button>
    </div>
  {:else if matches.length === 0}
    <div class="empty-state">No live matches for {symbol} {timeframe}</div>
  {:else}
    <ul class="match-list">
      {#each matches as m}
        <li>
          <button
            type="button"
            class="match-card"
            class:highlighted={$selectedPatternSlug === m.patternSlug}
            onclick={() => openPattern(m.patternSlug)}
          >
            <span class="card-top">
              <span class="slug">{m.patternSlug}</span>
              <span class="progress">{fmtProgress(m.progressPct)}</span>
              <span class="arrow">→</span>
            </span>
            <span class="card-bot">
              <span class="phase muted">{m.phaseLabel}</span>
              <span class="bars muted">{m.barsInPhase}b</span>
            </span>
          </button>
        </li>
      {/each}
    </ul>
  {/if}

  <div class="footer-hint">
    <a href="/patterns" class="all-link">View all patterns →</a>
  </div>
</div>

<style>
  .patterns-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow-y: auto;
    padding: 8px 0;
  }
  .ctx-header {
    padding: 4px 12px 8px;
    font-size: 11px;
    color: rgba(250,247,235,0.45);
    border-bottom: 1px solid rgba(255,255,255,0.06);
    margin-bottom: 8px;
  }
  .ctx-sym { color: rgba(250,247,235,0.75); font-weight: 600; }
  .ctx-tf  { margin-left: 2px; }
  .section-title {
    padding: 0 12px 4px;
    font-size: var(--ui-text-xs);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: rgba(250,247,235,0.3);
  }
  .match-list { list-style: none; margin: 0; padding: 0 8px; display: flex; flex-direction: column; gap: 3px; }
  .match-card {
    width: 100%;
    color: inherit;
    font: inherit;
    text-align: left;
    background: transparent;
    padding: 8px;
    border-radius: 6px;
    cursor: pointer;
    border: 1px solid transparent;
    transition: background 0.1s, border-color 0.1s;
    min-height: 52px;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .match-card:hover {
    background: rgba(249,216,194,0.07);
    border-color: rgba(249,216,194,0.12);
  }
  /* W-0479 deeplink — currently selected pattern slug from URL */
  .match-card.highlighted {
    background: rgba(126, 212, 173, 0.10);
    border-color: rgba(126, 212, 173, 0.45);
  }
  .card-top { display: flex; align-items: center; gap: 6px; }
  .slug { font-size: 12px; font-weight: 600; color: rgba(250,247,235,0.88); flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .progress { font-size: 11px; color: rgba(250,247,235,0.6); flex-shrink: 0; }
  .arrow { font-size: 11px; color: rgba(250,247,235,0.3); flex-shrink: 0; }
  .card-bot { display: flex; align-items: center; gap: 6px; }
  .phase { font-size: var(--ui-text-xs); flex: 1; }
  .bars { font-size: var(--ui-text-xs); flex-shrink: 0; }
  .muted { color: rgba(250,247,235,0.35); }
  .skeleton-list { padding: 0 8px; display: flex; flex-direction: column; gap: 3px; }
  .skeleton-card { height: 52px; border-radius: 6px; background: rgba(255,255,255,0.06); animation: pulse 1.4s ease-in-out infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
  .empty-state { padding: 16px 12px; font-size: 12px; color: rgba(250,247,235,0.4); display: flex; flex-direction: column; gap: 8px; }
  .retry-btn { font-size: 11px; color: rgba(249,216,194,0.7); background: none; border: none; cursor: pointer; text-align: left; padding: 0; }
  .footer-hint { margin-top: auto; padding: 8px 12px; }
  .all-link { font-size: 11px; color: rgba(249,216,194,0.5); text-decoration: none; }
  .all-link:hover { color: rgba(249,216,194,0.8); }
</style>
