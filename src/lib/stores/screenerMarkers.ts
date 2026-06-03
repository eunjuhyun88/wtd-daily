// W-0521: Screener hit markers for chart overlay.
// SignalPanel writes here; ChartBoard reads and renders ▲ markers.

import { writable, derived } from 'svelte/store';

export interface ScreenerHit {
  timestamp: number;  // unix seconds
  price: number;
  barIso: string;
}

export interface ScreenerMarkerSet {
  symbol: string;
  timeframe: string;
  hits: ScreenerHit[];
  screenerName?: string;
}

// Keyed by `${symbol}:${timeframe}`
const _markers = writable<Map<string, ScreenerMarkerSet>>(new Map());

export const screenerMarkers = {
  subscribe: _markers.subscribe,
  set(symbol: string, timeframe: string, hits: ScreenerHit[], screenerName?: string) {
    _markers.update((m) => {
      const next = new Map(m);
      next.set(`${symbol}:${timeframe}`, { symbol, timeframe, hits, screenerName });
      return next;
    });
  },
  clear(symbol: string, timeframe: string) {
    _markers.update((m) => {
      const next = new Map(m);
      next.delete(`${symbol}:${timeframe}`);
      return next;
    });
  },
  clearAll() {
    _markers.set(new Map());
  },
  getHits(symbol: string, timeframe: string): ScreenerHit[] {
    let result: ScreenerHit[] = [];
    _markers.subscribe((m) => { result = m.get(`${symbol}:${timeframe}`)?.hits ?? []; })();
    return result;
  },
};

export function deriveHitsForChart(symbol: string, timeframe: string) {
  return derived(_markers, ($m) => $m.get(`${symbol}:${timeframe}`)?.hits ?? []);
}
