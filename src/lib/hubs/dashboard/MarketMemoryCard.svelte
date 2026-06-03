<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  interface PatternStats {
    slug: string;
    total_instances: number;
    success_rate: number;
    recent_30d_success_rate: number | null;
    expected_value: number | null;
    decay_direction: string | null;
  }

  interface Insight {
    slug: string;
    delta: number;
    recent: number;
    baseline: number;
    n: number;
    decay: string | null;
  }

  let stats = $state<PatternStats[]>([]);
  let loading = $state(true);
  let error = $state('');

  onMount(async () => {
    try {
      const res = await fetch('/api/refinement/stats');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      // engine: { ok, count, patterns: [...] } — fallbacks for shape variations.
      const list = data.patterns ?? data.rows ?? data.stats ?? [];
      stats = Array.isArray(list) ? list : [];
    } catch (e) {
      error = e instanceof Error ? e.message : '데이터 로드 실패';
    } finally {
      loading = false;
    }
  });

  const insights = $derived.by<Insight[]>(() => {
    const eligible = stats.filter(
      (s) => s.slug && s.total_instances >= 10 && s.recent_30d_success_rate !== null
    );
    if (eligible.length === 0) return [];
    return eligible
      .map((s) => ({
        slug: s.slug,
        delta: (s.recent_30d_success_rate ?? 0) - s.success_rate,
        recent: s.recent_30d_success_rate ?? 0,
        baseline: s.success_rate,
        n: s.total_instances,
        decay: s.decay_direction,
      }))
      .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
      .slice(0, 3);
  });

  const totalVerdicts = $derived(
    stats.reduce((s, p) => s + (p.total_instances ?? 0), 0)
  );
  const remaining = $derived(Math.max(0, 10 - totalVerdicts));
  const showLearningPrompt = $derived(totalVerdicts < 10);

  function fmtPct(v: number): string {
    return `${(v * 100).toFixed(0)}%`;
  }
  function fmtDelta(v: number): string {
    return `${v >= 0 ? '+' : ''}${(v * 100).toFixed(1)}%`;
  }
  function deltaClass(v: number): string {
    if (v > 0.005) return 'mmc-up';
    if (v < -0.005) return 'mmc-down';
    return 'mmc-flat';
  }
</script>

<div class="market-memory-card" data-testid="market-memory-card">
  <div class="mmc-header">
    <span class="mmc-label">MY MARKET MEMORY</span>
    <button
      type="button"
      class="mmc-link"
      onclick={() => goto('/patterns?tab=lab')}
    >전체 leaderboard →</button>
  </div>

  {#if loading}
    <p class="mmc-status">로딩 중…</p>
  {:else if error}
    <p class="mmc-status mmc-error">데이터 로드 실패</p>
  {:else if showLearningPrompt}
    <div class="mmc-learning">
      <p class="mmc-learning-text">
        verdict {totalVerdicts}건 — 학습 시작까지 {remaining}건 남음
      </p>
      <div class="mmc-progress">
        <div
          class="mmc-progress-fill"
          style:width="{Math.min(100, (totalVerdicts / 10) * 100)}%"
        ></div>
      </div>
      <p class="mmc-hint">verdict 10건 이상 쌓이면 패턴별 학습 변화가 표시됩니다.</p>
    </div>
  {:else if insights.length === 0}
    <p class="mmc-status">최근 30일 데이터를 모으는 중…</p>
  {:else}
    <ul class="mmc-list">
      {#each insights as ins (ins.slug)}
        <li class="mmc-row">
          <span class="mmc-slug">{ins.slug}</span>
          <span class="mmc-rates">
            <span class="mmc-rate-baseline">{fmtPct(ins.baseline)}</span>
            <span class="mmc-arrow">→</span>
            <span class="mmc-rate-recent">{fmtPct(ins.recent)}</span>
          </span>
          <span class="mmc-delta {deltaClass(ins.delta)}">
            {fmtDelta(ins.delta)}
          </span>
          <span class="mmc-n">n={ins.n}</span>
        </li>
      {/each}
    </ul>
    <p class="mmc-caption">지난 30일 vs 전체 verdict 기준 승률 변화</p>
  {/if}
</div>

<style>
  .market-memory-card {
    background: var(--surface-2, rgba(255, 255, 255, 0.03));
    border: 1px solid rgba(245, 166, 35, 0.18);
    border-radius: 10px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .mmc-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .mmc-label {
    font-size: var(--ui-text-xs);
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(250, 247, 235, 0.45);
  }
  .mmc-link {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    font-size: var(--ui-text-xs);
    color: rgba(249, 216, 194, 0.4);
    transition: color 0.15s;
  }
  .mmc-link:hover { color: rgba(249, 216, 194, 0.9); }

  .mmc-status {
    margin: 0;
    font-size: var(--ui-text-sm, 12px);
    color: rgba(250, 247, 235, 0.55);
  }
  .mmc-error { color: var(--red, #ef4444); }

  .mmc-learning { display: flex; flex-direction: column; gap: 8px; }
  .mmc-learning-text {
    margin: 0;
    font-size: var(--ui-text-sm, 12px);
    color: rgba(250, 247, 235, 0.85);
    font-variant-numeric: tabular-nums;
  }
  .mmc-progress {
    height: 6px;
    background: rgba(255, 255, 255, 0.06);
    border-radius: 3px;
    overflow: hidden;
  }
  .mmc-progress-fill {
    height: 100%;
    background: var(--accent-amb, #f5a623);
    transition: width 0.4s ease-out;
  }
  .mmc-hint {
    margin: 0;
    font-size: var(--ui-text-xs);
    color: rgba(250, 247, 235, 0.4);
  }

  .mmc-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .mmc-row {
    display: grid;
    grid-template-columns: 1.4fr 1.2fr auto auto;
    gap: 10px;
    align-items: center;
    padding: 6px 8px;
    background: rgba(255, 255, 255, 0.02);
    border-radius: 6px;
    font-variant-numeric: tabular-nums;
  }
  .mmc-slug {
    font-size: var(--ui-text-sm, 12px);
    color: rgba(250, 247, 235, 0.85);
    font-family: 'JetBrains Mono', monospace;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .mmc-rates {
    display: flex;
    gap: 4px;
    align-items: center;
    font-size: var(--ui-text-xs);
    color: rgba(250, 247, 235, 0.55);
  }
  .mmc-rate-baseline { color: rgba(250, 247, 235, 0.45); }
  .mmc-rate-recent { color: rgba(250, 247, 235, 0.85); font-weight: 600; }
  .mmc-arrow { color: rgba(250, 247, 235, 0.3); }

  .mmc-delta {
    font-size: var(--ui-text-sm, 12px);
    font-weight: 600;
    text-align: right;
    min-width: 48px;
  }
  .mmc-up { color: var(--green, #34d399); }
  .mmc-down { color: var(--red, #ef4444); }
  .mmc-flat { color: rgba(250, 247, 235, 0.5); }

  .mmc-n {
    font-size: var(--ui-text-xs);
    color: rgba(250, 247, 235, 0.4);
    font-family: 'JetBrains Mono', monospace;
  }

  .mmc-caption {
    margin: 0;
    font-size: var(--ui-text-xs);
    color: rgba(250, 247, 235, 0.35);
  }

  @media (max-width: 640px) {
    .mmc-row {
      grid-template-columns: 1fr auto;
      grid-template-areas:
        'slug delta'
        'rates n';
      row-gap: 4px;
    }
    .mmc-slug { grid-area: slug; }
    .mmc-rates { grid-area: rates; }
    .mmc-delta { grid-area: delta; }
    .mmc-n { grid-area: n; text-align: right; }
  }
</style>
