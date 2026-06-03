/**
 * GET /api/daily/venue-funding?symbol=BTCUSDT
 * Multi-exchange perpetual funding rate comparison.
 * Fetches directly from Bybit, OKX public APIs (no engine dependency).
 */
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const CACHE_TTL = 3 * 60_000;
const cache = new Map<string, { data: unknown; expiresAt: number }>();
function getCached<T>(key: string): T | null {
  const e = cache.get(key);
  if (e && e.expiresAt > Date.now()) return e.data as T;
  return null;
}
function setCache(key: string, data: unknown) {
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL });
}

async function safeJson(url: string, timeoutMs = 5000): Promise<unknown | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs), headers: { Accept: 'application/json' } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

const VALID_SYMBOL = /^[A-Z0-9]{4,20}$/;

export const GET: RequestHandler = async ({ url }) => {
  const symbol = (url.searchParams.get('symbol') ?? 'BTCUSDT').toUpperCase();
  if (!VALID_SYMBOL.test(symbol)) return json({ ok: false, error: 'invalid symbol' }, { status: 400 });

  const cacheKey = `vf:${symbol}`;
  const cached = getCached<unknown>(cacheKey);
  if (cached) return json(cached, { headers: { 'Cache-Control': 'public, s-maxage=180' } });

  const okxSymbol = symbol.replace('USDT', '-USDT-SWAP');

  const [bybit, okx] = await Promise.all([
    safeJson(`https://api.bybit.com/v5/market/funding/history?category=linear&symbol=${symbol}&limit=1`),
    safeJson(`https://www.okx.com/api/v5/public/funding-rate?instId=${okxSymbol}`),
  ]);

  const bybitRate = parseFloat(
    (bybit as { result?: { list?: Array<{ fundingRate?: string }> } })?.result?.list?.[0]?.fundingRate ?? 'NaN'
  );
  const okxRate = parseFloat(
    (okx as { data?: Array<{ fundingRate?: string }> })?.data?.[0]?.fundingRate ?? 'NaN'
  );

  const rates: number[] = [bybitRate, okxRate].filter(Number.isFinite);
  if (rates.length === 0) {
    return json({ ok: false, error: 'funding rates unavailable' }, { status: 502 });
  }

  const avg = rates.reduce((a, b) => a + b, 0) / rates.length;
  const spread = rates.length >= 2 ? Math.max(...rates) - Math.min(...rates) : null;

  const payload = {
    ok: true,
    symbol,
    binance: null,
    bybit: Number.isFinite(bybitRate) ? bybitRate : null,
    okx: Number.isFinite(okxRate) ? okxRate : null,
    avg,
    spread,
  };
  setCache(cacheKey, payload);
  return json(payload, { headers: { 'Cache-Control': 'public, s-maxage=180' } });
};
