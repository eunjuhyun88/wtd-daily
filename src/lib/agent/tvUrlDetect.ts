/**
 * W-0500 PR1 — TradingView URL detector for chat input.
 *
 * Returns the canonical URL if `text` contains a TV idea or chart link.
 * Idea links (`/i/...` or `/x/...`) are PR1's primary target. Chart
 * links (`/chart/...?...`) are accepted but the engine pipeline may
 * reject them with 400 in PR1 — left for richer handling in a later PR.
 */

const IDEA_RE  = /\bhttps?:\/\/(?:www\.)?tradingview\.com\/(?:i|x)\/[A-Za-z0-9_-]+\/?/i;
const CHART_RE = /\bhttps?:\/\/(?:www\.)?tradingview\.com\/chart\/[A-Za-z0-9_-]+\/?(?:\?[^\s]*)?/i;

export type TvUrlKind = 'idea' | 'chart';

export interface TvUrlMatch {
  url: string;
  kind: TvUrlKind;
}

export function tvUrlDetect(text: string): TvUrlMatch | null {
  if (!text) return null;
  const idea = text.match(IDEA_RE);
  if (idea) return { url: idea[0].replace(/\/$/, ''), kind: 'idea' };
  const chart = text.match(CHART_RE);
  if (chart) return { url: chart[0].replace(/\/$/, ''), kind: 'chart' };
  return null;
}
