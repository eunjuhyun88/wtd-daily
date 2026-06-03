<script lang="ts">
  /**
   * InternalSurfaceSheet — W-0498 PR5c / PR5e
   * Persistent resizable Bottom Sheet for terminal mobile.
   * - Drag the grip handle up/down to freely resize height
   * - Snaps to peek (44px) / half (~45vh) / tall (~85vh) on release
   * - Surface content area grows/shrinks with sheet
   *
   * Position: fixed, bottom = 56px BottomTab + safe-area. z-index 130.
   */
  import { browser } from '$app/environment';
  import { surfaceMode, type InternalSurface } from '$lib/stores/surfaceMode';
  import AIAgentPanel from './panels/AIAgentPanel/AIAgentPanel.svelte';
  import IntelPanel from './panels/IntelPanel.svelte';
  import PatternsTerminalPanel from './panels/PatternsTerminalPanel.svelte';
  import LivePaperPanel from '$lib/components/paper/LivePaperPanel.svelte';
  import InboxPanel from './inbox/InboxPanel.svelte';

  interface Props {
    symbol: string;
    timeframe: string;
  }
  const { symbol, timeframe }: Props = $props();

  const TABS: { id: InternalSurface; label: string }[] = [
    { id: 'chart',  label: 'CHT'   },
    { id: 'ai',     label: 'AI'    },
    { id: 'intel',  label: 'INTEL' },
    { id: 'pat',    label: 'PAT'   },
    { id: 'paper',  label: 'PPR'   },
    { id: 'inbox',  label: 'INBOX' },
  ];

  const STRIP_H   = 44;   // px — compact tab strip height
  const BOTTOM_NAV = 56;  // px — MobileBottomNav (safe-area handled in CSS)

  function snapHalf() { return browser ? Math.round(window.innerHeight * 0.45) : 320; }
  function snapTall() { return browser ? Math.round(window.innerHeight * 0.85) : 620; }

  // Sheet height controlled locally; surfaceMode tracks active/state for URL sync
  let sheetH = $state(STRIP_H);
  let isResizing = $state(false);
  let _resizeStartY = 0;
  let _resizeStartH = 0;

  function nearestSnap(h: number): number {
    const points = [STRIP_H, snapHalf(), snapTall()];
    return points.reduce((a, b) => Math.abs(b - h) < Math.abs(a - h) ? b : a);
  }

  function onHandleTouchStart(e: TouchEvent) {
    _resizeStartY = e.touches[0].clientY;
    _resizeStartH = sheetH;
    isResizing = true;
  }

  function onHandleTouchMove(e: TouchEvent) {
    if (!isResizing) return;
    e.preventDefault();
    const dy = _resizeStartY - e.touches[0].clientY; // positive = drag up = grow
    const maxH = (browser ? window.innerHeight : 800) * 0.92 - BOTTOM_NAV;
    sheetH = Math.max(STRIP_H, Math.min(maxH, _resizeStartH + dy));
  }

  function onHandleTouchEnd() {
    if (!isResizing) return;
    isResizing = false;
    sheetH = nearestSnap(sheetH);
    if (sheetH <= STRIP_H) {
      surfaceMode.collapse();
    } else {
      surfaceMode.expand();
    }
  }

  function onTabClick(id: InternalSurface) {
    surfaceMode.setActive(id);
    // Auto-expand when tapping a non-chart tab while peeked
    if (sheetH <= STRIP_H && id !== 'chart') {
      sheetH = snapHalf();
      surfaceMode.expand();
    }
  }

  // Sync from external surfaceMode changes (URL navigation / store updates)
  $effect(() => {
    const state = $surfaceMode.sheetState;
    if (state === 'peek' && sheetH > STRIP_H) {
      sheetH = STRIP_H;
    } else if (state === 'expanded' && sheetH <= STRIP_H) {
      sheetH = snapHalf();
    }
  });
</script>

<div
  class="surface-sheet"
  class:is-resizing={isResizing}
  style:height="{sheetH}px"
>
  <!-- Strip: always visible — drag handle + tabs (STRIP_H px) -->
  <div
    class="surface-strip"
    ontouchstart={onHandleTouchStart}
    ontouchmove={onHandleTouchMove}
    ontouchend={onHandleTouchEnd}
    role="toolbar"
    tabindex="-1"
    aria-label="Internal surface selector"
  >
    <div class="drag-handle" aria-hidden="true"></div>
    <nav class="surface-tabs" aria-label="Surface tabs">
      {#each TABS as tab}
        <button
          class="tab-btn"
          class:active={$surfaceMode.active === tab.id}
          onclick={() => onTabClick(tab.id)}
          aria-pressed={$surfaceMode.active === tab.id}
          type="button"
        >{tab.label}</button>
      {/each}
    </nav>
  </div>

  <!-- Content: visible when sheet is taller than strip and not on chart tab -->
  {#if sheetH > STRIP_H && $surfaceMode.active !== 'chart'}
    <div class="surface-content">
      {#if $surfaceMode.active === 'ai'}
        <AIAgentPanel {symbol} {timeframe} />
      {:else if $surfaceMode.active === 'intel'}
        <IntelPanel />
      {:else if $surfaceMode.active === 'pat'}
        <PatternsTerminalPanel {symbol} {timeframe} />
      {:else if $surfaceMode.active === 'paper'}
        <LivePaperPanel />
      {:else if $surfaceMode.active === 'inbox'}
        <InboxPanel />
      {/if}
    </div>
  {/if}
</div>

<style>
  .surface-sheet {
    position: fixed;
    left: 0;
    right: 0;
    bottom: calc(56px + env(safe-area-inset-bottom, 0px));
    z-index: 130;
    background: var(--g1, #0c0a09);
    border-top: 1px solid var(--g4, #272320);
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
    display: flex;
    flex-direction: column;
    /* height is set via inline style; transition off during active drag */
    transition: height 0.2s ease;
    contain: layout paint;
    overflow: hidden;
  }

  .surface-sheet.is-resizing {
    transition: none;
  }

  /* Mobile only */
  @media (min-width: 769px) {
    .surface-sheet { display: none; }
  }

  /* Strip: compact 44px — drag handle + tab row */
  .surface-strip {
    flex-shrink: 0;
    height: 44px;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    touch-action: none;   /* prevent scroll interference during resize */
    cursor: row-resize;
    user-select: none;
    -webkit-user-select: none;
  }

  .drag-handle {
    width: 32px;
    height: 3px;
    border-radius: 2px;
    background: var(--g4, #272320);
    margin: 5px auto 3px;
    flex-shrink: 0;
  }

  .surface-tabs {
    flex: 1;
    display: flex;
    align-items: stretch;
    overflow: hidden;
  }

  .tab-btn {
    flex: 1;
    min-width: 0;
    border: none;
    background: transparent;
    border-right: 0.5px solid var(--g3, #1c1918);
    color: var(--g5, #4a4540);
    font-family: var(--sc-font-mono, 'JetBrains Mono', monospace);
    font-size: var(--ui-text-xs, 10px);
    font-weight: 600;
    letter-spacing: 0.06em;
    cursor: pointer;
    padding: 0 2px;
    transition: color 0.12s, background 0.12s;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }

  .tab-btn:last-child { border-right: none; }

  .tab-btn:active { background: var(--g2, #141210); }

  .tab-btn.active {
    color: var(--brand, rgba(249, 216, 194, 0.9));
    background: color-mix(in srgb, var(--brand, rgba(249, 216, 194, 0.9)) 6%, transparent);
    border-top: 1.5px solid var(--brand, rgba(249, 216, 194, 0.9));
  }

  /* Content: fills remaining height; panels scroll internally */
  .surface-content {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior-y: contain;
  }
</style>
