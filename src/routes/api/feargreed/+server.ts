import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Simple in-memory cache
const cache = new Map<string, { data: unknown; expiresAt: number }>();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && entry.expiresAt > Date.now()) return entry.data as T;
  return null;
}
function setCache(key: string, data: unknown, ttlMs: number) {
  cache.set(key, { data, expiresAt: Date.now() + ttlMs });
}

const CACHE_TTL = 10 * 60_000; // 10 min

export const GET: RequestHandler = async ({ url }) => {
  const limitRaw = url.searchParams.get('limit') ?? '14';
  const limit = Math.max(1, Math.min(365, parseInt(limitRaw, 10) || 14));
  const cacheKey = `fg:${limit}`;
  const cached = getCached(cacheKey);
  if (cached) return json(cached, { headers: { 'Cache-Control': 'public, max-age=300' } });

  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 6000);
    const res = await fetch(`https://api.alternative.me/fng/?limit=${limit}`, {
      signal: ctrl.signal,
      headers: { Accept: 'application/json' }
    });
    clearTimeout(t);
    if (!res.ok) throw new Error(`fng ${res.status}`);
    const raw = await res.json();
    const list: unknown[] = Array.isArray(raw?.data) ? raw.data : [];

    type Point = { value: number; classification: string; timestampMs: number };
    const points: Point[] = list.flatMap((r: unknown) => {
      const v = Number((r as Record<string, unknown>)?.value);
      const ts = Number((r as Record<string, unknown>)?.timestamp);
      if (!Number.isFinite(v) || !Number.isFinite(ts)) return [];
      return [{ value: v, classification: String((r as Record<string, unknown>)?.value_classification ?? 'Unknown'), timestampMs: ts * 1000 }];
    });

    const payload = { current: points[0] ?? null, history: points, count: points.length };
    setCache(cacheKey, payload, CACHE_TTL);
    return json(payload, { headers: { 'Cache-Control': 'public, max-age=300' } });
  } catch (e) {
    return json({ error: 'fear & greed unavailable' }, { status: 502 });
  }
};
