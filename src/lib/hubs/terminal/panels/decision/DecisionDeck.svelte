<script lang="ts">
  import PanelShell from '$lib/components/ui/PanelShell.svelte';
  import EmptyState from '$lib/components/ui/EmptyState.svelte';
  import ConfidenceGauge from './ConfidenceGauge.svelte';
  import SizerCard from './SizerCard.svelte';
  import { entryPlan } from '$lib/hubs/terminal/cogochi.data.store';

  interface Props {
    symbol: string;
  }
  const { symbol }: Props = $props();

  const plan = $derived($entryPlan);
  const tp1 = $derived(plan?.targets?.[0]?.price ?? 0);
  const tp2 = $derived(plan?.targets?.[1]?.price ?? 0);
  const confidence = $derived(plan?.confidencePct ?? 0);
  const sizerPct = $derived(plan?.sizerPct ?? 0);
</script>

<PanelShell title="DECIDE">
  {#if plan && confidence > 0}
    <ConfidenceGauge confidence={confidence} gate={60} />
    <div class="deck-divider"></div>
    <SizerCard
      {sizerPct}
      entry={plan.entry ?? 0}
      stop={plan.stop ?? 0}
      {tp1}
      {tp2}
      rr={plan.riskReward ?? 0}
      {symbol}
      {confidence}
      gate={60}
    />
  {:else}
    <EmptyState
      icon="◈"
      title="분석 결과 대기 중"
      subtitle="AI 분석 실행 후 포지션 사이즈 계산"
    />
  {/if}
</PanelShell>

<style>
  .deck-divider {
    height: 1px;
    background: var(--sc-line-soft);
    flex-shrink: 0;
    margin: calc(-1 * var(--sc-sp-1));
  }
</style>
