import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// ─── News Event Feed — CoinTelegraph RSS proxy ────────────────────────────────
// CryptoPanic free API was retired; replaced with CoinTelegraph RSS (free, no auth).
// Fallback: Decrypt RSS.

export interface NewsEvent {
  id: string;
  title: string;
  publishedAt: number;    // unix seconds
  url: string;
  symbols: string[];      // ['BTC', 'ETH', ...]
  sentiment: 'positive' | 'negative' | 'neutral';
  source: string;
}

let _cache: { ts: number; data: NewsEvent[]; symbol: string } | null = null;
const CACHE_TTL_MS = 300_000; // 5 minutes

const RSS_SOURCES = [
  { url: 'https://cointelegraph.com/rss', name: 'CoinTelegraph' },
  { url: 'https://decrypt.co/feed', name: 'Decrypt' },
];

function parseRssItems(xml: string, sourceName: string): NewsEvent[] {
  const items = xml.match(/<item>([\s\S]*?)<\/item>/g) ?? [];
  const events: NewsEvent[] = [];

  for (const item of items) {
    const title = (
      item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/s)?.[1] ??
      item.match(/<title>(.*?)<\/title>/s)?.[1] ?? ''
    ).trim();

    if (!title) continue;

    const pubDateStr = item.match(/<pubDate>(.*?)<\/pubDate>/s)?.[1]?.trim() ?? '';
    const publishedAt = pubDateStr ? Math.floor(new Date(pubDateStr).getTime() / 1000) : 0;
    if (!publishedAt || isNaN(publishedAt)) continue;

    const rawLink = (
      item.match(/<link><!\[CDATA\[(.*?)\]\]><\/link>/s)?.[1] ??
      item.match(/<link>(.*?)<\/link>/s)?.[1] ?? ''
    ).trim();
    const url = rawLink.split('?')[0] || rawLink;

    const guid = item.match(/<guid[^>]*>(.*?)<\/guid>/s)?.[1]?.trim() ?? '';
    const id = guid || url || String(publishedAt);

    const categories = [...item.matchAll(/<category[^>]*>([\s\S]*?)<\/category>/g)]
      .map(m => (m[1] ?? '').replace(/<!\[CDATA\[(.*?)\]\]>/, '$1').trim().toUpperCase());

    events.push({
      id,
      title,
      publishedAt,
      url,
      symbols: categories,
      sentiment: 'neutral',
      source: sourceName,
    });
  }

  return events;
}

function matchesSymbol(event: NewsEvent, symbol: string): boolean {
  if (symbol === 'BTC') return true;
  const sym = symbol.toUpperCase();
  if (event.symbols.includes(sym)) return true;
  const titleUp = event.title.toUpperCase();
  return titleUp.includes(sym) || titleUp.includes(sym.replace('USDT', ''));
}

export const GET: RequestHandler = async ({ url }) => {
  const symbolParam = (url.searchParams.get('symbol') ?? 'BTC').toUpperCase().replace('USDT', '');
  const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '20'), 50);

  if (_cache && Date.now() - _cache.ts < CACHE_TTL_MS && _cache.symbol === symbolParam) {
    return json({ events: _cache.data.slice(0, limit), cached: true });
  }

  let events: NewsEvent[] = [];
  let lastErr = '';

  for (const source of RSS_SOURCES) {
    try {
      const res = await fetch(source.url, {
        headers: { 'Accept': 'application/rss+xml, application/xml, text/xml' },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) { lastErr = `${source.name} ${res.status}`; continue; }

      const xml = await res.text();
      events = parseRssItems(xml, source.name);
      if (events.length > 0) break;
    } catch (err) {
      lastErr = err instanceof Error ? err.message : String(err);
    }
  }

  if (events.length === 0) {
    console.error('[news] All RSS sources failed:', lastErr);
    if (_cache) return json({ events: _cache.data.slice(0, limit), cached: true, stale: true });
    return json({ events: [], error: 'News feed unavailable' });
  }

  events.sort((a, b) => b.publishedAt - a.publishedAt);
  const filtered = events.filter(e => matchesSymbol(e, symbolParam));

  _cache = { ts: Date.now(), data: filtered, symbol: symbolParam };
  return json({ events: filtered.slice(0, limit), cached: false }, {
    headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60' },
  });
};
