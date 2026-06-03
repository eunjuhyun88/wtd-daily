import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const BINANCE = 'https://fapi.binance.com';
const VALID = /^[A-Z0-9]{2,20}$/;

interface SparklineData {
  symbol: string;
  prices: number[];
  high: number;
  low: number;
  volume: number;
}

async function fetchKlines(symbol: string): Promise<SparklineData | null> {
  try {
    const url = `${BINANCE}/fapi/v1/klines?symbol=${symbol}&interval=1h&limit=24`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;
    const prices = data.map((k: unknown[]) => parseFloat(String(k[4])));
    const highs = data.map((k: unknown[]) => parseFloat(String(k[2])));
    const lows = data.map((k: unknown[]) => parseFloat(String(k[3])));
    const volumes = data.map((k: unknown[]) => parseFloat(String(k[5])));
    return {
      symbol,
      prices,
      high: Math.max(...highs),
      low: Math.min(...lows),
      volume: volumes.reduce((a, b) => a + b, 0),
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

  const results = await Promise.allSettled(symbols.map(fetchKlines));
  const sparklines: Record<string, SparklineData> = {};
  for (const r of results) {
    if (r.status === 'fulfilled' && r.value) sparklines[r.value.symbol] = r.value;
  }
  return json({ sparklines }, { headers: { 'Cache-Control': 'public, max-age=300' } });
};
