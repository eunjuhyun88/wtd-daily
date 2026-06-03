/**
 * surfaceMode.ts — W-0498 PR5c
 * Active internal surface in the Bottom Sheet (mobile terminal).
 * URL key: ?s=ai|intel|pat|paper|inbox  (absent / 'chart' = peek, chart active)
 * Backward-compat: ?m=judge→ai, ?m=scan→intel, ?m=detail|verdict→pat (1 release)
 * Only meaningful when viewportTier === 'MOBILE'.
 */
import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { replaceState } from '$app/navigation';

export type InternalSurface = 'chart' | 'ai' | 'intel' | 'pat' | 'paper' | 'inbox';
export type SheetState = 'peek' | 'expanded';

export interface SurfaceModeState {
  active: InternalSurface;
  sheetState: SheetState;
}

const VALID_SURFACES = new Set<InternalSurface>(['chart', 'ai', 'intel', 'pat', 'paper', 'inbox']);

const LEGACY_MAP: Record<string, InternalSurface> = {
  judge: 'ai',
  scan: 'intel',
  detail: 'pat',
  verdict: 'pat',
};

function readInitialState(): SurfaceModeState {
  if (!browser) return { active: 'chart', sheetState: 'peek' };
  const params = new URLSearchParams(window.location.search);

  const s = params.get('s');
  if (s && VALID_SURFACES.has(s as InternalSurface)) {
    const active = s as InternalSurface;
    return { active, sheetState: active === 'chart' ? 'peek' : 'expanded' };
  }

  const m = params.get('m');
  if (m && LEGACY_MAP[m]) {
    return { active: LEGACY_MAP[m], sheetState: 'expanded' };
  }

  return { active: 'chart', sheetState: 'peek' };
}

const _store = writable<SurfaceModeState>(readInitialState());

function buildUrl(surface: InternalSurface): string {
  if (!browser) return '';
  const url = new URL(window.location.href);
  if (surface === 'chart') {
    url.searchParams.delete('s');
  } else {
    url.searchParams.set('s', surface);
  }
  url.searchParams.delete('m');
  return url.pathname + url.search;
}

export const surfaceMode = {
  subscribe: _store.subscribe,

  setActive(surface: InternalSurface) {
    const sheetState: SheetState = surface === 'chart' ? 'peek' : 'expanded';
    _store.update((s) => ({ ...s, active: surface, sheetState }));
    if (browser) replaceState(buildUrl(surface), history.state ?? {});
  },

  expand() {
    _store.update((s) => ({
      ...s,
      sheetState: 'expanded',
      active: s.active === 'chart' ? 'ai' : s.active,
    }));
  },

  collapse() {
    _store.update((s) => ({ ...s, active: 'chart', sheetState: 'peek' }));
    if (browser) replaceState(buildUrl('chart'), history.state ?? {});
  },
};
