// ═══════════════════════════════════════════════════════════════
// CommunitySocialPayload — canonical type for /api/senti/social
// ═══════════════════════════════════════════════════════════════

export type CommunitySocialPayload = {
  ok: true;
  source: 'santiment' | 'lunarcrush' | 'mock';
  topic: string;
  symbol: string;
  fetchedAt: string;
  metrics: {
    volume24h: number;
    sentimentScore: number;  // -1..+1
    bullishPct: number;      // 0..100
    bearishPct: number;      // 0..100
    galaxyScore?: number;
  };
  topMentions: Array<{
    id: string;
    author: string;
    text: string;
    url?: string;
    likes?: number;
    publishedAt: string;
    sentiment?: 'bull' | 'bear' | 'neutral';
  }>;
};
