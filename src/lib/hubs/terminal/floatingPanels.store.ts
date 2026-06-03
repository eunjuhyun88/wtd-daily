/**
 * floatingPanels.store — per-panel docked/floating mode + geometry.
 *
 * Terminal panels (WatchlistRail, AIAgentPanel, ...) historically live in
 * fixed grid cells. Heavy users want to pull one out as a floating window
 * so they can park it over the chart edge, drag it onto a second monitor,
 * or temporarily reclaim the grid column for a wider chart. This store is
 * the single source for that mode + the floating geometry.
 *
 * Geometry is persisted per panel id under `term:floating:v1` so a user's
 * preferred placement survives reloads. Mode itself is *not* persisted in
 * v1 (every session starts docked) — surfacing a floating panel on page
 * load before the user has signalled they want it leads to confusing
 * "where did my watchlist go?" moments. v2 may persist mode behind a
 * settings toggle.
 *
 * Public surface intentionally small: `subscribe`, `setMode`, `setGeometry`,
 * `dock`, `float`. Drag and resize logic live in `FloatingPanel.svelte` —
 * this store only owns state.
 */
import { writable, derived, type Readable } from 'svelte/store';

export type PanelMode = 'docked' | 'floating';

export interface PanelGeometry {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface PanelState {
  mode: PanelMode;
  /** Geometry only used when mode === 'floating'. Stays around while docked
   *  so re-floating restores the user's last placement. */
  geometry: PanelGeometry;
  /** Stacking order — higher wins. Bumped to (current max + 1) whenever
   *  the user interacts with the panel (drag, resize, click on body).
   *  Not persisted: each session restarts stacking from 0 so the order
   *  reflects the current focus pattern, not a stale one from yesterday. */
  zOrder: number;
}

/** Sensible per-panel defaults — only used the first time a panel goes
 *  floating with no persisted geometry. */
const DEFAULT_GEOMETRY: Record<string, PanelGeometry> = {
  watchlist: { x: 80,  y: 80,  w: 280, h: 480 },
  aiagent:   { x: 320, y: 80,  w: 360, h: 520 },
};

const FALLBACK_GEOMETRY: PanelGeometry = { x: 100, y: 100, w: 320, h: 480 };

const STORAGE_KEY = 'term:floating:v1';

type StoreShape = Record<string, PanelState>;

function loadInitial(): StoreShape {
  if (typeof localStorage === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Partial<Record<string, { geometry?: PanelGeometry }>>;
    const out: StoreShape = {};
    for (const [id, val] of Object.entries(parsed)) {
      if (val && val.geometry) {
        out[id] = { mode: 'docked', geometry: val.geometry, zOrder: 0 };
      }
    }
    return out;
  } catch {
    return {};
  }
}

function persist(state: StoreShape) {
  if (typeof localStorage === 'undefined') return;
  try {
    // Persist geometry only — mode is intentionally not restored on reload.
    const slim: Record<string, { geometry: PanelGeometry }> = {};
    for (const [id, val] of Object.entries(state)) {
      slim[id] = { geometry: val.geometry };
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(slim));
  } catch {
    /* quota / privacy mode — drop silently */
  }
}

function defaultGeometryFor(id: string): PanelGeometry {
  return DEFAULT_GEOMETRY[id] ?? FALLBACK_GEOMETRY;
}

function ensure(state: StoreShape, id: string): PanelState {
  if (!state[id]) {
    state[id] = { mode: 'docked', geometry: defaultGeometryFor(id), zOrder: 0 };
  }
  return state[id];
}

function createStore() {
  const inner = writable<StoreShape>(loadInitial());
  // Monotonic counter shared across panels — every `bringToFront` bumps
  // this and assigns it to the panel's zOrder, so the latest-touched
  // panel is always strictly above everything else. Reset on reload.
  let zCounter = 0;

  function setMode(id: string, mode: PanelMode) {
    inner.update((s) => {
      const entry = ensure(s, id);
      entry.mode = mode;
      // Floating a panel implies the user wants to see it — bump it to
      // the top of the stack so it doesn't immediately hide behind a
      // previously-floated panel that happens to overlap its geometry.
      if (mode === 'floating') {
        entry.zOrder = ++zCounter;
      }
      return s;
    });
  }

  function setGeometry(id: string, geometry: Partial<PanelGeometry>) {
    inner.update((s) => {
      const entry = ensure(s, id);
      entry.geometry = { ...entry.geometry, ...geometry };
      persist(s);
      return s;
    });
  }

  function bringToFront(id: string) {
    inner.update((s) => {
      const entry = ensure(s, id);
      // No-op when the panel is already on top — avoids needless store
      // writes on every pointerdown inside the focused panel.
      if (entry.zOrder === zCounter) return s;
      entry.zOrder = ++zCounter;
      return s;
    });
  }

  function dock(id: string)  { setMode(id, 'docked'); }
  function float(id: string) { setMode(id, 'floating'); }

  /** Reactive accessor for a single panel — components subscribe to this
   *  to avoid re-rendering on unrelated panels' changes. */
  function panel(id: string): Readable<PanelState> {
    return derived(inner, ($s) => $s[id] ?? { mode: 'docked', geometry: defaultGeometryFor(id), zOrder: 0 });
  }

  return {
    subscribe: inner.subscribe,
    setMode,
    setGeometry,
    bringToFront,
    dock,
    float,
    panel,
  };
}

export const floatingPanels = createStore();
