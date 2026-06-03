// W-0521 PR3: CryptoPanic news → LWC chart marker overlay
import { writable, get } from 'svelte/store';
import type { SeriesMarker, UTCTimestamp } from 'lightweight-charts';

interface NewsMarkerSet {
  markers: SeriesMarker<UTCTimestamp>[];
  loadedAt: number;
}

const CACHE_TTL_MS = 300_000; // 5 min — matches server-side cache
const _store = writable<Map<string, NewsMarkerSet>>(new Map());
const _inflight = new Set<string>();

export const newsMarkersStore = {
  subscribe: _store.subscribe,

  async load(symbol: string, tf: string, tfMinutes: number): Promise<void> {
    const key = `${symbol}:${tf}`;
    const current = get(_store).get(key);
    if (current && Date.now() - current.loadedAt < CACHE_TTL_MS) return;
    if (_inflight.has(key)) return;
    _inflight.add(key);

    try {
      const sym = symbol.replace(/USDT$/i, '');
      const res = await fetch(`/api/cogochi/news?symbol=${sym}&limit=50`);
      if (!res.ok) return;
      const data = await res.json() as { events?: Array<{ publishedAt: number; sentiment: string; title: string }> };
      const events = data.events ?? [];
      const tfSec = tfMinutes * 60;

      const markers: SeriesMarker<UTCTimestamp>[] = events.map((e) => {
        const barTime = (Math.floor(e.publishedAt / tfSec) * tfSec) as UTCTimestamp;
        const color =
          e.sentiment === 'positive' ? '#4ade80' :
          e.sentiment === 'negative' ? '#f87171' :
          '#94a3b8';
        return {
          time: barTime,
          position: 'aboveBar' as const,
          color,
          shape: 'circle' as const,
          text: '●',
          size: 1,
        };
      });

      _store.update((m) => {
        const next = new Map(m);
        next.set(key, { markers, loadedAt: Date.now() });
        return next;
      });
    } catch {
      // silently ignore — news markers are non-critical
    } finally {
      _inflight.delete(key);
    }
  },

  getMarkers(symbol: string, tf: string): SeriesMarker<UTCTimestamp>[] {
    return get(_store).get(`${symbol}:${tf}`)?.markers ?? [];
  },
};
