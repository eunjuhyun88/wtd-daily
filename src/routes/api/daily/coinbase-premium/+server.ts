// GET /api/daily/coinbase-premium — Coinbase CPI (institutional demand indicator)
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { engineFetch } from '$lib/server/engineTransport';

export const config = {
  runtime: 'nodejs22.x',
  regions: ['iad1'],
  maxDuration: 20,
};

export const GET: RequestHandler = async ({ url }) => {
  const days = Math.min(Number(url.searchParams.get('days') ?? '30'), 365);

  try {
    const res = await engineFetch(`/daily/coinbase-premium?days=${days}`, { method: 'GET' });
    if (!res.ok) return json({ ok: false, error: `engine ${res.status}` }, { status: 502 });
    const data = await res.json();
    return json(data, { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=300' } });
  } catch {
    return json({ ok: false, error: 'engine unavailable' }, { status: 503 });
  }
};
