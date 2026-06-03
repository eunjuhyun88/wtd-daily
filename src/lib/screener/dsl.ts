// Block ↔ DSL conversion for the screener condition form.

export type Operator = '<' | '<=' | '>' | '>=' | '==' | '!=';

export interface ConditionBlock {
  indicator: string;
  operator: Operator;
  value: number;
}

export const KNOWN_INDICATORS = [
  'rsi14', 'vol_zscore', 'macd_hist', 'ema20_slope', 'ema50_slope',
  'price_vs_ema50', 'atr_pct', 'bb_width', 'bb_position', 'vol_ratio_3',
  'obv_slope', 'funding_rate', 'oi_change_1h', 'oi_change_24h',
  'long_short_ratio', 'taker_buy_ratio_1h', 'rsi14_slope', 'roc_10',
] as const;

export const OPERATORS: Operator[] = ['<', '<=', '>', '>=', '==', '!='];

export function blocksToString(blocks: ConditionBlock[]): string {
  if (!blocks.length) return '';
  return blocks
    .map((b) => `${b.indicator} ${b.operator} ${b.value}`)
    .join(' AND ');
}

export function stringToBlocks(dsl: string): ConditionBlock[] {
  if (!dsl.trim()) return [];
  const parts = dsl.trim().split(/\s+AND\s+/i);
  const blocks: ConditionBlock[] = [];
  for (const part of parts) {
    const m = part.trim().match(/^(\S+)\s*(<=|>=|==|!=|<|>)\s*(\S+)$/);
    if (!m) continue;
    const value = parseFloat(m[3]);
    if (isNaN(value)) continue;
    blocks.push({ indicator: m[1], operator: m[2] as Operator, value });
  }
  return blocks;
}
