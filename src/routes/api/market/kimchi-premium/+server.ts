import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const CACHE_TTL = 60_000;
const cache = new Map<string, { data: unknown; expiresAt: number }>();
function getCached<T>(key: string): T | null {
  const e = cache.get(key);
  if (e && e.expiresAt > Date.now()) return e.data as T;
  return null;
}
function setCache(key: string, data: unknown) {
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL });
}

async function safeJson(url: string, timeoutMs = 6000): Promise<unknown | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs), headers: { Accept: 'application/json' } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export const GET: RequestHandler = async () => {
  const cached = getCached<unknown>('kimchi');
  if (cached) return json(cached, { headers: { 'Cache-Control': 'public, s-maxage=60' } });

  try {
    const [upbit, coingecko, forex] = await Promise.all([
      safeJson('https://api.upbit.com/v1/ticker?markets=KRW-BTC'),
      // CoinGecko simple price — no key needed
      safeJson('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd'),
      safeJson('https://open.er-api.com/v6/latest/USD'),
    ]);

    const upbitPrice: number | undefined = (upbit as Array<{ trade_price?: number }>)?.[0]?.trade_price;
    const btcUsd: number | undefined = (coingecko as { bitcoin?: { usd?: number } })?.bitcoin?.usd;
    const usdKrw: number | undefined = (forex as { rates?: { KRW?: number } })?.rates?.KRW ?? undefined;

    if (!upbitPrice || !btcUsd || !usdKrw) {
      return json({ ok: false, error: 'data unavailable' }, { status: 502 });
    }

    const btcUsdInKrw = btcUsd * usdKrw;
    const premiumPct = ((upbitPrice / btcUsdInKrw) - 1) * 100;

    const payload = {
      ok: true,
      data: {
        premium_pct: premiumPct,
        binance_btc_usdt: btcUsd,
        upbit_btc_krw: upbitPrice,
        usd_krw: usdKrw,
        ts: Date.now(),
      },
      stale: false,
    };
    setCache('kimchi', payload);
    return json(payload, { headers: { 'Cache-Control': 'public, s-maxage=60' } });
  } catch (e) {
    return json({ ok: false, error: String(e) }, { status: 502 });
  }
};
