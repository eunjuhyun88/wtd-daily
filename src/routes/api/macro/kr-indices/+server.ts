// ═══════════════════════════════════════════════════════════════
// Korean Market Indices Proxy (KOSPI, KOSDAQ)
// ═══════════════════════════════════════════════════════════════

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { fetchYahooSeries, type YahooSeries } from '$lib/server/yahooFinance';

function extractLatest(series: YahooSeries | null) {
  if (!series?.points?.length) return null;
  const pts = series.points;
  const latest = pts[pts.length - 1];
  const first = pts[0];
  // Prefer Yahoo's reported field; fall back to last vs prevClose, then last vs second-last point.
  let changePct: number | null = series.regularMarketChangePercent ?? null;
  if (changePct == null && series.previousClose && latest.close) {
    changePct = ((latest.close - series.previousClose) / series.previousClose) * 100;
  }
  if (changePct == null && pts.length >= 2) {
    const prev = pts[pts.length - 2];
    if (prev.close) changePct = ((latest.close - prev.close) / prev.close) * 100;
  }
  const spark = pts.map((p) => p.close).filter((v) => Number.isFinite(v));
  return {
    price: latest.close,
    prevClose: series.previousClose ?? null,
    changePct,
    trend1m: first ? ((latest.close - first.close) / first.close) * 100 : null,
    spark,
    updatedAt: series.updatedAt,
  };
}

export const GET: RequestHandler = async () => {
  try {
    const [kospiRes, kosdaqRes] = await Promise.allSettled([
      fetchYahooSeries('^KS11', '1mo', '1d'),
      fetchYahooSeries('^KQ11', '1mo', '1d'),
    ]);

    const kospi = kospiRes.status === 'fulfilled' ? kospiRes.value : null;
    const kosdaq = kosdaqRes.status === 'fulfilled' ? kosdaqRes.value : null;

    return json(
      {
        ok: true,
        data: {
          kospi: extractLatest(kospi),
          kosdaq: extractLatest(kosdaq),
        },
      },
      { headers: { 'Cache-Control': 'public, max-age=300' } }
    );
  } catch (error: unknown) {
    console.error('[macro/kr-indices] error:', error);
    return json({ ok: false, error: 'Failed to fetch KR indices' }, { status: 500 });
  }
};
