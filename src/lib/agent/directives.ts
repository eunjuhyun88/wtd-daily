/**
 * Agent directive parser — extracts structured card tokens from LLM text.
 *
 * Format: <directive type="verdict_card" payload={"key":"val"}/>
 * Falls back to raw text if payload JSON is malformed.
 */

export type DirectiveType = 'verdict_card' | 'similarity_card' | 'passport_card' | 'tv_fit_card' | 'signal_card' | 'dex_card' | 'position_verdict_card' | 'flow_card' | 'alert_card';

export interface VerdictCardPayload {
  symbol: string;
  direction: 'LONG' | 'SHORT' | 'NEUTRAL';
  p_win: number;         // 0–1
  capture_id?: string;
  timeframe?: string;
}

export interface SimilarityCardPayload {
  symbol: string;
  similar_patterns: Array<{
    id: string;
    symbol: string;
    timeframe: string;
    outcome: string;
    p_win: number;
  }>;
}

export interface PassportCardPayload {
  username: string;
  accuracy: number;    // 0–1
  streak: number;
  total_verdicts: number;
}

export interface TvFitCardPayload {
  asset: string;
  timeframe: string;
  author_handle: string;
  author_display_name: string | null;
  idea_excerpt: string;
  fits: Array<{
    pattern_slug: string;
    pattern_name: string;
    similarity: number;       // 0–1
    direction_match: boolean;
  }>;
  author_score: {
    hit_rate_24h: number | null;
    brier: number | null;
    n_ideas_30d: number;
    tier: 'S' | 'A' | 'B' | 'unknown';
  } | null;
  source_url: string;
}

export interface SignalCardPayload {
  symbol: string;
  score_100: number;
  sub_scores: Record<string, number>;
  filter_tags: string[];
  scenario: string;
  key_levels: { entry_low: number; entry_high: number; sl: number };
  direction: 'long' | 'short';
  timeframe?: string;
}

export interface DexTxnSlot {
  buys: number;
  sells: number;
  buy_ratio: number | null;
}

export interface DexFollowUp {
  n: number;
  label: string;
  prompt: string;
}

export interface DexCardPayload {
  name: string;
  symbol: string;
  chain: string;
  price_usd: number;
  liquidity_usd: number;
  is_honeypot: boolean;
  sell_tax: number;
  buy_tax?: number;
  top10_holder_percent: number | null;
  holder_count?: number | null;
  address?: string;
  dex?: string;
  // per-timeframe data (from dex_scan tool result)
  txns?: { m5?: DexTxnSlot; h1?: DexTxnSlot; h6?: DexTxnSlot; h24?: DexTxnSlot };
  volume?: { m5?: number; h1?: number; h6?: number; h24?: number };
  // interactive follow-up options
  follow_ups?: DexFollowUp[];
  // legacy single-value fields kept for backward compat
  buy_ratio_h1?: number | null;
  volume_h24?: number;
}

export interface PositionVerdictCardPayload {
  symbol: string;
  direction: 'long' | 'short';
  entry_price: number;
  current_price: number;
  leverage?: number;
  pnl_pct: number;
  action: 'HOLD' | 'PARTIAL_TP' | 'TIGHT_SL' | 'ADD_POSITION' | 'CUT_LOSS';
  urgency: number;
  confidence: number;
  reason: string;
  action_levels: {
    tp_price?: number; tp_pct?: number; new_sl?: number; new_sl_pct?: number; tp2?: number;
    add_price?: number; add_pct?: number; expected_avg?: number;
    exit_price?: number; loss_pct?: number;
    sl?: number; tp1?: number;
  };
  level_map: {
    poc?: number | null; vah?: number | null; val?: number | null;
    vwap?: number | null; entry?: number | null;
    day_high?: number | null; day_low?: number | null;
  };
  supply_snapshot: {
    buy_ratio_1h?: number | null; buy_ratio_4h?: number | null;
    cvd_z_1h?: number | null; cvd_z_4h?: number | null;
    ls_ratio?: number | null; funding_rate?: number | null;
  };
  signals?: string[];
  timeframe?: string;
}

export interface FlowLayerH1 {
  buy_usd: number;
  sell_usd: number;
  buy_ratio: number;
}

export interface FlowChain {
  chain: string;
  dex?: string;
  liquidity_usd?: number;
  h1: FlowLayerH1;
}

export interface FlowExchange {
  available?: boolean;
  exchange: string;
  symbol: string;
  price?: number;
  h1: FlowLayerH1;
}

export interface FlowCardPayload {
  name: string;
  symbol: string;
  query: string;
  total: FlowLayerH1;
  dex?: {
    chains: FlowChain[];
    totals: { h1: FlowLayerH1 };
  };
  perp?: {
    exchanges: FlowExchange[];
  };
}

export type AlertEventType = 'trade' | 'liq' | 'oi_spike';
export type AlertTier = 'sm' | 'md' | 'lg' | 'xl';
export type AlertDirection = 'buy' | 'sell' | 'long_liq' | 'short_liq' | 'oi_long' | 'oi_short';

export interface AlertEvent {
  id: string;
  type: AlertEventType;
  symbol: string;
  size_usd: number;
  tier: AlertTier;
  direction: AlertDirection;
  ts: number;
  exchange: string;
  price?: number;
  delta_pct?: number;
  oi_usd?: number;
}

export interface AlertCardPayload {
  query_symbols: string[];
  lookback_min: number;
  events: AlertEvent[];
  summary: {
    total_liq_usd: number;
    total_buy_usd: number;
    total_sell_usd: number;
    dominant_direction: 'buy' | 'sell' | 'neutral';
  };
}

export type DirectivePayload =
  | VerdictCardPayload
  | SimilarityCardPayload
  | PassportCardPayload
  | TvFitCardPayload
  | SignalCardPayload
  | DexCardPayload
  | PositionVerdictCardPayload
  | FlowCardPayload
  | AlertCardPayload;

export interface Directive {
  type: DirectiveType;
  payload: DirectivePayload;
}

export interface TextSegment  { kind: 'text';      text: string; }
export interface CardSegment  { kind: 'directive';  directive: Directive; }
export type Segment = TextSegment | CardSegment;

/** Scan from `start` (pointing at `{` or `[`) until the matching close brace,
 *  respecting JSON string quoting/escaping. Returns the index AFTER the close,
 *  or -1 if unbalanced. Inputs trusted only inside string literals. */
function scanJsonValue(raw: string, start: number): number {
  const open = raw[start];
  const close = open === '{' ? '}' : open === '[' ? ']' : '';
  if (!close) return -1;
  let depth = 0;
  let inStr = false;
  let escape = false;
  for (let i = start; i < raw.length; i++) {
    const c = raw[i];
    if (inStr) {
      if (escape) { escape = false; continue; }
      if (c === '\\') { escape = true; continue; }
      if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') { inStr = true; continue; }
    if (c === '{' || c === '[') depth++;
    else if (c === '}' || c === ']') {
      depth--;
      if (depth === 0) return i + 1;
    }
  }
  return -1;
}

/** Parse LLM output into interleaved text/card segments. */
export function parseDirectives(raw: string): Segment[] {
  const HEAD = /<directive\s+type="([^"]+)"\s+payload=/g;
  const out: Segment[] = [];
  let last = 0;
  let m: RegExpExecArray | null;

  while ((m = HEAD.exec(raw)) !== null) {
    const headStart = m.index;
    const payloadStart = HEAD.lastIndex;
    const payloadEnd = scanJsonValue(raw, payloadStart);
    if (payloadEnd < 0) continue;

    // Expect optional whitespace then "/>"
    const tail = raw.slice(payloadEnd).match(/^\s*\/>/);
    if (!tail) continue;
    const tagEnd = payloadEnd + tail[0].length;

    if (headStart > last) {
      out.push({ kind: 'text', text: raw.slice(last, headStart) });
    }
    const payloadStr = raw.slice(payloadStart, payloadEnd);
    try {
      const payload = JSON.parse(payloadStr) as DirectivePayload;
      out.push({ kind: 'directive', directive: { type: m[1] as DirectiveType, payload } });
    } catch {
      out.push({ kind: 'text', text: raw.slice(headStart, tagEnd) });
    }
    last = tagEnd;
    HEAD.lastIndex = tagEnd;
  }

  if (last < raw.length) out.push({ kind: 'text', text: raw.slice(last) });
  return out.length ? out : [{ kind: 'text', text: raw }];
}
