<script lang="ts">
  import StreakBadgeCard from '$lib/components/passport/StreakBadgeCard.svelte';
  import { streakSnapshot } from '$lib/stores/streak.store';

  interface Props {
    streakDays?: number;
    nextThreshold?: number | null;
  }

  const { streakDays = 0, nextThreshold = null }: Props = $props();

  const days = $derived($streakSnapshot.streak_days ?? streakDays);
  const next = $derived($streakSnapshot.streak_next_threshold ?? nextThreshold);
</script>

<div class="hero-streak-card">
  <div class="hsc-header">
    <span class="hsc-label">Streak</span>
    <a href="/passport" class="hsc-link">Passport →</a>
  </div>
  <div class="hsc-body">
    <span class="hsc-num">{days}</span>
    <span class="hsc-unit">days 🔥</span>
  </div>
  {#if next !== null}
    <p class="hsc-sub">→ next: {next} ({next - days} more)</p>
  {:else}
    <p class="hsc-sub hsc-sub--done">All badges earned</p>
  {/if}
  <div class="hsc-badge">
    <StreakBadgeCard streak_days={days} streak_next_threshold={next} />
  </div>
</div>

<style>
  .hero-streak-card {
    background: var(--surface-2, rgba(255,255,255,0.03));
    border: 1px solid rgba(245,166,35,0.18);
    border-radius: 10px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    flex: 1;
    min-width: 0;
  }
  .hsc-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .hsc-label {
    font-size: var(--ui-text-xs);
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(250,247,235,0.45);
  }
  .hsc-link {
    font-size: var(--ui-text-xs);
    color: rgba(249,216,194,0.4);
    text-decoration: none;
    transition: color 0.15s;
  }
  .hsc-link:hover { color: rgba(249,216,194,0.8); }
  .hsc-body {
    display: flex;
    align-items: baseline;
    gap: 8px;
  }
  .hsc-num {
    font-size: 2.5rem;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
    line-height: 1;
    color: var(--accent-amb, #f5a623);
  }
  .hsc-unit {
    font-size: 1rem;
    color: rgba(250,247,235,0.7);
  }
  .hsc-sub {
    margin: 0;
    font-size: 11px;
    color: rgba(250,247,235,0.5);
    font-family: 'JetBrains Mono', monospace;
  }
  .hsc-sub--done { color: var(--accent-amb, #f5a623); }
  .hsc-badge { margin-top: 4px; }
</style>
