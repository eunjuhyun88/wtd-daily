<script lang="ts">
  /**
   * ModeCard — one of three mode tiles (standard / conservative /
   * aggressive) in the §B detail page (W-0414 PR8C). Renders a status
   * badge plus the engine-supplied reasoning string.
   */
  import type { ModeStatusOut } from '$lib/types/research';

  interface Props {
    mode: 'standard' | 'conservative' | 'aggressive';
    status?: ModeStatusOut;
  }
  const { mode, status }: Props = $props();

  function statusLabel(s: string): string {
    return s.replace('_', ' ').toUpperCase();
  }
  function statusGlyph(s: string): string {
    switch (s) {
      case 'accept':      return '✓';
      case 'watch':       return '!';
      case 'block':       return '×';
      case 'force_block': return '⨯';
      case 'cold_start':  return '◯';
      default:            return '?';
    }
  }
</script>

<article class="mode-card" data-testid="mode-card" data-mode={mode}>
  <header class="mc-head">
    <span class="mc-name">{mode}</span>
    {#if status}
      <span
        class="status-badge status-{status.status}"
        data-status={status.status}
        aria-label={`${mode} ${statusLabel(status.status)}`}
      >
        <span class="glyph" aria-hidden="true">{statusGlyph(status.status)}</span>
        <span class="label">{statusLabel(status.status)}</span>
      </span>
    {:else}
      <span class="status-badge status-missing" aria-label="no data">—</span>
    {/if}
  </header>
  {#if status}
    <p class="mc-reasoning">{status.reasoning}</p>
  {:else}
    <p class="mc-reasoning muted">no data</p>
  {/if}
</article>

<style>
  .mode-card {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px;
    border: 1px solid rgba(249, 216, 194, 0.08);
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.015);
    font-family: var(--ui-font-mono);
  }
  .mc-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
  }
  .mc-name {
    font-size: var(--ui-text-xs);
    color: rgba(250, 247, 235, 0.55);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-weight: 600;
  }
  .mc-reasoning {
    margin: 0;
    font-size: var(--ui-text-sm);
    color: rgba(250, 247, 235, 0.78);
    line-height: 1.5;
  }
  .mc-reasoning.muted { color: rgba(250, 247, 235, 0.4); }

  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: var(--ui-text-xs);
    font-weight: 600;
    letter-spacing: 0.04em;
    line-height: 1;
    border: 1px solid transparent;
  }
  .status-accept {
    color: var(--sc-green-300);
    background: rgba(34, 197, 94, 0.12);
    border-color: rgba(34, 197, 94, 0.35);
  }
  .status-watch {
    color: var(--sc-yellow-300);
    background: rgba(234, 179, 8, 0.12);
    border-color: rgba(234, 179, 8, 0.35);
  }
  .status-block {
    color: var(--sc-grey-9);
    background: rgba(102, 102, 102, 0.18);
    border-color: rgba(102, 102, 102, 0.4);
  }
  .status-force_block {
    color: var(--sc-red-300);
    background: rgba(239, 68, 68, 0.14);
    border-color: rgba(239, 68, 68, 0.45);
  }
  .status-cold_start {
    color: var(--sc-blue-300);
    background: rgba(59, 130, 246, 0.12);
    border-color: rgba(59, 130, 246, 0.35);
  }
  .status-missing {
    color: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.08);
  }
</style>
