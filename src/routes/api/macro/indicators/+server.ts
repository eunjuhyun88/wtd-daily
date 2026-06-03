import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const YAHOO = 'https://query1.finance.yahoo.com/v8/finance/chart';
const CACHE_TTL = 5 * 60_000;
const cache = new Map<string, { data: unknown; expiresAt: number }>();

function getCached<T>(key: string): T | null {
  const e = cache.get(key);
  if (e && e.expiresAt > Date.now()) return e.data as T;
  return null;
}
function setCache(key: string, data: unknown) {
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL });
}

interface SeriesResult {
  price: number | null;
  prevClose: number | null;
  changePct: number | null;
  trend1m: number | null;
  spark: number[];
}

async function fetchYahoo(symbol: string): Promise<SeriesResult | null> {
  const cacheKey = `yahoo:${symbol}`;
  const cached = getCached<SeriesResult>(cacheKey);
  if (cached) return cached;

  try {
    const qs = new URLSearchParams({ range: '1mo', interval: '1d', includePrePost: 'false' });
    const res = await fetch(`${YAHOO}/${encodeURIComponent(symbol)}?${qs}`, {
      signal: AbortSignal.timeout(8000),
      headers: { Accept: 'application/json', 'User-Agent': 'Mozilla/5.0' }
    });
    if (!res.ok) return null;
    const raw = await res.json();
    const meta = raw?.chart?.result?.[0]?.meta;
    const closes = raw?.chart?.result?.[0]?.indicators?.quote?.[0]?.close ?? [];
    const validCloses: number[] = closes.filter((v: unknown) => typeof v === 'number' && Number.isFinite(v));
    if (!validCloses.length) return null;

    const price = meta?.regularMarketPrice ?? validCloses[validCloses.length - 1];
    const prevClose = meta?.chartPreviousClose ?? meta?.previousClose ?? null;
    const changePct = meta?.regularMarketChangePercent ?? (prevClose && price ? ((price - prevClose) / prevClose) * 100 : null);
    const trend1m = validCloses[0] ? ((price - validCloses[0]) / validCloses[0]) * 100 : null;
    const result: SeriesResult = { price, prevClose, changePct, trend1m, spark: validCloses };
    setCache(cacheKey, result);
    return result;
  } catch {
    return null;
  }
}

export const GET: RequestHandler = async () => {
  const [dxy, spx, us10y] = await Promise.allSettled([
    fetchYahoo('DX-Y.NYB'),
    fetchYahoo('%5EGSPC'),
    fetchYahoo('%5ETNX'),
  ]);
  return json(
    {
      ok: true,
      data: {
        dxy: dxy.status === 'fulfilled' ? dxy.value : null,
        spx: spx.status === 'fulfilled' ? spx.value : null,
        us10y: us10y.status === 'fulfilled' ? us10y.value : null,
      }
    },
    { headers: { 'Cache-Control': 'public, max-age=300' } }
  );
};
