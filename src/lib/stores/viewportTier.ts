/**
 * viewportTier.ts
 * SSR-safe store that exposes the current responsive tier.
 *
 * Breakpoints per W-0087:
 *   MOBILE  < 768px
 *   TABLET  768px – 1279px
 *   DESKTOP >= 1280px
 *
 * W-0474: SSR seeds <html data-vp-tier="..."> from cookie + User-Agent in
 * hooks.server.ts (transformPageChunk). On browser module-load we read that
 * attribute so the very first store value matches SSR, then reconcile against
 * real window dimensions. Eliminates the desktop-grid flash that leaked into
 * mobile viewports before hydration on /cogochi.
 */

import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type ViewportTier = 'MOBILE' | 'TABLET' | 'DESKTOP';

export interface ViewportTierState {
  tier: ViewportTier;
  width: number;
  height: number;
}

function getTier(width: number): ViewportTier {
  if (width < 768) return 'MOBILE';
  if (width < 1280) return 'TABLET';
  return 'DESKTOP';
}

const TIER_NOMINAL_WIDTH: Record<ViewportTier, number> = {
  MOBILE: 390,
  TABLET: 1024,
  DESKTOP: 1440,
};

const VALID_TIERS: ReadonlySet<ViewportTier> = new Set(['MOBILE', 'TABLET', 'DESKTOP']);

function readSsrTier(): ViewportTier | null {
  if (!browser) return null;
  const raw = document.documentElement.dataset.vpTier;
  return raw && VALID_TIERS.has(raw as ViewportTier) ? (raw as ViewportTier) : null;
}

function initialState(): ViewportTierState {
  const ssrTier = readSsrTier();
  if (ssrTier) {
    return {
      tier: ssrTier,
      width: TIER_NOMINAL_WIDTH[ssrTier],
      height: browser ? window.innerHeight || 900 : 900,
    };
  }
  return { tier: 'DESKTOP', width: TIER_NOMINAL_WIDTH.DESKTOP, height: 900 };
}

const { subscribe, set } = writable<ViewportTierState>(initialState());

let listenersAttached = false;

function syncFromWindow() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  set({ tier: getTier(w), width: w, height: h });
}

function ensureListeners() {
  if (listenersAttached || !browser) return;
  window.addEventListener('resize', syncFromWindow, { passive: true });
  window.addEventListener('orientationchange', syncFromWindow, { passive: true });
  listenersAttached = true;
}

if (browser) {
  // The store was seeded from the SSR data-vp-tier attribute above. Reconcile
  // with the real window dimensions on the next microtask so any tier mismatch
  // (e.g. cookie stale, UA fallback wrong) self-corrects, but the very first
  // subscriber read still sees the SSR-matched tier.
  queueMicrotask(syncFromWindow);
  ensureListeners();
}

export const viewportTier = { subscribe };
