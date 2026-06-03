<script lang="ts">
  import OpportunityCard from './OpportunityCard.svelte';
  import type { OpportunityScore } from '../../../routes/dashboard/+page.server';

  interface Props {
    opportunities?: OpportunityScore[];
  }

  const { opportunities = [] }: Props = $props();

  const top3 = $derived(opportunities.slice(0, 3));
</script>

{#if top3.length > 0}
  <section class="today-opp-list">
    <div class="tol-header">
      <h2 class="tol-title">오늘의 기회</h2>
      <a href="/patterns/search" class="tol-more">전체보기 →</a>
    </div>
    <div class="tol-grid">
      {#each top3 as opp, i}
        <OpportunityCard {opp} rank={i} />
      {/each}
    </div>
  </section>
{/if}

<style>
  .today-opp-list {
    padding: 12px 16px 0;
  }
  .tol-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }
  .tol-title {
    font-size: 11px;
    font-weight: 700;
    color: var(--g9);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin: 0;
  }
  .tol-more {
    font-size: var(--ui-text-xs);
    color: var(--g7);
    text-decoration: none;
  }
  .tol-more:hover { color: var(--g9); }
  .tol-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }
  @media (max-width: 768px) {
    .tol-grid { grid-template-columns: 1fr; }
  }
</style>
