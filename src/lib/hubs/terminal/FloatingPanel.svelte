<script lang="ts">
  /**
   * FloatingPanel — drag/resize wrapper for any Terminal panel that opts
   * out of its grid cell.
   *
   * Usage:
   *
   *   {#if $panelState.mode === 'floating'}
   *     <FloatingPanel
   *       id="watchlist"
   *       title="Watchlist"
   *       onDock={() => floatingPanels.dock('watchlist')}
   *     >
   *       <WatchlistRail ... />
   *     </FloatingPanel>
   *   {/if}
   *
   * State (position, size, mode) lives in `floatingPanels` store. This
   * component is presentational + interaction-only. The caller decides
   * *whether* to render it; the component decides where on screen.
   */
  import { onMount } from 'svelte';
  import type { Snippet } from 'svelte';
  import { floatingPanels, type PanelGeometry } from './floatingPanels.store';

  interface Props {
    id: string;
    title: string;
    onDock?: () => void;
    children: Snippet;
  }

  const { id, title, onDock, children }: Props = $props();

  // Subscribe to *this* panel's slice of the store. Named `panelState`
  // (not `state`) so the svelte compiler doesn't mistake property access
  // like `state.geometry` for a $state-rune store dereference.
  const panelState = $derived($floatingPanels[id]);
  const geom: PanelGeometry = $derived(panelState?.geometry ?? { x: 100, y: 100, w: 320, h: 480 });
  // Stacking: base 220 (above AppTopBar 180 + sticky hub-nav 10, below
  // modals). Add the panel's per-session zOrder so the most recently
  // touched panel sits strictly above the rest. The store guarantees a
  // monotonically increasing counter so values can't drift apart.
  const stackZ = $derived(220 + (panelState?.zOrder ?? 0));

  // Drag state — local to this component, not in the store. The store
  // takes the final commit on drag-end so we don't thrash localStorage
  // on every pointermove.
  type DragOrigin = { pointerX: number; pointerY: number; panelX: number; panelY: number };
  type ResizeOrigin = { pointerX: number; pointerY: number; panelW: number; panelH: number };
  let dragOrigin: DragOrigin | null = $state(null);
  let resizeOrigin: ResizeOrigin | null = $state(null);

  // Pending visual position during a drag — committed to the store on
  // pointerup. Keeps the drag at 60fps without flooding the store.
  let pendingX: number | null = $state(null);
  let pendingY: number | null = $state(null);
  let pendingW: number | null = $state(null);
  let pendingH: number | null = $state(null);

  const renderedX = $derived(pendingX ?? geom.x);
  const renderedY = $derived(pendingY ?? geom.y);
  const renderedW = $derived(pendingW ?? geom.w);
  const renderedH = $derived(pendingH ?? geom.h);

  const MIN_W = 200;
  const MIN_H = 160;

  // Snap-to-edge: when the *pointer* (not the panel) is within this many
  // pixels of the viewport's left or right edge during a drag, preview a
  // half-pane snap. Threshold lives on the pointer rather than on the
  // panel rect so the trigger is intuitive at any panel size — "I want
  // to throw this against the left wall" is a pointer gesture, not a
  // geometry coincidence. Tuned to match common tiling WMs (i3, fancy-
  // zones) where 16–32px is the standard hot-strip.
  const SNAP_THRESHOLD_PX = 24;

  interface SnapPreview { x: number; y: number; w: number; h: number; edge: 'left' | 'right' }
  let snapPreview: SnapPreview | null = $state(null);

  function clampToViewport(x: number, y: number): { x: number; y: number } {
    if (typeof window === 'undefined') return { x, y };
    // Leave 24px of edge so the title bar can always be grabbed back.
    const maxX = window.innerWidth - 80;
    const maxY = window.innerHeight - 32;
    return {
      x: Math.max(-renderedW + 80, Math.min(x, maxX)),
      y: Math.max(0, Math.min(y, maxY)),
    };
  }

  function detectSnap(pointerX: number, pointerY: number): SnapPreview | null {
    if (typeof window === 'undefined') return null;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    // Leave the AppTopBar (32px) clear of the snap region so a left-half
    // snap doesn't cover the page label / topbar controls.
    const topReserve = 32;
    const halfW = Math.floor(vw / 2);
    const fullH = vh - topReserve;
    if (pointerX < SNAP_THRESHOLD_PX) {
      return { x: 0, y: topReserve, w: halfW, h: fullH, edge: 'left' };
    }
    if (pointerX > vw - SNAP_THRESHOLD_PX) {
      return { x: vw - halfW, y: topReserve, w: halfW, h: fullH, edge: 'right' };
    }
    // Pointer Y near the top *and* away from the side edges → ignore.
    // We deliberately don't surface a top-edge maximize snap in v1; the
    // chart + topbar are both at the top and conflating "throw to top"
    // with "maximize" tends to surprise users mid-drag.
    void pointerY;
    return null;
  }

  function onTitlePointerDown(e: PointerEvent) {
    // Only left-click drags. Right-click + middle-click are reserved for
    // future context menus / open-in-new-window flows.
    if (e.button !== 0) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragOrigin = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      panelX: renderedX,
      panelY: renderedY,
    };
  }

  function onTitlePointerMove(e: PointerEvent) {
    if (!dragOrigin) return;
    const dx = e.clientX - dragOrigin.pointerX;
    const dy = e.clientY - dragOrigin.pointerY;
    const next = clampToViewport(dragOrigin.panelX + dx, dragOrigin.panelY + dy);
    pendingX = next.x;
    pendingY = next.y;
    // Snap detection runs in parallel — the panel keeps tracking the
    // pointer (so the user sees their drag respected) while the preview
    // overlay shows where a release-here would land. Release decides.
    snapPreview = detectSnap(e.clientX, e.clientY);
  }

  function onTitlePointerUp(e: PointerEvent) {
    if (!dragOrigin) return;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    if (snapPreview) {
      // Snap wins over the free-drag position. Commit the snap geometry
      // wholesale (x/y/w/h all change at once) so the panel jumps to its
      // tiled position with a single store write.
      floatingPanels.setGeometry(id, {
        x: snapPreview.x,
        y: snapPreview.y,
        w: snapPreview.w,
        h: snapPreview.h,
      });
    } else if (pendingX !== null && pendingY !== null) {
      floatingPanels.setGeometry(id, { x: pendingX, y: pendingY });
    }
    dragOrigin = null;
    pendingX = null;
    pendingY = null;
    snapPreview = null;
  }

  function onResizePointerDown(e: PointerEvent) {
    if (e.button !== 0) return;
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    resizeOrigin = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      panelW: renderedW,
      panelH: renderedH,
    };
  }

  function onResizePointerMove(e: PointerEvent) {
    if (!resizeOrigin) return;
    const dw = e.clientX - resizeOrigin.pointerX;
    const dh = e.clientY - resizeOrigin.pointerY;
    pendingW = Math.max(MIN_W, resizeOrigin.panelW + dw);
    pendingH = Math.max(MIN_H, resizeOrigin.panelH + dh);
  }

  function onResizePointerUp(e: PointerEvent) {
    if (!resizeOrigin) return;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    if (pendingW !== null && pendingH !== null) {
      floatingPanels.setGeometry(id, { w: pendingW, h: pendingH });
    }
    resizeOrigin = null;
    pendingW = null;
    pendingH = null;
  }

  // Keyboard support — the title bar is focusable so a user navigating
  // by keyboard can reach the dialog and still operate it without a
  // pointer. Arrow keys nudge by KBD_STEP px, Shift+Arrow resizes,
  // Escape docks back. Modeled after window-manager keyboard motion
  // (10px feels responsive without requiring 100 keypresses to cross
  // a 1440px viewport).
  const KBD_STEP = 10;

  function onTitleKeydown(e: KeyboardEvent) {
    // Don't fight typing or text-input shortcuts — if the user focused
    // the title bar by accident while typing in a child input, native
    // events still pass through.
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    let handled = false;
    const cur = geom;
    if (e.key === 'Escape') {
      floatingPanels.dock(id);
      handled = true;
    } else if (e.key === 'ArrowLeft') {
      handled = true;
      if (e.shiftKey) {
        floatingPanels.setGeometry(id, { w: Math.max(MIN_W, cur.w - KBD_STEP) });
      } else {
        const next = clampToViewport(cur.x - KBD_STEP, cur.y);
        floatingPanels.setGeometry(id, { x: next.x, y: next.y });
      }
    } else if (e.key === 'ArrowRight') {
      handled = true;
      if (e.shiftKey) {
        floatingPanels.setGeometry(id, { w: cur.w + KBD_STEP });
      } else {
        const next = clampToViewport(cur.x + KBD_STEP, cur.y);
        floatingPanels.setGeometry(id, { x: next.x, y: next.y });
      }
    } else if (e.key === 'ArrowUp') {
      handled = true;
      if (e.shiftKey) {
        floatingPanels.setGeometry(id, { h: Math.max(MIN_H, cur.h - KBD_STEP) });
      } else {
        const next = clampToViewport(cur.x, cur.y - KBD_STEP);
        floatingPanels.setGeometry(id, { x: next.x, y: next.y });
      }
    } else if (e.key === 'ArrowDown') {
      handled = true;
      if (e.shiftKey) {
        floatingPanels.setGeometry(id, { h: cur.h + KBD_STEP });
      } else {
        const next = clampToViewport(cur.x, cur.y + KBD_STEP);
        floatingPanels.setGeometry(id, { x: next.x, y: next.y });
      }
    }
    if (handled) {
      e.preventDefault();
      e.stopPropagation();
      floatingPanels.bringToFront(id);
    }
  }

  // On mount, clamp the persisted geometry to the current viewport — a
  // user who saved a wide-monitor placement and reopens on a laptop
  // shouldn't have the panel land 500px off-screen.
  onMount(() => {
    if (typeof window === 'undefined') return;
    const clamped = clampToViewport(geom.x, geom.y);
    if (clamped.x !== geom.x || clamped.y !== geom.y) {
      floatingPanels.setGeometry(id, clamped);
    }
  });
</script>

<div
  class="floating-panel"
  role="dialog"
  aria-label={title}
  style:left="{renderedX}px"
  style:top="{renderedY}px"
  style:width="{renderedW}px"
  style:height="{renderedH}px"
  style:z-index={stackZ}
  data-panel-id={id}
  onpointerdowncapture={() => floatingPanels.bringToFront(id)}
>
  <!-- The title bar is the drag handle *and* the keyboard surface for
       the floating window. Pointer users grab it; keyboard users
       Tab to it, then use arrows/Shift+arrows/Escape to operate the
       window without a mouse.
       role="toolbar" gives it interactive semantics (matching the
       interactive pointerdown/keydown listeners) while still letting
       child controls (the Dock button) live inside. -->
  <header
    class="fp-title"
    role="toolbar"
    tabindex="0"
    aria-label="{title} — drag handle. Arrow keys move, Shift+arrows resize, Escape docks."
    onpointerdown={onTitlePointerDown}
    onpointermove={onTitlePointerMove}
    onpointerup={onTitlePointerUp}
    onpointercancel={onTitlePointerUp}
    onkeydown={onTitleKeydown}
  >
    <span class="fp-title-text">{title}</span>
    <button
      type="button"
      class="fp-dock-btn"
      onclick={() => onDock?.()}
      title="Dock back to its column ([)"
      aria-label="Dock {title}"
    >⤡</button>
  </header>

  <div class="fp-body">
    {@render children()}
  </div>

  <button
    type="button"
    class="fp-resize-handle"
    onpointerdown={onResizePointerDown}
    onpointermove={onResizePointerMove}
    onpointerup={onResizePointerUp}
    onpointercancel={onResizePointerUp}
    aria-label="Resize {title}"
    tabindex="-1"
  ></button>
</div>

{#if snapPreview}
  <!-- Snap preview overlay — purely visual, no pointer events so the
       active drag's pointermove keeps reaching the title bar. Painted
       above the floating panel (z 240 > base 220 + max zOrder) so the
       outline is visible even when the panel itself overlaps the zone. -->
  <div
    class="fp-snap-preview"
    aria-hidden="true"
    style:left="{snapPreview.x}px"
    style:top="{snapPreview.y}px"
    style:width="{snapPreview.w}px"
    style:height="{snapPreview.h}px"
  ></div>
{/if}

<style>
  .floating-panel {
    position: fixed;
    z-index: 220; /* above AppTopBar (180) + sticky hub-nav (10), below modals */
    background: linear-gradient(180deg, rgba(10, 10, 11, 0.97), rgba(6, 6, 7, 0.97));
    border: 1px solid rgba(249, 216, 194, 0.12);
    border-radius: 8px;
    box-shadow:
      0 24px 60px rgba(0, 0, 0, 0.48),
      0 4px 16px rgba(0, 0, 0, 0.24);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-width: 200px;
    min-height: 160px;
  }

  .fp-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 28px;
    padding: 0 10px;
    background: rgba(255, 255, 255, 0.03);
    border-bottom: 1px solid rgba(249, 216, 194, 0.07);
    cursor: grab;
    user-select: none;
    flex-shrink: 0;
  }
  .fp-title:active {
    cursor: grabbing;
  }
  /* Keyboard focus on the title bar gets a strong indicator — the title
     is the operating surface for keyboard users (arrows/shift+arrows/
     escape), so the focus ring must signal "this is interactive". */
  .fp-title:focus-visible {
    outline: 2px solid rgba(219, 154, 159, 0.7);
    outline-offset: -2px;
    background: rgba(255, 255, 255, 0.06);
  }

  .fp-title-text {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(250, 247, 235, 0.72);
  }

  .fp-dock-btn {
    width: 22px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 4px;
    color: rgba(250, 247, 235, 0.48);
    font-size: 13px;
    cursor: pointer;
    transition: color 0.12s, background 0.12s, border-color 0.12s;
  }
  .fp-dock-btn:hover {
    color: rgba(250, 247, 235, 0.92);
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(249, 216, 194, 0.16);
  }

  .fp-body {
    flex: 1;
    overflow: hidden;
    min-height: 0;
    /* Children expect to fill their grid cell — give them one. */
    display: flex;
    flex-direction: column;
  }

  /* Resize handle: 12×12 corner triangle, click target large enough that
     users don't have to pixel-hunt. Tabindex -1 keeps it off the keyboard
     tour — keyboard resize lives in a future iteration. */
  .fp-resize-handle {
    position: absolute;
    right: 0;
    bottom: 0;
    width: 16px;
    height: 16px;
    background: transparent;
    border: none;
    cursor: nwse-resize;
    padding: 0;
  }
  .fp-resize-handle::after {
    content: '';
    position: absolute;
    right: 2px;
    bottom: 2px;
    width: 8px;
    height: 8px;
    border-right: 2px solid rgba(250, 247, 235, 0.22);
    border-bottom: 2px solid rgba(250, 247, 235, 0.22);
    transition: border-color 0.12s;
  }
  .fp-resize-handle:hover::after {
    border-right-color: rgba(250, 247, 235, 0.6);
    border-bottom-color: rgba(250, 247, 235, 0.6);
  }

  .fp-snap-preview {
    position: fixed;
    z-index: 240;
    pointer-events: none;
    border: 1.5px solid rgba(219, 154, 159, 0.8);
    background:
      radial-gradient(ellipse at 50% 0%, rgba(219, 154, 159, 0.16), transparent 60%),
      rgba(219, 154, 159, 0.06);
    border-radius: 6px;
    box-shadow: 0 0 0 1px rgba(219, 154, 159, 0.32), 0 8px 32px rgba(219, 154, 159, 0.18);
    transition: left 0.08s ease, top 0.08s ease, width 0.08s ease, height 0.08s ease;
  }
</style>
