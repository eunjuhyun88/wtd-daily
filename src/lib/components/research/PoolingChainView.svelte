<script lang="ts">
  /**
   * PoolingChainView — 3-row tree (cell → parent → grandparent) for the
   * §B detail page (W-0414 PR8C). Each row shows key + n + weight.
   */
  import type { PoolingChainOut, PoolingNodeOut } from '$lib/types/research';

  interface Props {
    chain: PoolingChainOut;
  }
  const { chain }: Props = $props();

  function fmtWeight(w: number): string {
    return Number.isFinite(w) ? w.toFixed(2) : '—';
  }

  type Row = { tier: 'cell' | 'parent' | 'grand'; node: PoolingNodeOut | null };
  const rows = $derived<Row[]>([
    { tier: 'cell',   node: chain.cell },
    { tier: 'parent', node: chain.parent },
    { tier: 'grand',  node: chain.grandparent },
  ]);
</script>

<div class="pooling-chain" data-testid="pooling-chain">
  {#each rows as { tier, node } (tier)}
    <div class="pc-row pc-{tier}" data-tier={tier} data-testid="pooling-row">
      <span class="pc-tier">{tier}</span>
      {#if node}
        <span class="pc-key" title={node.key}>{node.key}</span>
        <span class="pc-n">n={node.n}</span>
        <span class="pc-weight">w={fmtWeight(node.weight)}</span>
      {:else}
        <span class="pc-key muted">—</span>
        <span class="pc-n muted">—</span>
        <span class="pc-weight muted">—</span>
      {/if}
    </div>
  {/each}
</div>

<style>
  .pooling-chain {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-family: var(--ui-font-mono);
    font-size: var(--ui-text-sm);
  }
  .pc-row {
    display: grid;
    grid-template-columns: 70px 1fr 80px 80px;
    align-items: center;
    gap: 8px;
    padding: 6px 10px;
    border: 1px solid rgba(249, 216, 194, 0.08);
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.015);
  }
  .pc-tier {
    color: rgba(250, 247, 235, 0.5);
    font-size: var(--ui-text-xs);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-weight: 600;
  }
  .pc-key {
    color: rgba(250, 247, 235, 0.85);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .pc-n, .pc-weight {
    color: rgba(250, 247, 235, 0.65);
    font-variant-numeric: var(--ui-tabular);
    text-align: right;
  }
  .muted { color: rgba(250, 247, 235, 0.3); }

  @media (max-width: 768px) {
    .pc-row {
      grid-template-columns: 60px 1fr 56px 56px;
      gap: 6px;
      padding: 5px 8px;
      font-size: var(--ui-text-xs);
    }
  }
</style>
