<script lang="ts">
  /**
   * CompactModeBadges — mobile (<768px) 1-line glyph row (W-0414 PR8D).
   *
   * Renders all 3 modes as glyph + short label badges in a single row,
   * non-interactive. Hidden at >=768px (the parent renders ModeSidebar).
   */
  import type { ModeStatusOut } from '$lib/types/research';

  type Mode = 'standard' | 'conservative' | 'aggressive';

  interface Props {
    modes: Record<string, ModeStatusOut>;
  }

  const { modes }: Props = $props();

  const ORDER: Mode[] = ['standard', 'conservative', 'aggressive'];

  function shortMode(m: Mode): string {
    switch (m) {
      case 'standard':     return 'Std';
      case 'conservative': return 'Cons';
      case 'aggressive':   return 'Aggr';
    }
  }
  function statusGlyph(s: string | undefined): string {
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

<div class="compact-badges" data-testid="compact-mode-badges" data-variant="compact">
  {#each ORDER as mode (mode)}
    {@const status = modes[mode]}
    <span
      class="cb-item status-{status?.status ?? 'missing'}"
      data-mode={mode}
      data-status={status?.status ?? 'missing'}
      aria-label={`${mode} ${status?.status ?? 'no data'}`}
    >
      <span class="cb-glyph" aria-hidden="true">{statusGlyph(status?.status)}</span>
      <span class="cb-mode">{shortMode(mode)}</span>
    </span>
  {/each}
</div>

<style>
  .compact-badges {
    display: none;
    gap: 6px;
    flex-wrap: nowrap;
    overflow-x: auto;
    font-family: var(--ui-font-mono);
  }
  .cb-item {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 7px;
    border-radius: 3px;
    font-size: var(--ui-text-xs);
    font-weight: 600;
    letter-spacing: 0.04em;
    line-height: 1;
    border: 1px solid transparent;
    flex: 0 0 auto;
  }
  .cb-mode {
    text-transform: uppercase;
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

  @media (max-width: 768px) {
    .compact-badges { display: flex; }
  }
</style>
