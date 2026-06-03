/**
 * perPaneIndicators.ts — per-pane indicator state for multi-chart grid (W-0288).
 *
 * Each pane slot maintains its own ChartIndicatorState, persisted separately
 * so that closing and re-opening a layout restores each pane's indicators.
 *
 * Usage:
 *   const store = getPaneIndicatorStore(paneId);
 *   $store.rsi   // reactive
 *   togglePaneIndicator(paneId, 'rsi');
 */

import { writable, get } from 'svelte/store';
import type { Writable } from 'svelte/store';
import { browser } from '$app/environment';
import {
  type ChartIndicatorState,
  type IndicatorKey,
  PANE_INDICATORS,
  MAX_PANE_INDICATORS,
} from './chartIndicators';

const DEFAULT_PANE_STATE: ChartIndicatorState = {
  ema: false,
  bb: false,
  vwap: false,
  vwma: false,
  atr_bands: false,
  derivatives: false,
  derivativesOverlay: false,
  cvd: false,
  macd: false,
  rsi: false,
  oi: false,
  funding: false,
  liq: false,
  volume: true,
  comparison: false,
  obv: false,
  volumeProfile: false,
};

const paneStores = new Map<number, Writable<ChartIndicatorState>>();

function storageKey(paneId: number): string {
  return `wtd.pane.indicators.${paneId}.v1`;
}

function loadPersisted(paneId: number): ChartIndicatorState {
  if (!browser) return { ...DEFAULT_PANE_STATE };
  try {
    const raw = localStorage.getItem(storageKey(paneId));
    if (!raw) return { ...DEFAULT_PANE_STATE };
    return { ...DEFAULT_PANE_STATE, ...(JSON.parse(raw) as Partial<ChartIndicatorState>) };
  } catch {
    return { ...DEFAULT_PANE_STATE };
  }
}

export function getPaneIndicatorStore(paneId: number): Writable<ChartIndicatorState> {
  if (!paneStores.has(paneId)) {
    const state = loadPersisted(paneId);
    const store = writable<ChartIndicatorState>(state);
    store.subscribe((v) => {
      if (browser) {
        try { localStorage.setItem(storageKey(paneId), JSON.stringify(v)); } catch { /**/ }
      }
    });
    paneStores.set(paneId, store);
  }
  return paneStores.get(paneId)!;
}

export function togglePaneIndicator(paneId: number, key: IndicatorKey): void {
  const store = getPaneIndicatorStore(paneId);
  store.update((s) => {
    const next = { ...s, [key]: !s[key] };
    if (next[key] && PANE_INDICATORS.includes(key)) {
      const active = PANE_INDICATORS.filter((k) => next[k]);
      if (active.length > MAX_PANE_INDICATORS) {
        for (const k of PANE_INDICATORS) {
          if (k !== key && next[k]) { next[k] = false; break; }
        }
      }
    }
    return next;
  });
}

export function resetPaneStore(paneId: number): void {
  paneStores.delete(paneId);
  if (browser) {
    try { localStorage.removeItem(storageKey(paneId)); } catch { /**/ }
  }
}
