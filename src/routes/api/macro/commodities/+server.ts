// ═══════════════════════════════════════════════════════════════
// Commodities Proxy (Gold / WTI / Silver / Copper)
// Yahoo Finance futures continuous contracts
// ═══════════════════════════════════════════════════════════════

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { fetchYahooSeries, type YahooSeries } from '$lib/server/yahooFinance';

function extractLatest(series: YahooSeries | null) {
  if (!series?.points?.length) return null;
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
    const [goldRes, oilRes, silverRes, copperRes] = await Promise.allSettled([
      fetchYahooSeries('GC=F', '1mo', '1d'),
      fetchYahooSeries('CL=F', '1mo', '1d'),
      fetchYahooSeries('SI=F', '1mo', '1d'),
      fetchYahooSeries('HG=F', '1mo', '1d'),
    ]);

    const gold = goldRes.status === 'fulfilled' ? goldRes.value : null;
    const oil = oilRes.status === 'fulfilled' ? oilRes.value : null;
    const silver = silverRes.status === 'fulfilled' ? silverRes.value : null;
    const copper = copperRes.status === 'fulfilled' ? copperRes.value : null;

    return json(
      {
        ok: true,
        data: {
          gold: extractLatest(gold),
          oil: extractLatest(oil),
          silver: extractLatest(silver),
          copper: extractLatest(copper),
        },
      },
      { headers: { 'Cache-Control': 'public, max-age=300' } }
    );
  } catch (error: unknown) {
    console.error('[macro/commodities] error:', error);
    return json({ ok: false, error: 'Failed to fetch commodities' }, { status: 500 });
  }
};
