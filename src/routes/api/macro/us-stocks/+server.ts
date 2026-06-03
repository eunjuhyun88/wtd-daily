// ═══════════════════════════════════════════════════════════════
// US Top Stocks Proxy (Magnificent 7+)
// Yahoo Finance batch via fetchYahooSeries
// ═══════════════════════════════════════════════════════════════

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { fetchYahooSeries, type YahooSeries } from '$lib/server/yahooFinance';

const US_TOP_TICKERS: Array<{ symbol: string; name: string }> = [
  { symbol: 'AAPL', name: 'Apple' },
  { symbol: 'MSFT', name: 'Microsoft' },
  { symbol: 'NVDA', name: 'NVIDIA' },
  { symbol: 'GOOGL', name: 'Alphabet' },
  { symbol: 'META', name: 'Meta' },
  { symbol: 'AMZN', name: 'Amazon' },
  { symbol: 'TSLA', name: 'Tesla' },
];

function extractStock(series: YahooSeries | null, ticker: { symbol: string; name: string }) {
  if (!series?.points?.length) {
    return { symbol: ticker.symbol, name: ticker.name, price: null, prevClose: null, changePct: null, volume: null, spark: [] as number[], trend1m: null };
  }
  const pts = series.points;
  const latest = pts[pts.length - 1];
  const first = pts[0];
  let changePct: number | null = series.regularMarketChangePercent ?? null;
  if (changePct == null && series.previousClose && latest.close) {
    changePct = ((latest.close - series.previousClose) / series.previousClose) * 100;
  }
  if (changePct == null && pts.length >= 2) {
    const prev = pts[pts.length - 2];
    if (prev.close) changePct = ((latest.close - prev.close) / prev.close) * 100;
  }
  const spark = pts.map((p) => p.close).filter((v) => Number.isFinite(v));
  const trend1m = first?.close ? ((latest.close - first.close) / first.close) * 100 : null;
  return {
    symbol: ticker.symbol,
    name: ticker.name,
    price: latest.close,
    prevClose: series.previousClose ?? null,
    changePct,
    volume: latest.volume ?? null,
    spark,
    trend1m,
    updatedAt: series.updatedAt,
  };
}

export const GET: RequestHandler = async () => {
  try {
    const results = await Promise.allSettled(
      US_TOP_TICKERS.map((t) => fetchYahooSeries(t.symbol, '1mo', '1d'))
    );
    const stocks = results.map((r, i) =>
      extractStock(r.status === 'fulfilled' ? r.value : null, US_TOP_TICKERS[i])
    );
    return json(
      { ok: true, data: { stocks } },
      { headers: { 'Cache-Control': 'public, max-age=60' } }
    );
  } catch (error: unknown) {
    console.error('[macro/us-stocks] error:', error);
    return json({ ok: false, error: 'Failed to fetch US stocks' }, { status: 500 });
  }
};
