<script lang="ts">
  import { selectedSlug, aiDrawerOpen, aiDrawerContext, type PatternsTab } from '$lib/stores/patternsHub';
  import { phaseMetaFor } from '$lib/contracts';
  import type { PatternStateView } from '$lib/contracts';
  import type { PatternStats } from '$lib/types/patternStats';

  interface Props {
    states: PatternStateView[];
    stats: PatternStats[];
    tab?: string;
  }
  const { states, stats, tab = 'discover' }: Props = $props();

  const slug = $derived($selectedSlug);
  const st = $derived(stats.find(s => s.pattern_slug === slug));
  const firstState = $derived(states.find(s => s.patternSlug === slug));

  const totalPhases = $derived(firstState?.totalPhases ?? 5);
  const currentPhaseIdx = $derived(firstState?.phaseIdx ?? -1);

  function grade(hit_rate: number | null): string {
    if (hit_rate == null) return '';
    if (hit_rate >= 0.70) return 'S';
    if (hit_rate >= 0.55) return 'A';
    if (hit_rate >= 0.40) return 'B';
    return 'C';
  }

  function openAIDrawer() {
    aiDrawerContext.set({ tab: tab as PatternsTab, slug });
    aiDrawerOpen.set(true);
  }
</script>

{#if slug}
  <div class="pattern-header">
    <div class="ph-left">
      <span class="ph-slug">{slug}</span>
      {#if st}
        {@const g = grade(st.hit_rate)}
        {#if g}<span class="ph-grade ph-grade-{g.toLowerCase()}">{g}</span>{/if}
        {#if st.hit_rate != null}
          <span class="ph-wr">WR {(st.hit_rate * 100).toFixed(0)}%</span>
        {/if}
        {#if st.total_instances > 0}
          <span class="ph-n">n={st.total_instances}</span>
        {/if}
      {/if}
    </div>
    <div class="ph-stepper">
      {#each Array(totalPhases) as _, i}
        {@const meta = phaseMetaFor(null, null, i)}
        <span
          class="ph-step"
          class:ph-step-active={i === currentPhaseIdx}
          class:ph-step-past={i < currentPhaseIdx}
          style="--c:{meta.color}"
          title={meta.label}
        ></span>
        {#if i < totalPhases - 1}<span class="ph-sep">→</span>{/if}
      {/each}
      {#if firstState}
        <span class="ph-phase-label" style="color:{phaseMetaFor(null, firstState.phaseLabel, currentPhaseIdx).color}">
          {firstState.phaseLabel}
        </span>
      {/if}
    </div>
    <button class="ph-paper-btn" onclick={openAIDrawer} type="button">Paper+</button>
  </div>
{:else}
  <div class="pattern-header-empty">
    <span class="ph-empty-hint">← 사이드바에서 패턴을 선택하면 분석이 표시됩니다</span>
  </div>
{/if}

<style>
  .pattern-header {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 0 16px;
    height: 48px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.07);
    background: rgba(0, 0, 0, 0.2);
    flex-shrink: 0;
  }
  .ph-left {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }
  .ph-slug {
    font-family: var(--sc-font-mono, monospace);
    font-size: 13px;
    font-weight: 700;
    color: #fff;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .ph-grade {
    font-size: 11px;
    font-weight: 700;
    padding: 1px 5px;
    border-radius: 3px;
    flex-shrink: 0;
  }
  .ph-grade-s { color: #fbbf24; background: rgba(251, 191, 36, 0.15); }
  .ph-grade-a { color: #4ade80; background: rgba(74, 222, 128, 0.12); }
  .ph-grade-b { color: #60a5fa; background: rgba(96, 165, 250, 0.12); }
  .ph-grade-c { color: rgba(255, 255, 255, 0.4); background: rgba(255, 255, 255, 0.07); }
  .ph-wr {
    font-size: 12px;
    font-family: var(--sc-font-mono, monospace);
    color: rgba(250, 247, 235, 0.75);
    white-space: nowrap;
  }
  .ph-n {
    font-size: 11px;
    font-family: var(--sc-font-mono, monospace);
    color: rgba(255, 255, 255, 0.35);
    white-space: nowrap;
  }
  .ph-stepper {
    display: flex;
    align-items: center;
    gap: 3px;
    flex: 1;
    overflow: hidden;
  }
  .ph-step {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.12);
    border: 1.5px solid rgba(255, 255, 255, 0.18);
    flex-shrink: 0;
    transition: background 0.15s;
  }
  .ph-step.ph-step-past {
    background: color-mix(in srgb, var(--c) 40%, transparent);
    border-color: var(--c);
  }
  .ph-step.ph-step-active {
    background: var(--c);
    border-color: var(--c);
    box-shadow: 0 0 6px var(--c);
  }
  .ph-sep {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.2);
    flex-shrink: 0;
  }
  .ph-phase-label {
    font-size: 11px;
    font-family: var(--sc-font-mono, monospace);
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    margin-left: 6px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .ph-paper-btn {
    flex-shrink: 0;
    padding: 4px 10px;
    font-size: var(--ui-text-xs, 11px);
    font-family: var(--sc-font-mono, monospace);
    font-weight: 600;
    background: rgba(74, 222, 128, 0.1);
    border: 1px solid rgba(74, 222, 128, 0.3);
    border-radius: 4px;
    color: #4ade80;
    cursor: pointer;
    white-space: nowrap;
  }
  .ph-paper-btn:hover { background: rgba(74, 222, 128, 0.2); }
  .pattern-header-empty {
    display: flex;
    align-items: center;
    padding: 0 16px;
    height: 48px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.07);
    background: rgba(0, 0, 0, 0.1);
    flex-shrink: 0;
  }
  .ph-empty-hint {
    font-size: var(--ui-text-xs, 11px);
    font-family: var(--sc-font-mono, monospace);
    color: rgba(255, 255, 255, 0.3);
  }
</style>
