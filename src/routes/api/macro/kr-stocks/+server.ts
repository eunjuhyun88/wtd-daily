// ═══════════════════════════════════════════════════════════════
// Korean Top Stocks Proxy (Top 10 KOSPI by market cap)
// Yahoo Finance batch via fetchYahooSeries
// ═══════════════════════════════════════════════════════════════

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { fetchYahooSeries, type YahooSeries } from '$lib/server/yahooFinance';

const KR_TOP_TICKERS: Array<{ symbol: string; name: string }> = [
  { symbol: '005930.KS', name: '삼성전자' },
  { symbol: '000660.KS', name: 'SK하이닉스' },
  { symbol: '373220.KS', name: 'LG에너지솔루션' },
  { symbol: '005380.KS', name: '현대차' },
  { symbol: '035420.KS', name: 'NAVER' },
  { symbol: '035720.KS', name: '카카오' },
  { symbol: '051910.KS', name: 'LG화학' },
  { symbol: '207940.KS', name: '삼성바이오로직스' },
  { symbol: '005490.KS', name: 'POSCO홀딩스' },
  { symbol: '028260.KS', name: '삼성물산' },
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
      KR_TOP_TICKERS.map((t) => fetchYahooSeries(t.symbol, '1mo', '1d'))
    );
    const stocks = results.map((r, i) =>
      extractStock(r.status === 'fulfilled' ? r.value : null, KR_TOP_TICKERS[i])
    );
    return json(
      { ok: true, data: { stocks } },
      { headers: { 'Cache-Control': 'public, max-age=300' } }
    );
  } catch (error: unknown) {
    console.error('[macro/kr-stocks] error:', error);
    return json({ ok: false, error: 'Failed to fetch KR stocks' }, { status: 500 });
  }
};
