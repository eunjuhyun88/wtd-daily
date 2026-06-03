<script lang="ts">
  interface Props {
    label: string;
    value: string;
    valueClass?: 'pos' | 'neg' | 'amb' | 'muted' | '';
    divider?: boolean;
  }
  const { label, value, valueClass = '', divider = false }: Props = $props();
</script>

<div class="mr" class:mr-divider={divider}>
  <span class="mr-label">{label}</span>
  <span
    class="mr-val"
    class:mr-pos={valueClass === 'pos'}
    class:mr-neg={valueClass === 'neg'}
    class:mr-amb={valueClass === 'amb'}
    class:mr-muted={valueClass === 'muted'}
  >{value}</span>
</div>

<style>
  .mr {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: var(--sc-sp-2);
    font-size: var(--sc-fs-xs);
  }

  .mr-divider {
    margin-top: var(--sc-sp-1);
    padding-top: var(--sc-sp-1);
    border-top: 1px solid var(--sc-line-soft);
    font-weight: 600;
  }

  .mr-label {
    color: var(--sc-text-2);
    font-family: var(--sc-font-mono);
    white-space: nowrap;
  }

  .mr-val {
    font-variant-numeric: tabular-nums;
    font-feature-settings: "tnum", "zero";
    color: var(--sc-text-0);
    font-family: var(--sc-font-mono);
    text-align: right;
  }

  .mr-pos   { color: var(--accent-pos); }
  .mr-neg   { color: var(--accent-neg); }
  .mr-amb   { color: var(--accent-amb); }
  .mr-muted { color: var(--sc-text-2); }
</style>
