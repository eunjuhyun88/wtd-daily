export interface IndicatorConfig {
  version: 2;
  // Technical indicators
  rsi_14: { lower: number; upper: number };
  macd: 'bull' | 'bear' | 'flat' | 'any';
  vol_z_min: number;        // vol_z_20 field; 0 = off
  atr_pct_min: number;      // atr_pct_14 field; 0 = off
  bb_width_min: number;     // bb_width field; 0 = off
  // Market context (WTD-native)
  market_trend: 'up' | 'flat' | 'down' | 'any';
  scan_phase_min: 0 | 1 | 2;
  momentum_min: number;     // momentum_score field; -3 = off
  futures_premium: { lower: number; upper: number }; // futures_premium_pct field
  updated_at: string;
}

export const DEFAULT_INDICATOR_CONFIG: IndicatorConfig = {
  version: 2,
  rsi_14: { lower: 0, upper: 100 },
  macd: 'any',
  vol_z_min: 0,
  atr_pct_min: 0,
  bb_width_min: 0,
  market_trend: 'any',
  scan_phase_min: 0,
  momentum_min: -3,
  futures_premium: { lower: -5, upper: 5 },
  updated_at: new Date().toISOString(),
};

const STORAGE_KEY_V1 = 'wtd:patterns:indicator_filter:v1';
const STORAGE_KEY = 'wtd:patterns:indicator_filter:v2';

export function loadIndicatorConfig(): IndicatorConfig {
  if (typeof localStorage === 'undefined') return DEFAULT_INDICATOR_CONFIG;
  try { localStorage.removeItem(STORAGE_KEY_V1); } catch { /* noop */ }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_INDICATOR_CONFIG;
    const parsed = JSON.parse(raw);
    if (parsed.version !== 2) return DEFAULT_INDICATOR_CONFIG;
    return parsed as IndicatorConfig;
  } catch {
    return DEFAULT_INDICATOR_CONFIG;
  }
}

export function saveIndicatorConfig(cfg: IndicatorConfig): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...cfg, updated_at: new Date().toISOString() }));
  } catch { /* quota exceeded — silent */ }
}

export function isDefaultConfig(cfg: IndicatorConfig): boolean {
  return (
    cfg.rsi_14.lower === 0 &&
    cfg.rsi_14.upper === 100 &&
    cfg.macd === 'any' &&
    cfg.vol_z_min === 0 &&
    cfg.atr_pct_min === 0 &&
    cfg.bb_width_min === 0 &&
    cfg.market_trend === 'any' &&
    cfg.scan_phase_min === 0 &&
    cfg.momentum_min === -3 &&
    cfg.futures_premium.lower === -5 &&
    cfg.futures_premium.upper === 5
  );
}

export function passesIndicatorFilter(
  snap: Record<string, unknown> | null | undefined,
  cfg: IndicatorConfig,
): boolean {
  if (!snap) return true;

  // RSI
  const rsi = snap['rsi_14'] as number | undefined;
  if (rsi != null && (rsi < cfg.rsi_14.lower || rsi > cfg.rsi_14.upper)) return false;

  // MACD
  if (cfg.macd !== 'any') {
    const hist = snap['macd_hist'] as number | undefined;
    if (hist != null) {
      if (cfg.macd === 'bull' && hist <= 0) return false;
      if (cfg.macd === 'bear' && hist >= 0) return false;
      if (cfg.macd === 'flat' && Math.abs(hist) > 0.05) return false;
    }
  }

  // Volume z-score (0 = off)
  if (cfg.vol_z_min > 0) {
    const vz = snap['vol_z_20'] as number | undefined;
    if (vz != null && vz < cfg.vol_z_min) return false;
  }

  // ATR% min (0 = off)
  if (cfg.atr_pct_min > 0) {
    const atr = snap['atr_pct_14'] as number | undefined;
    if (atr != null && atr < cfg.atr_pct_min) return false;
  }

  // BB width min (0 = off)
  if (cfg.bb_width_min > 0) {
    const bw = snap['bb_width'] as number | undefined;
    if (bw != null && bw < cfg.bb_width_min) return false;
  }

  // Market trend
  if (cfg.market_trend !== 'any') {
    const trend = snap['market_trend'] as string | undefined;
    if (trend != null && trend !== cfg.market_trend) return false;
  }

  // Scan phase min (0 = off)
  if (cfg.scan_phase_min > 0) {
    const phase = snap['scan_phase'] as number | undefined;
    if (phase != null && phase < cfg.scan_phase_min) return false;
  }

  // Momentum min (-3 = off)
  if (cfg.momentum_min > -3) {
    const mom = snap['momentum_score'] as number | undefined;
    if (mom != null && mom < cfg.momentum_min) return false;
  }

  // Futures premium range (only filter if non-default)
  if (cfg.futures_premium.lower > -5 || cfg.futures_premium.upper < 5) {
    const prem = snap['futures_premium_pct'] as number | undefined;
    if (prem != null && (prem < cfg.futures_premium.lower || prem > cfg.futures_premium.upper)) return false;
  }

  return true;
}

export function activeFilterCount(cfg: IndicatorConfig): number {
  let count = 0;
  if (cfg.rsi_14.lower > 0 || cfg.rsi_14.upper < 100) count++;
  if (cfg.macd !== 'any') count++;
  if (cfg.vol_z_min > 0) count++;
  if (cfg.atr_pct_min > 0) count++;
  if (cfg.bb_width_min > 0) count++;
  if (cfg.market_trend !== 'any') count++;
  if (cfg.scan_phase_min > 0) count++;
  if (cfg.momentum_min > -3) count++;
  if (cfg.futures_premium.lower > -5 || cfg.futures_premium.upper < 5) count++;
  return count;
}

export function configSummaryPills(cfg: IndicatorConfig): string[] {
  const pills: string[] = [];
  if (cfg.rsi_14.lower > 0 || cfg.rsi_14.upper < 100) {
    if (cfg.rsi_14.lower > 0 && cfg.rsi_14.upper < 100) pills.push(`RSI ${cfg.rsi_14.lower}–${cfg.rsi_14.upper}`);
    else if (cfg.rsi_14.lower > 0) pills.push(`RSI≥${cfg.rsi_14.lower}`);
    else pills.push(`RSI≤${cfg.rsi_14.upper}`);
  }
  if (cfg.macd !== 'any') pills.push(`MACD ${cfg.macd === 'bull' ? '↑' : cfg.macd === 'bear' ? '↓' : 'flat'}`);
  if (cfg.vol_z_min > 0) pills.push(`VolZ≥${cfg.vol_z_min.toFixed(1)}`);
  if (cfg.atr_pct_min > 0) pills.push(`ATR≥${cfg.atr_pct_min}%`);
  if (cfg.bb_width_min > 0) pills.push(`BB≥${cfg.bb_width_min.toFixed(2)}`);
  if (cfg.market_trend !== 'any') pills.push(`Trend:${cfg.market_trend}`);
  if (cfg.scan_phase_min > 0) pills.push(`Phase≥${cfg.scan_phase_min}`);
  if (cfg.momentum_min > -3) pills.push(`Mom≥${cfg.momentum_min.toFixed(1)}`);
  if (cfg.futures_premium.lower > -5 || cfg.futures_premium.upper < 5) pills.push(`Prem ${cfg.futures_premium.lower}–${cfg.futures_premium.upper}%`);
  return pills;
}
