// ═══════════════════════════════════════════════════════════════
// Social API normalizers → CommunitySocialPayload
// ═══════════════════════════════════════════════════════════════

import type { CommunitySocialPayload } from '$lib/types/social';
import type { LunarCrushTopicData, LunarCrushPost } from '$lib/server/lunarcrush';

// ── Helpers ──────────────────────────────────────────────────

/**
 * Convert LunarCrush 1-5 sentiment scale to -1..+1 float.
 *   1 → -1.0  (fully bearish)
 *   3 →  0.0  (neutral)
 *   5 → +1.0  (fully bullish)
 */
function lc5ToScore(sentiment: number): number {
  return Math.min(1, Math.max(-1, (sentiment - 3) / 2));
}

/**
 * Derive rough bullish/bearish percentages from a -1..+1 score.
 * Simple linear mapping: score 0 → 50/50, score +1 → 100/0
 */
function scoreToBullBear(score: number): { bullishPct: number; bearishPct: number } {
  const bullishPct = Math.round(50 + score * 50);
  return { bullishPct, bearishPct: 100 - bullishPct };
}

function lcPostSentiment(s: number): 'bull' | 'bear' | 'neutral' {
  if (s >= 4) return 'bull';
  if (s <= 2) return 'bear';
  return 'neutral';
}

// ── LunarCrush normalizer ────────────────────────────────────

/**
 * Normalize LunarCrush topic data + posts into CommunitySocialPayload.
 *
 * @param topicData  Return value of fetchTopicSocial() — already mapped LunarCrushTopicData
 * @param posts      Return value of fetchTopicPosts() — LunarCrushPost[]
 * @param symbol     Raw symbol from query string (e.g. "BTCUSDT")
 * @param topic      Resolved topic slug (e.g. "bitcoin")
 */
export function normalizeLunarCrush(
  topicData: LunarCrushTopicData,
  posts: LunarCrushPost[],
  symbol: string,
  topic: string,
): CommunitySocialPayload {
  const sentimentScore = lc5ToScore(topicData.sentiment ?? 3);
  const { bullishPct, bearishPct } = scoreToBullBear(sentimentScore);

  const topMentions = posts.slice(0, 5).map((p) => ({
    id: p.id,
    author: p.creator,
    text: (p.body || p.title || '').slice(0, 280),
    url: p.link || undefined,
    likes: p.interactions,
    publishedAt: new Date(p.publishedAt).toISOString(),
    sentiment: lcPostSentiment(p.sentiment ?? 3),
  }));

  return {
    ok: true,
    source: 'lunarcrush',
    topic,
    symbol: symbol.toUpperCase(),
    fetchedAt: new Date().toISOString(),
    metrics: {
      volume24h: topicData.interactions24h ?? 0,
      sentimentScore,
      bullishPct,
      bearishPct,
      galaxyScore: topicData.galaxyScore,
    },
    topMentions,
  };
}

// ── Santiment normalizer ─────────────────────────────────────

/**
 * Normalize Santiment data (already mapped to LunarCrushTopicData-compatible shape)
 * into CommunitySocialPayload. Santiment has no post-level data, so topMentions = [].
 *
 * @param data    Return value of fetchSantimentSocial() — LunarCrushTopicData
 * @param symbol  Raw symbol from query string
 * @param topic   Resolved topic slug
 */
export function normalizeSantiment(
  data: LunarCrushTopicData,
  symbol: string,
  topic: string,
): CommunitySocialPayload {
  const sentimentScore = lc5ToScore(data.sentiment ?? 3);
  const { bullishPct, bearishPct } = scoreToBullBear(sentimentScore);

  return {
    ok: true,
    source: 'santiment',
    topic,
    symbol: symbol.toUpperCase(),
    fetchedAt: new Date().toISOString(),
    metrics: {
      volume24h: data.interactions24h ?? 0,
      sentimentScore,
      bullishPct,
      bearishPct,
      // galaxyScore omitted — Santiment uses a neutral 50 default; suppress
    },
    topMentions: [],
  };
}

// ── Mock fallback ────────────────────────────────────────────

/**
 * Return a zero-value mock payload when no API key is available.
 * HTTP 200 with source:'mock' so callers can render a skeleton state.
 */
export function makeMockPayload(symbol: string, topic: string): CommunitySocialPayload {
  return {
    ok: true,
    source: 'mock',
    topic,
    symbol: symbol.toUpperCase(),
    fetchedAt: new Date().toISOString(),
    metrics: {
      volume24h: 0,
      sentimentScore: 0,
      bullishPct: 0,
      bearishPct: 0,
    },
    topMentions: [],
  };
}
