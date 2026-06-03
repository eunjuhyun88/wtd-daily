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

async function safeJson(url: string, timeoutMs = 5000): Promise<unknown | null> {
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
    // Fetch in parallel: Upbit BTC/KRW, Binance BTC/USDT, USD/KRW
    const [upbit, binance, forex] = await Promise.all([
      safeJson('https://api.upbit.com/v1/ticker?markets=KRW-BTC'),
      safeJson('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT'),
      safeJson('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json'),
    ]);

    const upbitPrice = (upbit as { trade_price?: number }[])?.[0]?.trade_price;
    const binancePrice = parseFloat((binance as { price?: string })?.price ?? '0');
    const usdKrw = (forex as { usd?: { krw?: number } })?.usd?.krw ?? null;

    if (!upbitPrice || !binancePrice || !usdKrw) {
      return json({ ok: false, error: 'data unavailable' }, { status: 502 });
    }

    const binancePriceKrw = binancePrice * usdKrw;
    const premiumPct = ((upbitPrice / binancePriceKrw) - 1) * 100;

    const payload = {
      ok: true,
      data: {
        premium_pct: premiumPct,
        binance_btc_usdt: binancePrice,
        upbit_btc_krw: upbitPrice,
        usd_krw: usdKrw,
        ts: Date.now(),
      },
      stale: false,
    };
    setCache('kimchi', payload);
    return json(payload, { headers: { 'Cache-Control': 'public, s-maxage=60' } });
  } catch {
    return json({ ok: false, error: 'kimchi-premium unavailable' }, { status: 502 });
  }
};
