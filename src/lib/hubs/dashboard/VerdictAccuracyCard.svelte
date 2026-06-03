<script lang="ts">
  import { onMount } from 'svelte';

  interface AccuracyData {
    total: number;
    correct: number;
    accuracy: number;
    by_pattern?: Record<string, { total: number; correct: number; accuracy: number }>;
  }

  interface Props {
    userId: string;
  }

  const { userId }: Props = $props();

  let result = $state<AccuracyData | null>(null);
  let loading = $state(true);
  let err = $state('');

  onMount(async () => {
    try {
      const res = await fetch(`/api/users/${userId}/verdict-accuracy`);
      if (!res.ok) throw new Error(`${res.status}`);
      result = (await res.json()) as AccuracyData;
    } catch (e) {
      err = 'accuracy unavailable';
    } finally {
      loading = false;
    }
  });

  function pctColor(pct: number): string {
    if (pct >= 60) return 'var(--accent-pos, #4ade80)';
    if (pct >= 45) return 'var(--accent-amb, #f5a623)';
    return 'var(--accent-neg, #f87171)';
  }
</script>

<div class="vac">
  <div class="vac-header">
    <span class="vac-label">Verdict Accuracy</span>
    <a href="/passport" class="vac-link">Passport →</a>
  </div>

  {#if loading}
    <div class="vac-body vac-skeleton"></div>
  {:else if err}
    <p class="vac-sub vac-err">{err}</p>
  {:else if result !== null}
    {@const pct = Math.round(result.accuracy * 100)}
    <div class="vac-body">
      <span class="vac-num" style="color: {pctColor(pct)}">{pct}%</span>
      <span class="vac-denom">of {result.total}</span>
    </div>
    <p class="vac-sub">{result.correct} correct verdicts</p>
  {/if}
</div>

<style>
  .vac {
    background: var(--surface-2, rgba(255,255,255,0.03));
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 10px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    flex: 1;
    min-width: 0;
  }
  .vac-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .vac-label {
    font-size: var(--ui-text-xs);
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(250,247,235,0.45);
  }
  .vac-link {
    font-size: var(--ui-text-xs);
    color: rgba(249,216,194,0.4);
    text-decoration: none;
    transition: color 0.15s;
  }
  .vac-link:hover { color: rgba(249,216,194,0.8); }
  .vac-body {
    display: flex;
    align-items: baseline;
    gap: 8px;
    min-height: 40px;
  }
  .vac-num {
    font-size: 2.5rem;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
    line-height: 1;
  }
  .vac-denom {
    font-size: 0.85rem;
    color: rgba(250,247,235,0.45);
  }
  .vac-sub {
    margin: 0;
    font-size: 11px;
    color: rgba(250,247,235,0.5);
    font-family: 'JetBrains Mono', monospace;
  }
  .vac-err { color: var(--accent-neg, #f87171); }
  .vac-skeleton {
    height: 40px;
    background: rgba(255,255,255,0.05);
    border-radius: 6px;
    animation: pulse 1.4s ease-in-out infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 0.4; }
    50% { opacity: 0.7; }
  }
</style>
