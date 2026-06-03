/**
 * GET /api/market/sparklines?symbols=BTCUSDT,ETHUSDT,...
 *
 * Returns 24h price sparkline data for crypto symbols.
 * Uses CoinGecko /coins/markets with sparkline=true (7-day, 168 pts → last 24 used for shape).
 * CoinGecko is accessible from Vercel; Binance/Bybit IPs are often blocked.
 */
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

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

// Map Binance-style symbols → CoinGecko IDs
const SYMBOL_TO_ID: Record<string, string> = {
  BTCUSDT:  'bitcoin',
  ETHUSDT:  'ethereum',
  SOLUSDT:  'solana',
  BNBUSDT:  'binancecoin',
  XRPUSDT:  'ripple',
  DOGEUSDT: 'dogecoin',
  ADAUSDT:  'cardano',
  AVAXUSDT: 'avalanche-2',
  LINKUSDT: 'chainlink',
  TRXUSDT:  'tron',
};

interface SparklineData {
  prices: number[];
  high: number;
  low: number;
  volume: number;
}

export const GET: RequestHandler = async ({ url }) => {
  const symbolsParam = url.searchParams.get('symbols') ?? '';
  const symbols = symbolsParam.split(',').map(s => s.trim().toUpperCase()).filter(s => s);

  if (symbols.length === 0) return json({ error: 'symbols required' }, { status: 400 });

  const cacheKey = symbols.sort().join(',');
  const cached = getCached<{ sparklines: Record<string, SparklineData> }>(cacheKey);
  if (cached) return json(cached, { headers: { 'Cache-Control': 'public, max-age=300' } });

  // Map requested symbols to CoinGecko IDs
  const ids = symbols.map(s => SYMBOL_TO_ID[s]).filter(Boolean);
  if (ids.length === 0) return json({ sparklines: {} });

  try {
    const qs = new URLSearchParams({
      vs_currency: 'usd',
      ids: ids.join(','),
      sparkline: 'true',
      price_change_percentage: '24h',
    });
    const res = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?${qs}`,
      { signal: AbortSignal.timeout(8000), headers: { Accept: 'application/json' } }
    );
    if (!res.ok) return json({ sparklines: {} });

    const list = await res.json() as Array<{
      id: string;
      symbol: string;
      current_price: number;
      price_change_percentage_24h: number | null;
      total_volume: number;
      high_24h: number;
      low_24h: number;
      sparkline_in_7d: { price: number[] };
    }>;

    const idToSymbol: Record<string, string> = {};
    for (const [sym, id] of Object.entries(SYMBOL_TO_ID)) idToSymbol[id] = sym;

    const sparklines: Record<string, SparklineData> = {};
    for (const coin of list) {
      const sym = idToSymbol[coin.id];
      if (!sym) continue;
      // 7-day sparkline has ~168 points; use last 24 for shape
      const all = coin.sparkline_in_7d?.price ?? [];
      const prices = all.length >= 24 ? all.slice(-24) : all;
      // Append current price so the last point is live
      if (coin.current_price && (prices[prices.length - 1] !== coin.current_price)) {
        prices.push(coin.current_price);
      }
      sparklines[sym] = {
        prices,
        high: coin.high_24h ?? Math.max(...prices),
        low: coin.low_24h ?? Math.min(...prices),
        volume: coin.total_volume ?? 0,
      };
    }

    const payload = { sparklines };
    setCache(cacheKey, payload);
    return json(payload, { headers: { 'Cache-Control': 'public, max-age=300' } });
  } catch {
    return json({ sparklines: {} });
  }
};
