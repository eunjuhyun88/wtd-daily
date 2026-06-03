// GET /api/daily/venue-funding?symbol=BTCUSDT — Binance/Bybit/OKX funding comparison
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { engineFetch } from '$lib/server/engineTransport';

export const config = {
  runtime: 'nodejs22.x',
  regions: ['iad1'],
  maxDuration: 15,
};

const VALID_SYMBOL = /^[A-Z0-9]{4,20}$/;

export const GET: RequestHandler = async ({ url }) => {
  const symbol = (url.searchParams.get('symbol') ?? 'BTCUSDT').toUpperCase();
  if (!VALID_SYMBOL.test(symbol)) {
    return json({ ok: false, error: 'invalid symbol' }, { status: 400 });
  }

  try {
    const res = await engineFetch(`/daily/venue-funding?symbol=${symbol}`, { method: 'GET' });
    if (!res.ok) return json({ ok: false, error: `engine ${res.status}` }, { status: 502 });
    const data = await res.json();
    return json(data, { headers: { 'Cache-Control': 'public, s-maxage=180, stale-while-revalidate=60' } });
  } catch {
    return json({ ok: false, error: 'engine unavailable' }, { status: 503 });
  }
};
