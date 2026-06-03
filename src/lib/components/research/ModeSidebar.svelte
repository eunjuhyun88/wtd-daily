<script lang="ts">
  /**
   * ModeSidebar — Option C Hybrid (W-0414 PR8D).
   *
   * Renders a vertical stack of three mini mode cards (standard /
   * conservative / aggressive) on desktop (>=1024px), or a horizontal
   * 1-row stack on tablet (768~1023px). Hidden below 768px (the parent
   * page renders <CompactModeBadges> instead).
   *
   * Clicking a mini card invokes onSelect(mode) so the parent page can
   * swap which mode the body ModeCard renders.
   */
  import type { ModeStatusOut } from '$lib/types/research';

  type Mode = 'standard' | 'conservative' | 'aggressive';

  interface Props {
    modes: Record<string, ModeStatusOut>;
    activeMode: Mode;
    conflict?: boolean;
    onSelect: (mode: Mode) => void;
  }

  const { modes, activeMode, conflict = false, onSelect }: Props = $props();

  const ORDER: Mode[] = ['standard', 'conservative', 'aggressive'];

  function statusLabel(s: string | undefined): string {
    if (!s) return '—';
    return s.replace('_', ' ').toUpperCase();
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

<aside class="mode-sidebar" data-testid="mode-sidebar" data-variant="sidebar">
  <h3 class="ms-title">Other modes</h3>

  <div class="ms-list">
    {#each ORDER as mode (mode)}
      {@const status = modes[mode]}
      <button
        type="button"
        class="ms-card"
        class:active={mode === activeMode}
        data-testid="mode-mini-card"
        data-mode={mode}
        aria-pressed={mode === activeMode}
        onclick={() => onSelect(mode)}
      >
        <span class="ms-mode">{mode}</span>
        {#if status}
          <span
            class="status-badge status-{status.status}"
            data-status={status.status}
          >
            <span class="glyph" aria-hidden="true">{statusGlyph(status.status)}</span>
            <span class="label">{statusLabel(status.status)}</span>
          </span>
        {:else}
          <span class="status-badge status-missing">—</span>
        {/if}
      </button>
    {/each}
  </div>

  {#if conflict}
    <div class="ms-conflict" data-testid="mode-sidebar-conflict">
      <span class="ms-conflict-icon" aria-hidden="true">⚠</span>
      <span>Mode conflict</span>
    </div>
  {/if}
</aside>

<style>
  .mode-sidebar {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 12px;
    border: 1px solid rgba(249, 216, 194, 0.08);
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.012);
    font-family: var(--ui-font-mono);
  }
  .ms-title {
    margin: 0;
    font-size: var(--ui-text-xs);
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(250, 247, 235, 0.55);
  }
  .ms-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .ms-card {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
    padding: 8px 10px;
    border: 1px solid rgba(249, 216, 194, 0.08);
    border-radius: 3px;
    background: rgba(255, 255, 255, 0.015);
    color: inherit;
    font-family: inherit;
    text-align: left;
    cursor: pointer;
    transition: border-color 120ms ease, background 120ms ease;
  }
  .ms-card:hover {
    border-color: rgba(249, 216, 194, 0.22);
    background: rgba(255, 255, 255, 0.03);
  }
  .ms-card.active {
    border-color: rgba(249, 216, 194, 0.45);
    background: rgba(249, 216, 194, 0.06);
  }
  .ms-mode {
    font-size: var(--ui-text-xs);
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: rgba(250, 247, 235, 0.75);
  }

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

  .ms-conflict {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 8px;
    border-radius: 3px;
    font-size: var(--ui-text-xs);
    color: var(--sc-red-300);
    background: rgba(239, 68, 68, 0.08);
    border: 1px solid rgba(239, 68, 68, 0.3);
  }

  /* Tablet: collapse to a horizontal 1-row above the body. */
  @media (max-width: 1023px) {
    .ms-list {
      flex-direction: row;
      flex-wrap: wrap;
    }
    .ms-card {
      flex: 1 1 auto;
      min-width: 120px;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
    }
  }

  /* Mobile: hidden — CompactModeBadges renders instead. */
  @media (max-width: 768px) {
    .mode-sidebar { display: none; }
  }
</style>
