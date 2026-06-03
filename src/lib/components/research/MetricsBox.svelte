<script lang="ts">
  /**
   * MetricsBox — single tile in the §B 6-box metrics row
   * (W-0414 PR8C). Pure presentational: label + value (+ optional sub).
   */
  interface Props {
    label: string;
    value: string;
    sub?: string;
    accent?: 'default' | 'muted' | 'warn';
  }
  const { label, value, sub = '', accent = 'default' }: Props = $props();
</script>

<div class="metrics-box accent-{accent}" data-testid="metrics-box">
  <div class="m-label">{label}</div>
  <div class="m-value">{value}</div>
  {#if sub}
    <div class="m-sub">{sub}</div>
  {/if}
</div>

<style>
  .metrics-box {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 10px 12px;
    border: 1px solid rgba(249, 216, 194, 0.08);
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.015);
    font-family: var(--ui-font-mono);
    min-width: 0;
  }
  .m-label {
    font-size: var(--ui-text-xs);
    color: rgba(250, 247, 235, 0.45);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  .m-value {
    font-size: var(--ui-text-lg);
    font-weight: 600;
    color: rgba(250, 247, 235, 0.92);
    font-variant-numeric: var(--ui-tabular);
    line-height: 1.15;
  }
  .m-sub {
    font-size: var(--ui-text-xs);
    color: rgba(250, 247, 235, 0.5);
  }
  .accent-warn .m-value { color: var(--sc-yellow-300); }
  .accent-muted .m-value { color: rgba(250, 247, 235, 0.55); }

  @media (max-width: 768px) {
    .metrics-box { padding: 8px 10px; }
    .m-value { font-size: var(--ui-text-md, 14px); }
  }
</style>
