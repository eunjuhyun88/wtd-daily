<script lang="ts">
  interface Props {
    regime?: string;
  }

  const { regime = 'neutral' }: Props = $props();

  const label = $derived(
    regime === 'bull' ? '🟢 Bull'
    : regime === 'bear' ? '🔴 Bear'
    : '⚪ Neutral'
  );
</script>

<div class="macro-regime-card">
  <span class="mrc-label">Macro</span>
  <span class="mrc-value">{label}</span>
</div>

<style>
  .macro-regime-card {
    background: var(--surface-1, rgba(255,255,255,0.02));
    border: 1px solid rgba(249,216,194,0.07);
    border-radius: 8px;
    padding: 10px 12px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }
  .mrc-label {
    font-size: var(--ui-text-xs);
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(250,247,235,0.35);
  }
  .mrc-value {
    font-size: 13px;
    font-weight: 700;
    color: rgba(250,247,235,0.8);
  }
</style>
