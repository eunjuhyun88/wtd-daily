// GET /api/daily/cme-cot — CFTC CME COT institutional OI (weekly)
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { engineFetch } from '$lib/server/engineTransport';

export const config = {
  runtime: 'nodejs22.x',
  regions: ['iad1'],
  maxDuration: 20,
};

export const GET: RequestHandler = async () => {
  try {
    const res = await engineFetch('/daily/cme-cot', { method: 'GET' });
    if (!res.ok) return json({ ok: false, error: `engine ${res.status}` }, { status: 502 });
    const data = await res.json();
    return json(data, { headers: { 'Cache-Control': 'public, s-maxage=21600, stale-while-revalidate=3600' } });
  } catch {
    return json({ ok: false, error: 'engine unavailable' }, { status: 503 });
  }
};
