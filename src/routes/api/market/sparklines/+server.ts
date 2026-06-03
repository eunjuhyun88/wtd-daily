import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const VALID = /^[A-Z0-9]{2,20}$/;

interface SparklineData {
  symbol: string;
  prices: number[];
  high: number;
  low: number;
  volume: number;
}

// Bybit v5 spot klines (Binance is geo-blocked on Vercel)
async function fetchBybit(symbol: string): Promise<SparklineData | null> {
  try {
    const url = `https://api.bybit.com/v5/market/kline?category=spot&symbol=${symbol}&interval=60&limit=24`;
    const res = await fetch(url, { signal: AbortSignal.timeout(6000), headers: { Accept: 'application/json' } });
    if (!res.ok) return null;
    const data = await res.json();
    // Bybit returns: [[startTime, open, high, low, close, volume, turnover], ...]
    // listed newest first → reverse
    const list: string[][] = data?.result?.list ?? [];
    if (!list.length) return null;
    const reversed = [...list].reverse();
    const prices = reversed.map(k => parseFloat(k[4])); // close
    const highs  = reversed.map(k => parseFloat(k[2]));
    const lows   = reversed.map(k => parseFloat(k[3]));
    const vols   = reversed.map(k => parseFloat(k[5]));
    return {
      symbol,
      prices,
      high: Math.max(...highs),
      low: Math.min(...lows),
      volume: vols.reduce((a, b) => a + b, 0),
    };
  } catch {
    return null;
  }
}

export const GET: RequestHandler = async ({ url }) => {
  const symbolsParam = url.searchParams.get('symbols') ?? '';
  const symbols = symbolsParam
    .split(',')
    .map(s => s.trim().toUpperCase())
    .filter(s => VALID.test(s))
    .slice(0, 20);

  if (symbols.length === 0) return json({ error: 'symbols required' }, { status: 400 });

  const results = await Promise.allSettled(symbols.map(fetchBybit));
  const sparklines: Record<string, SparklineData> = {};
  for (const r of results) {
    if (r.status === 'fulfilled' && r.value) sparklines[r.value.symbol] = r.value;
  }
  return json({ sparklines }, { headers: { 'Cache-Control': 'public, max-age=300' } });
};
